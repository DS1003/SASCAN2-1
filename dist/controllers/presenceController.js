"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresenceToday = exports.getStudentPresences = exports.getPresences = exports.scanPresence = void 0;
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
        const { matricule } = req.body;
        const student = await prisma.user.findFirst({
            where: { matricule },
        });
        if (!student) {
            return res.status(404).json({ message: 'Matricule invalide' });
        }
        const scanTime = new Date();
        const status = determinePresenceStatus(scanTime);
        const presence = await prisma.presence.create({
            data: {
                userId: matricule,
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
        res.status(400).json({ message: error instanceof Error ? error.message : 'Échec du scan' });
    }
};
exports.scanPresence = scanPresence;
const getPresences = async (req, res) => {
    try {
        const { startDate, endDate, status, referentiel } = req.query;
        let where = {};
        if (startDate && endDate) {
            const startOfDay = new Date((new Date(startDate.toString())).setHours(0, 0, 0, 0)); // Début de la journée
            const endOfDay = new Date((new Date(endDate.toString())).setHours(23, 59, 59, 999)); // Fin de la journée
            where.scanTime = {
                gte: startOfDay,
                lte: endOfDay,
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
const getPresenceToday = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Début de la journée
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Fin de la journée
        const presence = await prisma.presence.findFirst({
            where: {
                userId,
                scanTime: {
                    gte: startOfDay, // Inclusif
                    lte: endOfDay, // Inclusif
                },
            },
            orderBy: {
                scanTime: 'desc',
            },
        });
        res.json({
            presence,
        });
    }
    catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPresenceToday = getPresenceToday;
