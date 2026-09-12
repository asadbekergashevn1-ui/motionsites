import type { DayRecord, PersistedState } from '../types';
import { currentWeekDates, isoDate, todayWeekIndex, getWeekStartDate } from '../utils/time';

let seq = 0;
function uid(): string {
  seq += 1;
  return `t${Date.now().toString(36)}${seq}`;
}

function seedHistory(): DayRecord[] {
  const week = currentWeekDates();
  const todayIdx = todayWeekIndex();
  const samples = [
    { net: 120, tasks: { total: 6, done: 4 }, prod: 72 },
    { net: 145, tasks: { total: 5, done: 4 }, prod: 85 },
    { net: 98, tasks: { total: 7, done: 3 }, prod: 58 },
    { net: 160, tasks: { total: 6, done: 5 }, prod: 91 },
    { net: 135, tasks: { total: 4, done: 3 }, prod: 78 },
    { net: 110, tasks: { total: 5, done: 3 }, prod: 65 },
    { net: 90, tasks: { total: 4, done: 2 }, prod: 52 },
  ];
  const history: DayRecord[] = [];
  for (let i = 0; i < todayIdx; i++) {
    history.push({
      date: week[i],
      netPoints: samples[i].net,
      tasks: samples[i].tasks,
      productivity: samples[i].prod,
    });
  }
  return history;
}

export function createSeedState(): PersistedState {
  const today = isoDate();
  return {
    version: 1,
    lastActiveDate: today,
    weeklyRewardPending: false,
    lastWeekResetDate: getWeekStartDate(),
    settings: {
      userName: 'Ergashev Asadbek',
      shiftStart: 9 * 60,
      shiftEnd: 18 * 60,
      dailyThreshold: 130,
      weeklyReward: '3 soat kompyuter o\'ynash huquqi',
      weeklyPenalty: "-35 000 so'm jarima",
      theme: 'system',
      motivationalQuote: 'Har bir katta muvaffaqiyat kichik qadamdan boshlanadi.',
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
