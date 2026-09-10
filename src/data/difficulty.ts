import type { Difficulty, DifficultyMeta } from '../types';

/** Qiyinlik ustunlari — prototipdagi ball tizimi bilan bir xil */
export const DIFFICULTIES: Record<Difficulty, DifficultyMeta> = {
  oson: {
    key: 'oson',
    label: 'Oson',
    sub: '30-45 daqiqa',
    points: 10,
    order: 3,
    colorVar: 'var(--c-easy)',
    softVar: 'var(--c-easy-soft)',
  },
  ortacha: {
    key: 'ortacha',
    label: "O'rtacha",
    sub: '1-3 soat',
    points: 25,
    order: 2,
    colorVar: 'var(--c-medium)',
    softVar: 'var(--c-medium-soft)',
  },
  qiyin: {
    key: 'qiyin',
    label: 'Qiyin',
    sub: '3-5 soat',
    points: 50,
    order: 1,
    colorVar: 'var(--c-hard)',
    softVar: 'var(--c-hard-soft)',
  },
  judaqiyin: {
    key: 'judaqiyin',
    label: 'Juda qiyin',
    sub: '1 kun - 1 hafta',
    points: 100,
    order: 4,
    colorVar: 'var(--c-veryhard)',
    softVar: 'var(--c-veryhard-soft)',
  },
};

/** Taxta tartibida ustunlar ro'yxati */
export const DIFFICULTY_ORDER: Difficulty[] = (
  Object.values(DIFFICULTIES) as DifficultyMeta[]
)
  .sort((a, b) => a.order - b.order)
  .map((d) => d.key);
