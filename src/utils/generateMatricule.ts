import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateMatricule = async (referentiel: string): Promise<string> => {
  await prisma.$connect();

  if (!referentiel || typeof referentiel !== 'string') {
    throw new Error('Le référentiel doit être une chaîne valide.');
  }

  // Obtenir l'année actuelle
  const year = new Date().getFullYear().toString().slice(-2);

  // Mapper les préfixes des référentiels
  const prefixMap: { [key: string]: string } = {
    'RefDigital': 'RD',
    'DevWeb': 'DW',
    'DevData': 'DD',
    'AWS': 'AW',
    'Hackeuse': 'HK'
  };

  const prefix = prefixMap[referentiel] || 'XX';

  let matricule: string | undefined;
  let unique = false;
  let attempts = 0;

  while (!unique && attempts < 10) {
    // Compter les utilisateurs avec ce référentiel et cette année
    const count = await prisma.user.count({
      where: {
        referentiel: { equals: referentiel },
        matricule: {
          startsWith: `${prefix}${year}`
        }
      }
    });

    // Générer le matricule
    const sequence = (count + 1 + attempts).toString().padStart(3, '0');
    matricule = `${prefix}${year}${sequence}`;

    // Vérifier si le matricule existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { matricule }
    });

    if (!existingUser) {
      unique = true;
    } else {
      attempts++; // Essayer un autre numéro
    }
  }

  if (!unique) {
    throw new Error('Impossible de générer un matricule unique après plusieurs essais.');
  }

  return matricule as string;
};
