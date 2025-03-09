"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const presenceController_1 = require("../controllers/presenceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post('/scan', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(client_1.UserRole.VIGIL), presenceController_1.scanPresence);
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.VIGIL), presenceController_1.getPresences);
router.get("/estMarquer/:userId", authMiddleware_1.protect, (0, authMiddleware_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.VIGIL), presenceController_1.getPresenceToday);
router.get('/:userId', authMiddleware_1.protect, presenceController_1.getStudentPresences);
exports.default = router;
