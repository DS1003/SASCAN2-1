"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentPresences = exports.getPresences = exports.scanPresence = exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const generateQRCode = async (text) => {
    try {
        return await qrcode_1.default.toDataURL(text);
    }
    catch (err) {
        throw new Error('QR Code generation failed');
    }
};
exports.generateQRCode = generateQRCode;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const determinePresenceStatus = (scanTime) => {
    const hour = scanTime.getHours();
    const minutes = scanTime.getMinutes();
    const timeInMinutes = hour * 60 + minutes;
    if (timeInMinutes <= 8 * 60 + 15) { // Before 8:15
        return client_1.PresenceStatus.PRESENT;
    }
    else if (timeInMinutes <= 8 * 60 + 30) { // Between 8:15 and 8:30
        return client_1.PresenceStatus.LATE;
    }
    else { // After 8:30
        return client_1.PresenceStatus.ABSENT;
    }
};
const scanPresence = async (req, res) => {
    try {
        const { qrCode } = req.body;
        const student = await prisma.user.findFirst({
            where: { qrCode },
        });
        if (!student) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }
        const scanTime = new Date();
        const status = determinePresenceStatus(scanTime);
        const presence = await prisma.presence.create({
            data: {
                userId: student.id,
                status,
                scanTime,
            },
            include: {
                user: true,
            },
        });
        res.status(201).json(presence);
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Scan failed' });
    }
};
exports.scanPresence = scanPresence;
const getPresences = async (req, res) => {
    try {
        const { startDate, endDate, status, referentiel } = req.query;
        let where = {};
        if (startDate && endDate) {
            where.scanTime = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (status) {
            where.status = status;
        }
        if (referentiel) {
            where.user = {
                referentiel: referentiel,
            };
        }
        const presences = await prisma.presence.findMany({
            where,
            include: {
                user: true,
            },
            orderBy: {
                scanTime: 'desc',
            },
        });
        res.json(presences);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPresences = getPresences;
const getStudentPresences = async (req, res) => {
    try {
        const { userId } = req.params;
        const presences = await prisma.presence.findMany({
            where: {
                userId,
            },
            orderBy: {
                scanTime: 'desc',
            },
        });
        const stats = {
            total: presences.length,
            present: presences.filter(p => p.status === client_1.PresenceStatus.PRESENT).length,
            late: presences.filter(p => p.status === client_1.PresenceStatus.LATE).length,
            absent: presences.filter(p => p.status === client_1.PresenceStatus.ABSENT).length,
            presencePercentage: 0,
        };
        stats.presencePercentage = (stats.present / stats.total) * 100;
        res.json({
            presences,
            stats,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudentPresences = getStudentPresences;
