import express from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../config/multer';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('photo'), updateProfile);
router.get('/', protect, authorize(UserRole.ADMIN), getAllUsers);

export default router;