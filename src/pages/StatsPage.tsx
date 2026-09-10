import { IonContent, IonPage } from '@ionic/react';
import { useApp } from '../context/AppContext';
import {
  computePoints,
  computeProductivity,
  dailyTasks,
} from '../utils/points';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../data/difficulty';
import StatCard from '../components/StatCard';
import StreakChart, { useWeekInfo } from '../components/StreakChart';

export default function StatsPage() {
  const { state } = useApp();
  const p = computePoints(state.tasks, state.attendance, state.settings);
  const productivity = computeProductivity(state.tasks, p);
  const week = useWeekInfo();

  // Qiyinlik bo'yicha bajarilgan vazifalar taqsimoti
  const breakdown = DIFFICULTY_ORDER.map((key) => {
    const meta = DIFFICULTIES[key];
    const all = state.tasks.filter((t) => t.difficulty === key);
    const done = all.filter((t) => t.completed).length;
    return { meta, total: all.length, done };
  });

  const best = Math.max(0, ...week.values);

  return (
    <IonPage>
      <IonContent>
        <div className="page-pad">
          <div style={{ paddingTop: 8, marginBottom: 12 }}>
            <div className="section-title" style={{ fontSize: 22, fontWeight: 800 }}>
              Statistika
            </div>
            <div className="greeting-date">Haftalik ko'rsatkichlaringiz</div>
          </div>

          <div className="stats-grid">
            <StatCard hero label="Bugungi ball" value={p.net} sub={`${dailyTasks(state.tasks).filter(t=>t.completed).length} ta vazifa bajarilgan`} />
            <StatCard label="Unumdorlik" value={`${productivity}%`} sub="bugun" />
            <StatCard label="Eng yaxshi kun" value={best} sub="shu hafta" subTone="pos" />
          </div>

          {/* Haftalik streak */}
          <div className="section-head">
            <div className="section-title">Haftalik streak</div>
            <span className="section-sub">chegara: {state.settings.dailyThreshold} ball/kun</span>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            <StreakChart />
          </div>

          {/* Qiyinlik bo'yicha taqsimot */}
          <div className="section-head">
            <div className="section-title">Qiyinlik bo'yicha</div>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            {breakdown.map(({ meta, total, done }) => {
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={meta.key} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                      <span className="dot" style={{ background: meta.colorVar }} />
                      {meta.label}
                    </span>
                    <span style={{ color: 'var(--c-text-3)', fontSize: 12 }}>
                      {done}/{total} · +{meta.points}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: meta.colorVar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
