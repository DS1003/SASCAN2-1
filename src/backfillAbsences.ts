import { PrismaClient, PresenceStatus, UserRole } from '@prisma/client';
import dayjs from 'dayjs';
import { isHoliday } from './utils/holidaysSenegal';

const prisma = new PrismaClient();

// Date de début de correction (à adapter si besoin)
const START_DATE = '2025-06-01';
const END_DATE = dayjs().format('YYYY-MM-DD');

async function getAllLearners() {
  // On ne garde que les apprenants avec un matricule non nul
  return prisma.user.findMany({ where: { role: UserRole.APPRENANT, NOT: { matricule: null } } });
}

function isWeekday(date: dayjs.Dayjs) {
  const day = date.day();
  return day >= 1 && day <= 5; // 1 = lundi, 5 = vendredi
}

export async function backfillAbsences() {
  const learners = await getAllLearners();
  let current = dayjs(START_DATE);
  const end = dayjs(END_DATE);
  let totalAbsents = 0;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // On saute les jours fériés
    if (isWeekday(current) && !isHoliday(current.toDate())) {
      const dateStart = current.startOf('day').toDate();
      const dateEnd = current.endOf('day').toDate();
      for (const learner of learners) {
        // On est sûr que learner.matricule est string
        const presence = await prisma.presence.findFirst({
          where: {
            userId: learner.matricule!,
            scanTime: { gte: dateStart, lte: dateEnd },
          },
        });
        if (!presence) {
          await prisma.presence.create({
            data: {
              userId: learner.matricule!,
              status: PresenceStatus.ABSENT,
              scanTime: dateEnd, // ou dateStart
            },
          });
          totalAbsents++;
          console.log(`Absent ajouté pour ${learner.firstName} ${learner.lastName} (${learner.matricule}) le ${current.format('YYYY-MM-DD')}`);
        }
      }
    }
    current = current.add(1, 'day');
  }
  console.log(`Correction terminée. ${totalAbsents} absences ajoutées.`);
  await prisma.$disconnect();
}

// Pour exécution manuelle éventuelle
if (require.main === module) {
  backfillAbsences().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
