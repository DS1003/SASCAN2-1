import express from 'express';
import { login, register, forgotPassword, resetPassword} from '../controllers/authController';
import upload from '../config/multer';

const router = express.Router();

router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;