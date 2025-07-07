import express from 'express';
import { 
  scanPresence, 
  getPresences, 
  getStudentPresences, 
  getPresenceToday,
  updatePresenceStatus
} from '../controllers/presenceController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '@prisma/client';
const router = express.Router();

router.post('/scan', protect, authorize(UserRole.VIGIL), scanPresence);
router.get('/', protect, authorize(UserRole.ADMIN, UserRole.VIGIL), getPresences);
router.get("/estMarquer/:userId", protect, authorize(UserRole.ADMIN, UserRole.VIGIL), getPresenceToday);
router.get('/:userId', protect, getStudentPresences);
router.patch('/:id', updatePresenceStatus);
export default router;
