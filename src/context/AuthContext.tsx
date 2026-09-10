import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** Ilk sessiya tekshiruvi tugaguncha true */
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Supabase xato matnlarini o'zbekchaga tarjima qilish */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return "Email yoki parol noto'g'ri";
  if (m.includes('already registered') || m.includes('already exists'))
    return "Bu email allaqachon ro'yxatdan o'tgan — \"Kirish\"ni bosing";
  if (m.includes('password') && (m.includes('6') || m.includes('short') || m.includes('weak')))
    return "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
  if (m.includes('email') && m.includes('invalid')) return "Email manzili noto'g'ri";
  if (m.includes('confirm')) return 'Avval emailingizni tasdiqlang (pochta qutingizni tekshiring)';
  if (m.includes('failed to fetch') || m.includes('network'))
    return "Serverga ulanib bo'lmadi. Internetni yoki Supabase sozlamalarini tekshiring";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(translateAuthError(err.message));
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(translateAuthError(err.message));
      throw err;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      clearError: () => setError(null),
    }),
    [session, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return ctx;
}
