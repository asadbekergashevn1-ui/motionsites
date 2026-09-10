import { useEffect } from 'react';
import type { ThemeMode } from '../types';

/** Tanlangan mavzuni <html> elementiga qo'llaydi */
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  if (mode === 'light') root.classList.add('theme-light');
  else if (mode === 'dark') root.classList.add('theme-dark');
  // 'system' — hech qanday sinf qo'ymaymiz, media query hal qiladi

  // Ionic'ning o'z dark rejimi sinfini ham moslash
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  root.classList.toggle('ion-palette-dark', isDark);
}

/** Mavzuni holatga bog'lash */
export function useTheme(mode: ThemeMode) {
  useEffect(() => {
    applyTheme(mode);
    if (mode !== 'system') return;
    // Tizim rejimi tanlanganda o'zgarishni kuzatamiz
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);
}
