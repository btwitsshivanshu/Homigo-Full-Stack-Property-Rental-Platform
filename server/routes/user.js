const express=require("express");
const router=express.Router();
const { signup, login, logout, me, verifyOtp, resendOtp } = require("../controllers/users.js");
const { verifyJWT } = require('../middleware/auth');
const User = require('../models/user');

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout); // no-op for JWT, client discards token
router.get("/me", verifyJWT, me);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// One-time admin bootstrap using a shared secret from env
router.post('/bootstrap-admin', async (req, res) => {
	try {
		const { secret, username, email, password } = req.body;
		if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		if (!username || !email || !password) {
			return res.status(400).json({ message: 'username, email, password required' });
		}
		const existingAdmin = await User.findOne({ role: 'admin' });
		if (existingAdmin) {
			return res.status(409).json({ message: 'Admin already exists' });
		}
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(409).json({ message: 'Username or email already in use' });
		}
		const admin = new User({ username, email, role: 'admin', passwordHash: 'temp' });
		await admin.setPassword(password);
		admin.isVerified = true;
		await admin.save();
		res.status(201).json({ message: 'Admin created' });
	} catch (e) {
		res.status(500).json({ message: e.message || 'Internal server error' });
	}
});

module.exports = router;