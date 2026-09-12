import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type {
  Difficulty,
  PersistedState,
  Settings,
  Task,
} from '../types';
import { createSeedState, uid } from '../data/seed';
import { computePoints, computeProductivity, dailyTasks } from '../utils/points';
import { isoDate, getWeekStartDate } from '../utils/time';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_PREFIX = 'ish-ritmi:v1:';
const TABLE = 'ish_ritmi_app_state';
const PUSH_DEBOUNCE_MS = 700;

export type SyncStatus = 'syncing' | 'synced' | 'offline' | 'error';

type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'completed'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; patch: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string } }
  | { type: 'MOVE_TASK'; payload: { id: string; difficulty: Difficulty } }
  | { type: 'SET_DAY_PROGRESS'; payload: { id: string; dayProgress: number } }
  | { type: 'CHECK_IN'; payload: { minutes: number } }
  | { type: 'CHECK_OUT'; payload: { minutes: number } }
  | { type: 'RESET_ATTENDANCE' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ROLLOVER'; payload: { today: string } }
  | { type: 'ACCEPT_WEEKLY_REWARD' }
  | { type: 'WEEKLY_RESET'; payload: { weekStart: string } }
  | { type: 'REPLACE'; payload: PersistedState };

function storageKey(userId: string): string {
  return STORAGE_PREFIX + userId;
}

function loadLocal(userId: string): PersistedState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks)) {
      if (!parsed.settings.motivationalQuote) {
        parsed.settings.motivationalQuote = 'Har bir katta muvaffaqiyat kichik qadamdan boshlanadi.';
      }
      if (parsed.weeklyRewardPending === undefined) parsed.weeklyRewardPending = false;
      if (!parsed.lastWeekResetDate) parsed.lastWeekResetDate = getWeekStartDate();
      if (parsed.history?.length > 0 && typeof parsed.history[0].tasks === 'undefined') {
        parsed.history = parsed.history.map(h => ({
          ...h,
          tasks: (h as any).tasks ?? { total: 0, done: 0 },
          productivity: (h as any).productivity ?? 0,
        }));
      }
      return parsed;
    }
  } catch {
    /* corrupted cache */
  }
  return null;
}

function saveLocal(userId: string, state: PersistedState) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    /* storage full */
  }
}

function syncTodayHistory(state: PersistedState): PersistedState {
  const today = isoDate();
  const p = computePoints(state.tasks, state.attendance, state.settings);
  const daily = dailyTasks(state.tasks);
  const doneCount = daily.filter(t => t.completed).length;
  const productivity = computeProductivity(state.tasks, p);

  const history = state.history
    .filter((h) => h.date !== today)
    .filter(h => {
      const d = new Date(h.date);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 8;
    });

  history.push({
    date: today,
    netPoints: p.net,
    tasks: { total: daily.length, done: doneCount },
    productivity,
  });
  return { ...state, history };
}

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: Task = {
        id: uid(),
        createdAt: Date.now(),
        completed: false,
        ...action.payload,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.patch } : t
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, completed: !t.completed } : t
        ),
      };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, difficulty: action.payload.difficulty }
            : t
        ),
      };
    case 'SET_DAY_PROGRESS':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                dayProgress: Math.max(
                  0,
                  Math.min(action.payload.dayProgress, t.days ?? 1)
                ),
                completed: (action.payload.dayProgress ?? 0) >= (t.days ?? 1),
              }
            : t
        ),
      };
    case 'CHECK_IN':
      return {
        ...state,
        attendance: { checkIn: action.payload.minutes, checkOut: null },
      };
    case 'CHECK_OUT':
      return {
        ...state,
        attendance: { ...state.attendance, checkOut: action.payload.minutes },
      };
    case 'RESET_ATTENDANCE':
      return { ...state, attendance: { checkIn: null, checkOut: null } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ROLLOVER':
      return {
        ...state,
        lastActiveDate: action.payload.today,
        attendance: { checkIn: null, checkOut: null },
        tasks: state.tasks.map((t) =>
          t.difficulty === 'judaqiyin' ? t : { ...t, completed: false }
        ),
      };
    case 'ACCEPT_WEEKLY_REWARD':
      return {
        ...state,
        weeklyRewardPending: false,
      };
    case 'WEEKLY_RESET': {
      return {
        ...state,
        weeklyRewardPending: false,
        lastWeekResetDate: action.payload.weekStart,
        history: [],
        tasks: state.tasks.filter(t => t.difficulty === 'judaqiyin'),
        attendance: { checkIn: null, checkOut: null },
      };
    }
    case 'REPLACE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextValue {
  state: PersistedState;
  syncStatus: SyncStatus;
  addTask: (payload: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  moveTask: (id: string, difficulty: Difficulty) => void;
  setDayProgress: (id: string, dayProgress: number) => void;
  checkIn: (minutes: number) => void;
  checkOut: (minutes: number) => void;
  resetAttendance: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  acceptWeeklyReward: () => void;
  hardReset: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user!.id;

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadLocal(userId) ?? createSeedState()
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');

  const lastSyncedJson = useRef<string>('');
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    initializedRef.current = false;
    setSyncStatus('syncing');

    (async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        const fallback = loadLocal(userId) ?? createSeedState();
        dispatch({ type: 'REPLACE', payload: fallback });
        lastSyncedJson.current = '';
        setSyncStatus('offline');
        initializedRef.current = true;
        return;
      }

      if (data?.data) {
        const remote = data.data as PersistedState;
        if (!remote.settings.motivationalQuote) {
          remote.settings.motivationalQuote = 'Har bir katta muvaffaqiyat kichik qadamdan boshlanadi.';
        }
        if (remote.weeklyRewardPending === undefined) remote.weeklyRewardPending = false;
        if (!remote.lastWeekResetDate) remote.lastWeekResetDate = getWeekStartDate();
        lastSyncedJson.current = JSON.stringify(remote);
        dispatch({ type: 'REPLACE', payload: remote });
        saveLocal(userId, remote);
      } else {
        const seedFrom = loadLocal(userId) ?? createSeedState();
        lastSyncedJson.current = JSON.stringify(seedFrom);
        dispatch({ type: 'REPLACE', payload: seedFrom });
        saveLocal(userId, seedFrom);
        await supabase.from(TABLE).upsert({ user_id: userId, data: seedFrom });
      }
      setSyncStatus('synced');
      initializedRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const today = isoDate();
    if (state.lastActiveDate !== today) {
      dispatch({ type: 'ROLLOVER', payload: { today } });
    }
    const currentWeekStart = getWeekStartDate();
    if (state.lastWeekResetDate && state.lastWeekResetDate !== currentWeekStart) {
      if (state.history.length > 0) {
        dispatch({ type: 'REPLACE', payload: { ...state, weeklyRewardPending: true } });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastActiveDate]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const checkRollover = () => {
      const now = new Date();
      if (now.getHours() >= 21) {
        const today = isoDate();
        if (state.lastActiveDate === today) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dispatch({ type: 'ROLLOVER', payload: { today: isoDate(tomorrow) } });
        }
      }
    };
    const interval = setInterval(checkRollover, 60000);
    checkRollover();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastActiveDate]);

  useEffect(() => {
    const channel = supabase
      .channel(`app_state_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLE,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const remote = (payload.new as { data?: PersistedState } | null)?.data;
          if (!remote) return;
          const json = JSON.stringify(remote);
          if (json === lastSyncedJson.current) return;
          lastSyncedJson.current = json;
          dispatch({ type: 'REPLACE', payload: remote });
          saveLocal(userId, remote);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const synced = syncTodayHistory(state);
    saveLocal(userId, synced);

    const json = JSON.stringify(synced);
    if (json === lastSyncedJson.current) return;

    setSyncStatus('syncing');
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      lastSyncedJson.current = json;
      const { error } = await supabase
        .from(TABLE)
        .upsert({ user_id: userId, data: synced });
      setSyncStatus(error ? 'error' : 'synced');
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      syncStatus,
      addTask: (payload) => dispatch({ type: 'ADD_TASK', payload }),
      updateTask: (id, patch) =>
        dispatch({ type: 'UPDATE_TASK', payload: { id, patch } }),
      deleteTask: (id) => dispatch({ type: 'DELETE_TASK', payload: { id } }),
      toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', payload: { id } }),
      moveTask: (id, difficulty) =>
        dispatch({ type: 'MOVE_TASK', payload: { id, difficulty } }),
      setDayProgress: (id, dayProgress) =>
        dispatch({ type: 'SET_DAY_PROGRESS', payload: { id, dayProgress } }),
      checkIn: (minutes) => dispatch({ type: 'CHECK_IN', payload: { minutes } }),
      checkOut: (minutes) =>
        dispatch({ type: 'CHECK_OUT', payload: { minutes } }),
      resetAttendance: () => dispatch({ type: 'RESET_ATTENDANCE' }),
      updateSettings: (patch) =>
        dispatch({ type: 'UPDATE_SETTINGS', payload: patch }),
      acceptWeeklyReward: () => {
        dispatch({ type: 'ACCEPT_WEEKLY_REWARD' });
        const currentWeekStart = getWeekStartDate();
        setTimeout(() => {
          dispatch({ type: 'WEEKLY_RESET', payload: { weekStart: currentWeekStart } });
        }, 800);
      },
      hardReset: async () => {
        const fresh = createSeedState();
        try {
          await supabase.from(TABLE).upsert({ user_id: userId, data: fresh });
        } catch {
          /* offline */
        }
        try {
          localStorage.removeItem(storageKey(userId));
        } catch {
          /* ignore */
        }
        window.location.reload();
      },
    }),
    [state, syncStatus, userId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp AppProvider ichida ishlatilishi kerak');
  return ctx;
}
