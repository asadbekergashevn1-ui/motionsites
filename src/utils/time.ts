const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

const DAYS_UZ = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba',
];

export const WEEKDAY_SHORT_UZ = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
export const WEEKDAY_FULL_UZ = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export function fmtClock(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function formatLongDate(date: Date): string {
  return `${DAYS_UZ[date.getDay()]}, ${date.getDate()} ${MONTHS_UZ[date.getMonth()]}`;
}

export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_UZ[date.getMonth()]}`;
}

export function formatTime(date: Date): string {
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

export function isoDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentWeekDates(ref: Date = new Date()): string[] {
  const day = ref.getDay();
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

export function todayWeekIndex(ref: Date = new Date()): number {
  const day = ref.getDay();
  return day === 0 ? 6 : day - 1;
}

export function parseClock(value: string): number {
  const [h, m] = value.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

export function isAfter2100(): boolean {
  return new Date().getHours() >= 21;
}

export function getEffectiveDate(): string {
  const now = new Date();
  if (now.getHours() >= 21) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isoDate(tomorrow);
  }
  return isoDate(now);
}

export function getWeekStartDate(ref: Date = new Date()): string {
  const day = ref.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  return isoDate(monday);
}

export function parseDateStr(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDayName(iso: string): string {
  const d = parseDateStr(iso);
  const idx = d.getDay();
  const weekIdx = idx === 0 ? 6 : idx - 1;
  return WEEKDAY_SHORT_UZ[weekIdx];
}

export function getDayInfo(iso: string): { dayName: string; dayNum: number; monthName: string } {
  const d = parseDateStr(iso);
  const weekIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  return {
    dayName: WEEKDAY_SHORT_UZ[weekIdx],
    dayNum: d.getDate(),
    monthName: MONTHS_UZ[d.getMonth()],
  };
}
