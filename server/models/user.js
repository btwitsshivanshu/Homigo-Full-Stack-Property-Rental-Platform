const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['owner', 'customer', 'admin'], default: 'customer', index: true },
        isVerified: { type: Boolean, default: false },
        otpCodeHash: { type: String },
        otpExpiresAt: { type: Date },
        // KYC fields (owner verification with Aadhaar)
        kycStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified', index: true },
        kycDocs: [
            {
                type: { type: String, enum: ['aadhaar'], required: true },
                url: { type: String, required: true },
                filename: { type: String },
                uploadedAt: { type: Date, default: Date.now },
            }
        ],
        kycNotes: { type: String },
        kycVerifiedAt: { type: Date },
        kycVerifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

UserSchema.methods.setPassword = async function (password) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
};

UserSchema.methods.validatePassword = function (password) {
    // Gracefully handle legacy users who don't have a bcrypt passwordHash yet
    if (!password || !this.passwordHash) return Promise.resolve(false);
    return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.otpCodeHash;
    delete obj.otpExpiresAt;
    return obj;
};

// Ensure legacy documents always have a role
UserSchema.pre('save', function(next) {
    if (!this.role) this.role = 'customer';
    next();
});

module.exports = mongoose.model('User', UserSchema);