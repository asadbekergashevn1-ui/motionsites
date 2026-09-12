export type Difficulty = 'oson' | 'ortacha' | 'qiyin' | 'judaqiyin';

export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  createdAt: number;
  hours?: number;
  days?: number;
  dayProgress?: number;
  note?: string;
}

export interface Attendance {
  checkIn: number | null;
  checkOut: number | null;
}

export interface DayRecord {
  date: string;
  netPoints: number;
  tasks: { total: number; done: number };
  productivity: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  userName: string;
  shiftStart: number;
  shiftEnd: number;
  dailyThreshold: number;
  weeklyReward: string;
  weeklyPenalty: string;
  theme: ThemeMode;
  motivationalQuote: string;
}

export interface PersistedState {
  version: number;
  tasks: Task[];
  attendance: Attendance;
  history: DayRecord[];
  settings: Settings;
  lastActiveDate: string;
  weeklyRewardPending: boolean;
  lastWeekResetDate: string;
}

export interface DifficultyMeta {
  key: Difficulty;
  label: string;
  sub: string;
  points: number;
  order: number;
  colorVar: string;
  softVar: string;
}
