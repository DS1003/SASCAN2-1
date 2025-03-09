import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface FileRequest extends Request {
  file?: Express.Multer.File;
}