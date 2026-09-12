import { IonContent, IonPage } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { dailyTasks, computePoints, computeProductivity } from '../utils/points';
import { useWeekInfo } from '../components/StreakChart';
import { DIFFICULTIES } from '../data/difficulty';
import type { Difficulty } from '../types';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import AttendanceBar from '../components/AttendanceBar';
import OverloadBanner from '../components/OverloadBanner';
import PlanList from '../components/PlanList';
import OngoingList from '../components/OngoingList';

function CircularProgress({ percent }: { percent: number }) {
  const r = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const size = (r + stroke) * 2;

  return (
    <div className="circular-progress-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          stroke="var(--c-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${r + stroke} ${r + stroke})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#a18cd1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="circular-progress-inner">
        <span className="circular-progress-value">{percent}%</span>
        <span className="circular-progress-label">Bajarildi</span>
      </div>
    </div>
  );
}

const DIFF_COLORS: Record<Difficulty, string> = {
  oson: 'var(--c-easy)',
  ortacha: 'var(--c-medium)',
  qiyin: 'var(--c-hard)',
  judaqiyin: 'var(--c-veryhard)',
};

function DifficultyProgress({ tasks }: { tasks: ReturnType<typeof dailyTasks> }) {
  const categories: Difficulty[] = ['oson', 'ortacha', 'qiyin', 'judaqiyin'];

  return (
    <div className="difficulty-progress-list">
      {categories.map((d) => {
        const filtered = tasks.filter((t) => t.difficulty === d);
        if (filtered.length === 0) return null;
        const done = filtered.filter((t) => t.completed).length;
        const pct = Math.round((done / filtered.length) * 100);
        return (
          <div key={d} className="diff-progress-row">
            <div className="diff-progress-header">
              <span className="diff-progress-label">{DIFFICULTIES[d].label}</span>
              <span className="diff-progress-pct">{done}/{filtered.length}</span>
            </div>
            <div className="diff-progress-track">
              <div
                className="diff-progress-fill"
                style={{
                  width: `${pct}%`,
                  background: DIFF_COLORS[d],
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { state } = useApp();
  const p = computePoints(state.tasks, state.attendance, state.settings);
  const productivity = computeProductivity(state.tasks, p);
  const week = useWeekInfo();

  const daily = dailyTasks(state.tasks);
  const allTasks = state.tasks;
  const doneCount = daily.filter((t) => t.completed).length;
  const totalCompletion = allTasks.length > 0
    ? Math.round((allTasks.filter(t => t.completed).length / allTasks.length) * 100)
    : 0;

  const penaltyParts: string[] = [];
  if (p.lateMinutes > 0) penaltyParts.push(`-${p.latePenalty} kechikish`);
  if (p.earlyMinutes > 0) penaltyParts.push(`-${p.earlyPenalty} erta ketish`);
  const pointsSub = penaltyParts.length ? penaltyParts.join(' · ') : "Jarima yo'q";

  return (
    <IonPage>
      <IonContent>
        <div className="page-pad page-enter">
          <DashboardHeader />

          <AttendanceBar />

          <div style={{ marginTop: 14 }}>
            <OverloadBanner />
          </div>

          <div className="dashboard-body">
            <div className="dashboard-left">
              <div className="color-stats-grid">
                <StatCard color="pink" icon="star" label="Bugungi ball" value={p.net} sub={pointsSub} />
                <StatCard color="blue" icon="zap" label="Unumdorlik" value={`${productivity}%`} sub="real vaqtda" />
                <StatCard color="yellow" icon="check" label="Vazifalar" value={`${doneCount}/${daily.length}`} sub="bugun bajarilgan" />
                <StatCard color="purple" icon="trend" label="Haftalik o'rtacha" value={week.average} sub="ball / kun" subTone={week.isGood ? 'pos' : 'neg'} />
              </div>

              <div className="section-head">
                <div>
                  <div className="section-title">Bugungi reja</div>
                </div>
                <span className="section-sub">avtomatik tuzildi</span>
              </div>
              <div className="card-surface" style={{ padding: '4px 16px' }}>
                <PlanList />
              </div>

              <div className="section-head">
                <div className="section-title">Davom etayotgan loyihalar</div>
                <span className="section-sub">asosiy maqsadlar</span>
              </div>
              <div className="card-surface" style={{ padding: 16 }}>
                <OngoingList />
              </div>
            </div>

            <div className="dashboard-right">
              <div className="card-surface progress-panel">
                <div className="progress-panel-title">Bugungi natija</div>
                <CircularProgress percent={totalCompletion} />
                <DifficultyProgress tasks={allTasks} />
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
