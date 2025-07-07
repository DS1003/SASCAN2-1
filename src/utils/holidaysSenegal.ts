// Ce module charge les jours fériés depuis un fichier JSON (export Google Calendar)
import fs from 'fs';
import path from 'path';

let holidays: string[] = [];

// Charger le fichier holidays.sn.json (format ["2025-01-01", ...])
try {
  const data = fs.readFileSync(path.join(__dirname, 'holidays.sn.json'), 'utf-8');
  holidays = JSON.parse(data);
} catch (e) {
  console.warn('Aucun fichier holidays.sn.json trouvé ou erreur de lecture. Les jours fériés ne seront pas pris en compte.');
}

export function isHoliday(date: Date): boolean {
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return holidays.includes(iso);
}
