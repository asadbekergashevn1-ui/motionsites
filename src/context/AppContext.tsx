import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type {
  Difficulty,
  PersistedState,
  Settings,
  Task,
} from '../types';
import { createSeedState, uid } from '../data/seed';
import { computePoints } from '../utils/points';
import { isoDate } from '../utils/time';

const STORAGE_KEY = 'ish-ritmi:v1';

// ---------- Action turlari ----------
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
  | { type: 'REPLACE'; payload: PersistedState };

// ---------- Yuklash / saqlash ----------
function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.tasks)) {
        return parsed;
      }
    }
  } catch {
    /* buzilgan ma'lumot — namunadan boshlaymiz */
  }
  return createSeedState();
}

/** Bugungi sof ballni tarixga yozib qo'yish (upsert) */
function syncTodayHistory(state: PersistedState): PersistedState {
  const today = isoDate();
  const net = computePoints(state.tasks, state.attendance, state.settings).net;
  const history = state.history.filter((h) => h.date !== today);
  history.push({ date: today, netPoints: net });
  return { ...state, history };
}

// ---------- Reducer ----------
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
      // O'chirilgan vazifa massivdan butunlay chiqadi —
      // ballga ham, progressga ham ta'sir qilmaydi.
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
                completed:
                  (action.payload.dayProgress ?? 0) >= (t.days ?? 1),
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
    case 'ROLLOVER': {
      // Yangi kun: davomatni tozalaymiz, kunlik vazifalar "bajarilmagan"
      // holatiga qaytadi. Ko'p kunlik loyihalar (judaqiyin) saqlanadi.
      return {
        ...state,
        lastActiveDate: action.payload.today,
        attendance: { checkIn: null, checkOut: null },
        tasks: state.tasks.map((t) =>
          t.difficulty === 'judaqiyin' ? t : { ...t, completed: false }
        ),
      };
    }
    case 'REPLACE':
      return action.payload;
    default:
      return state;
  }
}

// ---------- Context ----------
interface AppContextValue {
  state: PersistedState;
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Kun almashganini tekshirish (rollover)
  useEffect(() => {
    const today = isoDate();
    if (state.lastActiveDate !== today) {
      dispatch({ type: 'ROLLOVER', payload: { today } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Har o'zgarishda: bugungi ballni tarixga yozib, localStorage'ga saqlash
  useEffect(() => {
    const synced = syncTodayHistory(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
    } catch {
      /* saqlash imkonsiz — jim o'tkazamiz */
    }
  }, [state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
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
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp AppProvider ichida ishlatilishi kerak');
  return ctx;
}
