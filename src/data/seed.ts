import type { DayRecord, PersistedState } from '../types';
import { currentWeekDates, isoDate, todayWeekIndex } from '../utils/time';

let seq = 0;
function uid(): string {
  seq += 1;
  return `t${Date.now().toString(36)}${seq}`;
}

/** Shu haftaning bugungacha bo'lgan kunlariga namunaviy ballar */
function seedHistory(): DayRecord[] {
  const week = currentWeekDates();
  const todayIdx = todayWeekIndex();
  const samples = [120, 145, 98, 160, 135, 110, 90];
  const history: DayRecord[] = [];
  for (let i = 0; i < todayIdx; i++) {
    history.push({ date: week[i], netPoints: samples[i] });
  }
  return history;
}

/** Ilova birinchi marta ochilganda namunaviy ma'lumot */
export function createSeedState(): PersistedState {
  const today = isoDate();
  return {
    version: 1,
    lastActiveDate: today,
    settings: {
      userName: 'Asadbek',
      shiftStart: 9 * 60, // 09:00
      shiftEnd: 18 * 60, // 18:00
      dailyThreshold: 130,
      weeklyReward: '🎮 Yakshanba: 3 soat kompyuter o\'ynash huquqi',
      weeklyPenalty: "💸 -35 000 so'm jarima",
      theme: 'system',
    },
    attendance: { checkIn: 9 * 60 + 14, checkOut: null },
    history: seedHistory(),
    tasks: [
      { id: uid(), title: 'Email xabarlarga javob berish', difficulty: 'oson', hours: 0.5, completed: true, createdAt: Date.now() },
      { id: uid(), title: "Kunlik hisobotni to'ldirish", difficulty: 'oson', hours: 0.75, completed: false, createdAt: Date.now() },
      { id: uid(), title: 'Jamoa chatini tekshirish', difficulty: 'oson', hours: 0.5, completed: true, createdAt: Date.now() },
      { id: uid(), title: 'Mijoz bilan uchrashuv', difficulty: 'ortacha', hours: 1.5, completed: false, createdAt: Date.now() },
      { id: uid(), title: 'Kod review qilish', difficulty: 'ortacha', hours: 2, completed: false, createdAt: Date.now() },
      { id: uid(), title: 'Yangi modul arxitekturasini loyihalash', difficulty: 'qiyin', hours: 4, completed: false, createdAt: Date.now() },
      { id: uid(), title: "To'liq mahsulotni ishga tushirish (MVP)", difficulty: 'judaqiyin', days: 5, dayProgress: 2, completed: false, createdAt: Date.now() },
      { id: uid(), title: 'Mijozlar tizimini migratsiya qilish', difficulty: 'judaqiyin', days: 3, dayProgress: 1, completed: false, createdAt: Date.now() },
    ],
  };
}

export { uid };
