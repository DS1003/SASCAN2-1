import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    throw new Error('QR Code generation failed');
  }
};import { Response } from 'express';
import { PrismaClient, PresenceStatus } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

const determinePresenceStatus = (scanTime: Date): PresenceStatus => {
  const hour = scanTime.getHours();
  const minutes = scanTime.getMinutes();
  const timeInMinutes = hour * 60 + minutes;

  if (timeInMinutes <= 8 * 60 + 15) { // Before 8:15
    return PresenceStatus.PRESENT;
  } else if (timeInMinutes <= 8 * 60 + 30) { // Between 8:15 and 8:30
    return PresenceStatus.LATE;
  } else { // After 8:30
    return PresenceStatus.ABSENT;
  }
};

export const scanPresence = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Scan failed' });
  }
};

export const getPresences = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, status, referentiel } = req.query;

    let where: any = {};

    if (startDate && endDate) {
      where.scanTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (status) {
      where.status = status;
    }

    if (referentiel) {
      where.user = {
        referentiel: referentiel as string,
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentPresences = async (req: AuthRequest, res: Response) => {
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
      present: presences.filter(p => p.status === PresenceStatus.PRESENT).length,
      late: presences.filter(p => p.status === PresenceStatus.LATE).length,
      absent: presences.filter(p => p.status === PresenceStatus.ABSENT).length,
      presencePercentage: 0,
    };

    stats.presencePercentage = (stats.present / stats.total) * 100;

    res.json({
      presences,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};