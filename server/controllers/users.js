const User = require("../models/user.js");
const { signToken } = require('../middleware/auth');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');

module.exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email and password are required' });
        }
        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin signup is disabled' });
        }
        const userRole = role === 'owner' ? 'owner' : 'customer';
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(409).json({ message: 'Username or email already in use' });
        }
        const user = new User({ username, email, role: userRole, passwordHash: 'temp' });
        await user.setPassword(password);
        // Generate OTP for verification
        const otp = generateOtp(6);
        user.otpCodeHash = await hashOtp(otp);
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        // Send OTP (or log in dev)
        await sendOtpEmail(email, otp);
        return res.status(201).json({ step: 'verify-otp', user: user.toJSON(), message: 'OTP sent to email' });
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Internal server error' });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        console.log('Login attempt:', { usernameOrEmail, passwordLength: password?.length });
        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: 'usernameOrEmail and password are required' });
        }
        const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
        console.log('User found:', user ? `Yes (${user.username})` : 'No');
        if (!user) return res.status(401).json({ message: 'Invalid credentials - User not found' });
        const ok = await user.validatePassword(password);
        console.log('Password valid:', ok);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
        // Backfill default role for legacy users without a role
        if (!user.role) {
            user.role = 'customer';
        }
        // Generate OTP for login verification
        const otp = generateOtp(6);
        user.otpCodeHash = await hashOtp(otp);
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOtpEmail(user.email, otp);
        return res.status(200).json({ step: 'verify-otp', user: user.toJSON(), message: 'OTP sent to email' });
    } catch (e) {
        console.error('Login error:', e);
        return res.status(500).json({ message: e.message || 'Internal server error' });
    }
};

module.exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user: user.toJSON() });
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Internal server error' });
    }
};

module.exports.logout = async (_req, res) => {
    return res.status(200).json({ message: 'Logged out. Client should discard token.' });
};

// Verify OTP for signup or login and issue JWT
module.exports.verifyOtp = async (req, res) => {
    try {
        const { usernameOrEmail, otp } = req.body;
        if (!usernameOrEmail || !otp) {
            return res.status(400).json({ message: 'usernameOrEmail and otp are required' });
        }
        const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
        if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP not requested or expired' });
        }
        if (user.otpExpiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        const ok = await verifyOtp(otp, user.otpCodeHash);
        if (!ok) return res.status(401).json({ message: 'Invalid OTP' });
        // Clear OTP, mark verified (for signup) and issue JWT
        user.otpCodeHash = undefined;
        user.otpExpiresAt = undefined;
        if (!user.isVerified) user.isVerified = true;
        // Ensure role exists for legacy users
        if (!user.role) user.role = 'customer';
        await user.save();
        const token = signToken(user);
        return res.status(200).json({ token, user: user.toJSON() });
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Internal server error' });
    }
}

// Resend OTP with 60s cooldown
module.exports.resendOtp = async (req, res) => {
    try {
        const { usernameOrEmail } = req.body;
        if (!usernameOrEmail) return res.status(400).json({ message: 'usernameOrEmail is required' });
        const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Cooldown: if otpExpiresAt exists, allow resend if at least 60s passed since last send
        const lastSet = user.updatedAt?.getTime?.() || 0;
        if (Date.now() - lastSet < 60 * 1000) {
            return res.status(429).json({ message: 'Please wait before requesting another OTP' });
        }
        const otp = generateOtp(6);
        user.otpCodeHash = await hashOtp(otp);
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOtpEmail(user.email, otp);
        return res.json({ message: 'OTP resent' });
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Internal server error' });
    }
}