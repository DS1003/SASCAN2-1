"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("../config/multer"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get('/profile', authMiddleware_1.protect, userController_1.getProfile);
router.put('/profile', authMiddleware_1.protect, multer_1.default.single('photo'), userController_1.updateProfile);
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(client_1.UserRole.ADMIN), userController_1.getAllUsers);
exports.default = router;
