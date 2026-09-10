// Ball, unumdorlik va kunlik reja hisoblash — ilovaning "haqiqiy" tizimi.
// Muhim: bu funksiyalar faqat ro'yxatdagi vazifalar bilan ishlaydi.
// O'chirilgan vazifa massivdan olib tashlanadi, shuning uchun u ball yoki
// progressga umuman ta'sir qilmaydi.

import type { Attendance, Difficulty, Settings, Task } from '../types';
import { DIFFICULTIES } from '../data/difficulty';

const LUNCH_START = 13 * 60; // 13:00
const LUNCH_END = 14 * 60; // 14:00
const MAX_PENALTY = 60; // maksimal jarima (daqiqa) har biri uchun

/** Faqat kunlik vazifalar (judaqiyin — ko'p kunlik, alohida hisoblanadi) */
export function dailyTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.difficulty !== 'judaqiyin');
}

/** Ko'p kunlik loyihalar */
export function ongoingTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.difficulty === 'judaqiyin');
}

export interface PointsResult {
  earned: number; // bajarilgan vazifalardan yig'ilgan ball
  latePenalty: number; // kechikish jarimasi
  earlyPenalty: number; // erta ketish jarimasi
  net: number; // sof ball
  lateMinutes: number;
  earlyMinutes: number;
}

/** Kunlik ballni hisoblash */
export function computePoints(
  tasks: Task[],
  attendance: Attendance,
  settings: Settings
): PointsResult {
  const lateMinutes = attendance.checkIn
    ? Math.max(0, attendance.checkIn - settings.shiftStart)
    : 0;
  const earlyMinutes = attendance.checkOut
    ? Math.max(0, settings.shiftEnd - attendance.checkOut)
    : 0;

  const latePenalty = Math.min(lateMinutes, MAX_PENALTY);
  const earlyPenalty = Math.min(earlyMinutes, MAX_PENALTY);

  let earned = 0;
  for (const t of dailyTasks(tasks)) {
    if (t.completed) earned += DIFFICULTIES[t.difficulty].points;
  }

  return {
    earned,
    latePenalty,
    earlyPenalty,
    net: earned - latePenalty - earlyPenalty,
    lateMinutes,
    earlyMinutes,
  };
}

/** Bugun mumkin bo'lgan maksimal ball (kunlik vazifalar bo'yicha) */
export function maxPossiblePoints(tasks: Task[]): number {
  let m = 0;
  for (const t of dailyTasks(tasks)) m += DIFFICULTIES[t.difficulty].points;
  return m || 1;
}

/** Unumdorlik foizi: 70% vazifalar + 30% davomat */
export function computeProductivity(
  tasks: Task[],
  p: PointsResult
): number {
  const taskRatio = Math.max(0, p.earned) / maxPossiblePoints(tasks);
  const attendanceScore =
    Math.max(0, 100 - p.lateMinutes * 1.5 - p.earlyPenalty * 1.5) / 100;
  const pct = taskRatio * 70 + attendanceScore * 30;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** Tushlik tanaffusini hisobga olib, ish daqiqalarini qo'shish */
function addWorkMinutes(start: number, add: number): number {
  let t = start;
  if (t >= LUNCH_START && t < LUNCH_END) t = LUNCH_END;
  let remaining = add;
  while (remaining > 0) {
    if (t < LUNCH_START) {
      const avail = LUNCH_START - t;
      if (remaining <= avail) {
        t += remaining;
        remaining = 0;
      } else {
        remaining -= avail;
        t = LUNCH_END;
      }
    } else {
      t += remaining;
      remaining = 0;
    }
  }
  return t;
}

export interface PlanRow {
  lunch?: boolean;
  task?: Task;
  start: number;
  end: number;
}

export interface Schedule {
  rows: PlanRow[];
  overflow: Task[];
}

/**
 * Bajarilmagan kunlik vazifalarni qiyinlikka qarab tartiblab,
 * ish vaqtiga (smena) joylashtirish. Sig'maganlar overflow'ga tushadi.
 */
export function computeSchedule(
  tasks: Task[],
  attendance: Attendance,
  settings: Settings
): Schedule {
  const order: Record<Difficulty, number> = {
    qiyin: 1,
    ortacha: 2,
    oson: 3,
    judaqiyin: 99,
  };

  const pending = dailyTasks(tasks)
    .filter((t) => !t.completed)
    .sort((a, b) => order[a.difficulty] - order[b.difficulty]);

  let cursor = Math.max(attendance.checkIn ?? settings.shiftStart, settings.shiftStart);
  const rows: PlanRow[] = [];
  const overflow: Task[] = [];
  let lunchInserted = false;

  for (const t of pending) {
    const start = cursor;
    const end = addWorkMinutes(start, (t.hours ?? 1) * 60);
    if (end > settings.shiftEnd) {
      overflow.push(t);
      continue;
    }
    if (start < LUNCH_START && end > LUNCH_START && !lunchInserted) {
      rows.push({ lunch: true, start: LUNCH_START, end: LUNCH_END });
      lunchInserted = true;
    } else if (start >= LUNCH_END && !lunchInserted) {
      rows.push({ lunch: true, start: LUNCH_START, end: LUNCH_END });
      lunchInserted = true;
    }
    rows.push({ task: t, start, end });
    cursor = end;
  }

  return { rows, overflow };
}
