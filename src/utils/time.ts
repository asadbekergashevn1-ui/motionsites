// Vaqt bilan ishlash yordamchilari

const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

const DAYS_UZ = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba',
];

export const WEEKDAY_SHORT_UZ = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/** Daqiqalardan HH:MM formatiga */
export function fmtClock(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
}

/** Hozirgi vaqt — yarim tundan daqiqalarda */
export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** "Payshanba, 10 Sentyabr" ko'rinishidagi sana */
export function formatLongDate(date: Date): string {
  return `${DAYS_UZ[date.getDay()]}, ${date.getDate()} ${MONTHS_UZ[date.getMonth()]}`;
}

/** Mahalliy vaqt bo'yicha ISO sana (YYYY-MM-DD) */
export function isoDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Dushanbadan boshlab shu haftaning 7 kunlik ISO sanalar ro'yxati.
 * Dushanba = 0 ... Yakshanba = 6 (WEEKDAY_SHORT_UZ bilan mos)
 */
export function currentWeekDates(ref: Date = new Date()): string[] {
  const day = ref.getDay(); // 0 = yakshanba
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push(isoDate(d));
  }
  return result;
}

/** Bugungi kun haftada nechanchi indeks (0 = Dush ... 6 = Yak) */
export function todayWeekIndex(ref: Date = new Date()): number {
  const day = ref.getDay();
  return day === 0 ? 6 : day - 1;
}

/** HH:MM matnini daqiqalarga */
export function parseClock(value: string): number {
  const [h, m] = value.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}
