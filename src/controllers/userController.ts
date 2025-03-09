import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, FileRequest } from '../types';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        presences: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: FileRequest & AuthRequest, res: Response) => {
  try {
    let photoUrl = req.user?.photoUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      photoUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: {
        firstName: req.body.firstName || req.user?.firstName,
        lastName: req.body.lastName || req.user?.lastName,
        photoUrl,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Update failed' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};