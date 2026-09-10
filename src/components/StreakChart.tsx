import { useApp } from '../context/AppContext';
import { computePoints } from '../utils/points';
import {
  currentWeekDates,
  isoDate,
  todayWeekIndex,
  WEEKDAY_SHORT_UZ,
} from '../utils/time';

export interface WeekInfo {
  values: number[];
  todayIdx: number;
  average: number;
  isGood: boolean;
}

/** Shu haftaning kunlik ballari (bugungi qiymat jonli hisoblanadi) */
export function useWeekInfo(): WeekInfo {
  const { state } = useApp();
  const week = currentWeekDates();
  const today = isoDate();
  const todayIdx = todayWeekIndex();
  const liveNet = computePoints(state.tasks, state.attendance, state.settings).net;

  const values = week.map((date) => {
    if (date === today) return liveNet;
    const rec = state.history.find((h) => h.date === date);
    return rec ? rec.netPoints : 0;
  });

  const average = Math.round(values.reduce((a, b) => a + b, 0) / 7);
  return {
    values,
    todayIdx,
    average,
    isGood: average >= state.settings.dailyThreshold,
  };
}

export default function StreakChart() {
  const { state } = useApp();
  const { values, todayIdx, average, isGood } = useWeekInfo();
  const threshold = state.settings.dailyThreshold;

  const maxVal = Math.max(200, ...values);
  const thresholdPct = (threshold / maxVal) * 100;

  return (
    <div>
      <div className="streak-chart">
        <div
          className="threshold-line"
          style={{ bottom: `${thresholdPct}%` }}
        />
        {values.map((val, i) => {
          const h = Math.max(4, (Math.max(val, 0) / maxVal) * 100);
          return (
            <div className="streak-col" key={i}>
              <div className="streak-bar-wrap">
                <div
                  className={`streak-bar${i === todayIdx ? ' today' : ''}`}
                  style={{ height: `${h}%` }}
                />
              </div>
              <div className="streak-day">{WEEKDAY_SHORT_UZ[i]}</div>
            </div>
          );
        })}
      </div>

      <div className={`streak-note ${isGood ? 'note-good' : 'note-bad'}`}>
        {isGood ? (
          <>
            {state.settings.weeklyReward}
            <div className="streak-note-sub">
              O'rtacha {average} ball/kun · chegara {threshold}
            </div>
          </>
        ) : (
          <>
            {state.settings.weeklyPenalty}
            <div className="streak-note-sub">
              O'rtacha {average} ball/kun · chegara {threshold}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
