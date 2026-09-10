-- ============================================================
-- Ish Ritmi — Supabase sxemasi
-- ============================================================
-- Supabase loyihangizda: Dashboard → SQL Editor → New query
-- ochib, shu faylni to'liq nusxalab "Run" bosing.
--
-- Boshqa kichik loyihalar bilan aralashmasligi uchun jadval nomi
-- "ish_ritmi_" prefiksi bilan yaratiladi — bir loyihada bir nechta
-- ilova bo'lsa ham xavfsiz.
-- ============================================================

-- 1) Har bir foydalanuvchi uchun bitta yozuv: butun ilova holati (JSON)
--    (vazifalar, davomat, sozlamalar, haftalik tarix — hammasi shu yerda)
create table if not exists public.ish_ritmi_app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) updated_at ustunini har yozishda avtomatik yangilash
create or replace function public.ish_ritmi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ish_ritmi_app_state_set_updated_at on public.ish_ritmi_app_state;
create trigger ish_ritmi_app_state_set_updated_at
  before update on public.ish_ritmi_app_state
  for each row execute function public.ish_ritmi_set_updated_at();

-- 3) Xavfsizlik (RLS): har kim FAQAT o'zining yozuvini ko'radi/yozadi
alter table public.ish_ritmi_app_state enable row level security;

drop policy if exists "ish_ritmi_select_own" on public.ish_ritmi_app_state;
create policy "ish_ritmi_select_own" on public.ish_ritmi_app_state
  for select using (auth.uid() = user_id);

drop policy if exists "ish_ritmi_insert_own" on public.ish_ritmi_app_state;
create policy "ish_ritmi_insert_own" on public.ish_ritmi_app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "ish_ritmi_update_own" on public.ish_ritmi_app_state;
create policy "ish_ritmi_update_own" on public.ish_ritmi_app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ish_ritmi_delete_own" on public.ish_ritmi_app_state;
create policy "ish_ritmi_delete_own" on public.ish_ritmi_app_state
  for delete using (auth.uid() = user_id);

-- 4) Real vaqtli sinxronizatsiya uchun Realtime'ni yoqish.
--    Agar bu qator xato bersa ("already member of publication" kabi),
--    e'tibor bermang — bu jadval allaqachon yoqilgan degani.
alter publication supabase_realtime add table public.ish_ritmi_app_state;

-- ============================================================
-- SHUNDAN KEYIN (SQL emas, Dashboard'da qo'lda qilinadi):
--
-- 1. Authentication → Providers → Email — yoqilganligini tekshiring
--    (odatda standart yoqilgan bo'ladi).
--
-- 2. Shaxsiy foydalanish uchun tezroq kirish istasangiz:
--    Authentication → Providers → Email → "Confirm email"ni o'chiring
--    — shunda ro'yxatdan o'tgach email tasdiqlashsiz darhol kira olasiz.
--    (Xavfsizroq bo'lishi uchun yoqib qo'yish ham mumkin — ixtiyoriy.)
--
-- 3. Settings → API sahifasidan quyidagilarni ilovaning .env fayliga
--    qo'ying (.env.example'ga qarang):
--      VITE_SUPABASE_URL      = Project URL
--      VITE_SUPABASE_ANON_KEY = anon public key
-- ============================================================
