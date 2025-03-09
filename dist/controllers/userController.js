"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res) => {
    var _a;
    try {
        const user = await prisma.user.findUnique({
            where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
            include: {
                presences: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        let photoUrl = (_a = req.user) === null || _a === void 0 ? void 0 : _a.photoUrl;
        if (req.file) {
            const result = await cloudinary_1.default.uploader.upload(req.file.path);
            photoUrl = result.secure_url;
            fs_1.default.unlinkSync(req.file.path);
        }
        const updatedUser = await prisma.user.update({
            where: { id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id },
            data: {
                firstName: req.body.firstName || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.firstName),
                lastName: req.body.lastName || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.lastName),
                photoUrl,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Update failed' });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: 'APPRENANT',
            },
            include: {
                presences: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
