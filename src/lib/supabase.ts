import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** false bo'lsa — .env sozlanmagan, App.tsx buni ko'rsatib beradi */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase sozlanmagan: loyihaning ildizida .env fayl yarating va " +
      'VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY qiymatlarini kiriting ' +
      '(.env.example faylga qarang).'
  );
}

// createClient bo'sh/noto'g'ri URL bilan darhol xato tashlaydi — shuning
// uchun sozlanmagan holatda ham ilova qulab tushmasligi uchun soxta (lekin
// to'g'ri formatdagi) qiymat beramiz. Haqiqiy so'rovlar baribir muvaffaqiyatsiz
// bo'ladi, ammo buni App.tsx `isSupabaseConfigured` orqali oldindan aniqlaydi.
const safeUrl = url || 'https://placeholder.supabase.co';
const safeKey = anonKey || 'placeholder-anon-key';

/** Butun ilova bo'ylab ishlatiladigan yagona Supabase mijozi */
export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
