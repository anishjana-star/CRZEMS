import express from 'express';
import { auth as protect } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Public route to get holidays (authenticated users)
router.get('/', protect, adminController.getHolidays);

export default router;
