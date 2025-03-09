import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const referentielEnum = z.enum(['RefDigital', 'DevWeb', 'DevData', 'AWS', 'Hackeuse']);

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  referentiel: z.string().optional().refine(
    (val) => !val || referentielEnum.safeParse(val).success,
    { message: 'Invalid referentiel' }
  ),
});