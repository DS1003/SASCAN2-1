"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const generateQR_1 = require("../utils/generateQR");
const generateMatricule_1 = require("../utils/generateMatricule");
const authValidation_1 = require("../validations/authValidation");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        const validatedData = authValidation_1.registerSchema.parse(req.body);
        const userExists = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        let photoUrl = undefined;
        if (req.file) {
            console.log('Fichier reçu:', req.file);
            const result = await cloudinary_1.default.uploader.upload(req.file.path);
            photoUrl = result.secure_url;
            console.log('Photo uploadée sur Cloudinary:', photoUrl);
        }
        else {
            console.log('Aucun fichier reçu');
        }
        let matricule = undefined;
        let qrCode = undefined;
        if (validatedData.role === 'APPRENANT') {
            if (!validatedData.referentiel) {
                return res.status(400).json({ message: 'Referentiel is required for students' });
            }
            // Generate matricule
            matricule = await (0, generateMatricule_1.generateMatricule)(validatedData.referentiel);
            // Generate QR Code with matricule
            qrCode = await (0, generateQR_1.generateQRCode)(matricule);
        }
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: validatedData.role,
                referentiel: validatedData.referentiel,
                matricule,
                qrCode,
                photoUrl,
            },
        });
        res.status(201).json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            matricule: user.matricule,
            referentiel: user.referentiel,
            photoUrl: user.photoUrl,
            token: (0, generateToken_1.generateToken)(user.id),
        });
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = authValidation_1.loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (user && (await bcryptjs_1.default.compare(validatedData.password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                matricule: user.matricule,
                referentiel: user.referentiel,
                photoUrl: user.photoUrl,
                token: (0, generateToken_1.generateToken)(user.id),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
};
exports.login = login;
