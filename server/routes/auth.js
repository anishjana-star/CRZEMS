import express from 'express';
import { auth } from '../middleware/auth.js';
import { login, getCurrentUser, changePassword, updateEmail } from '../controllers/authController.js';

const router = express.Router();

// Login
router.post('/login', login);

// Get current user
router.get('/me', auth, getCurrentUser);
// Change own password
router.put('/me/password', auth, changePassword);
// Change own email (Admin only enforcement in controller)
router.put('/me/email', auth, updateEmail);

export default router;
