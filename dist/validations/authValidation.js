"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const referentielEnum = zod_1.z.enum(['RefDigital', 'DevWeb', 'DevData', 'AWS', 'Hackeuse']);
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
    role: zod_1.z.nativeEnum(client_1.UserRole),
    referentiel: zod_1.z.string().optional().refine((val) => !val || referentielEnum.safeParse(val).success, { message: 'Invalid referentiel' }),
});
