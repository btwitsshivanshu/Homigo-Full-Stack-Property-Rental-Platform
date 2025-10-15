const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const { verifyJWT, requireRole } = require('../middleware/auth');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');

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
  res.json({ message: 'KYC rejected', kycStatus: user.kycStatus });
}));

module.exports = router;
