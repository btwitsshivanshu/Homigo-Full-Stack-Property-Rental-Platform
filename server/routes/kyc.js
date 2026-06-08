const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const { verifyJWT, requireRole } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const { sendMail } = require('../utils/mailer');

// Owner: Upload Aadhaar image(s) and submit for verification
router.post('/owner/upload', verifyJWT, requireRole('owner'), upload.array('aadhaar', 2), wrapAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Aadhaar image required' });
  const user = await User.findById(req.user.id);
  user.kycDocs = req.files.map(f => ({ type: 'aadhaar', url: f.path, filename: f.filename }));
  user.kycStatus = 'pending';
  await user.save();
  res.json({ message: 'KYC submitted', kycStatus: user.kycStatus, kycDocs: user.kycDocs });
}));

// Owner: View KYC status
router.get('/owner/status', verifyJWT, requireRole('owner'), wrapAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('kycStatus kycNotes kycDocs kycVerifiedAt');
  res.json({ kycStatus: user.kycStatus, kycNotes: user.kycNotes, kycDocs: user.kycDocs, kycVerifiedAt: user.kycVerifiedAt });
}));

// Admin: List pending KYC
router.get('/admin/pending', verifyJWT, requireRole('admin'), wrapAsync(async (_req, res) => {
  const users = await User.find({ kycStatus: 'pending', role: 'owner' }).select('username email kycDocs updatedAt');
  res.json({ users });
}));

// Admin: Approve
router.post('/admin/:userId/approve', verifyJWT, requireRole('admin'), wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.kycStatus = 'verified';
  user.kycVerifiedAt = new Date();
  user.kycVerifiedBy = req.user.id;
  user.kycNotes = undefined;
  await user.save();

  // Send approval email (fire-and-forget)
  const approvalEmail = `
    <h2>KYC Verification Approved ✅</h2>
    <p>Dear ${user.username},</p>
    <p>Congratulations! Your KYC verification has been successfully approved.</p>
    <p>You can now list properties on Homigo and start earning.</p>
    <p>Thank you for joining us!</p>
    <p><strong>Homigo Team</strong></p>
  `;
  sendMail(user.email, 'KYC Verification Approved', approvalEmail);

  res.json({ message: 'KYC verified', kycStatus: user.kycStatus });
}));

// Admin: Reject
router.post('/admin/:userId/reject', verifyJWT, requireRole('admin'), wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.kycStatus = 'rejected';
  user.kycNotes = reason || 'Rejected';
  await user.save();

  // Send rejection email (fire-and-forget)
  const rejectionEmail = `
    <h2>KYC Verification Not Approved ⚠️</h2>
    <p>Dear ${user.username},</p>
    <p>Your KYC verification has been reviewed and unfortunately could not be approved at this time.</p>
    <h3>Reason for rejection:</h3>
    <p>${user.kycNotes}</p>
    <p>Please address the issues and resubmit your KYC documents for another review.</p>
    <p>If you have questions, please contact our support team.</p>
    <p><strong>Homigo Team</strong></p>
  `;
  sendMail(user.email, 'KYC Verification Status - Resubmission Required', rejectionEmail);

  res.json({ message: 'KYC rejected', kycStatus: user.kycStatus });
}));

module.exports = router;
