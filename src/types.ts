// Ilovaning asosiy ma'lumot turlari

/** Vazifa qiyinlik darajasi (ustunlar) */
export type Difficulty = 'oson' | 'ortacha' | 'qiyin' | 'judaqiyin';

/** Bitta vazifa */
export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  createdAt: number;
  /** Kunlik vazifalar uchun taxminiy vaqt (soat) */
  hours?: number;
  /** Ko'p kunlik (judaqiyin) loyihalar uchun umumiy muddat (kun) */
  days?: number;
  /** Ko'p kunlik loyihada bajarilgan kunlar */
  dayProgress?: number;
  /** Ixtiyoriy izoh */
  note?: string;
}

/** Bir kunlik davomat yozuvi */
export interface Attendance {
  /** Kelgan vaqt — yarim tundan boshlab daqiqalarda (masalan 09:14 = 554). null = hali kelmagan */
  checkIn: number | null;
  /** Ketgan vaqt — daqiqalarda. null = hali ketmagan */
  checkOut: number | null;
}

/** Bir kunning to'liq yozuvi (ballar tarixi uchun) */
export interface DayRecord {
  /** ISO sana: YYYY-MM-DD */
  date: string;
  /** O'sha kun uchun yakuniy sof ball */
  netPoints: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

/** Ilova sozlamalari */
export interface Settings {
  userName: string;
  shiftStart: number; // daqiqalarda, standart 540 (09:00)
  shiftEnd: number; // daqiqalarda, standart 1080 (18:00)
  dailyThreshold: number; // kunlik ball chegarasi (streak uchun)
  /** Hafta yaxshi o'tsa (o'rtacha >= chegara) — mukofot matni */
  weeklyReward: string;
  /** Hafta yomon o'tsa (o'rtacha < chegara) — jarima matni */
  weeklyPenalty: string;
  theme: ThemeMode;
}

/** localStorage'da saqlanadigan to'liq holat */
export interface PersistedState {
  version: number;
  tasks: Task[];
  attendance: Attendance;
  /** Sana bo'yicha ballar tarixi (haftalik streak uchun) */
  history: DayRecord[];
  settings: Settings;
  /** Vazifalar oxirgi yangilangan sana (kun almashganini aniqlash uchun) */
  lastActiveDate: string;
}

/** Qiyinlik ustuni haqida meta-ma'lumot */
export interface DifficultyMeta {
  key: Difficulty;
  label: string;
  sub: string;
  points: number;
  /** Taxtada joylashuv tartibi */
  order: number;
  colorVar: string;
  softVar: string;
}
