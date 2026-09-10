import {
  IonContent,
  IonPage,
} from '@ionic/react';
import { useApp } from '../context/AppContext';
import { dailyTasks, computePoints, computeProductivity } from '../utils/points';
import { useWeekInfo } from '../components/StreakChart';
import { formatLongDate } from '../utils/time';
import StatCard from '../components/StatCard';
import AttendanceBar from '../components/AttendanceBar';
import OverloadBanner from '../components/OverloadBanner';
import PlanList from '../components/PlanList';
import OngoingList from '../components/OngoingList';

export default function HomePage() {
  const { state } = useApp();
  const p = computePoints(state.tasks, state.attendance, state.settings);
  const productivity = computeProductivity(state.tasks, p);
  const week = useWeekInfo();

  const daily = dailyTasks(state.tasks);
  const doneCount = daily.filter((t) => t.completed).length;

  const penaltyParts: string[] = [];
  if (p.lateMinutes > 0) penaltyParts.push(`-${p.latePenalty} kechikish`);
  if (p.earlyMinutes > 0) penaltyParts.push(`-${p.earlyPenalty} erta ketish`);
  const pointsSub = penaltyParts.length ? penaltyParts.join(' · ') : "Jarima yo'q";

  return (
    <IonPage>
      <IonContent>
        <div className="page-pad">
          {/* Salomlashuv */}
          <div style={{ paddingTop: 8, marginBottom: 16 }}>
            <div className="greeting-name">
              Salom, {state.settings.userName} 👋
            </div>
            <div className="greeting-date">{formatLongDate(new Date())}</div>
          </div>

          {/* Davomat */}
          <AttendanceBar />

          {/* Ogohlantirish */}
          <div style={{ marginTop: 14 }}>
            <OverloadBanner />
          </div>

          {/* Statistika kartalari */}
          <div className="stats-grid" style={{ marginTop: 14 }}>
            <StatCard
              hero
              label="Bugungi ball"
              value={p.net}
              sub={pointsSub}
            />
            <StatCard
              label="Unumdorlik"
              value={`${productivity}%`}
              sub="real vaqtda"
            />
            <StatCard
              label="Vazifalar"
              value={`${doneCount}/${daily.length}`}
              sub="bugun bajarilgan"
            />
            <StatCard
              label="Haftalik o'rtacha"
              value={week.average}
              sub="ball / kun"
              subTone={week.isGood ? 'pos' : 'neg'}
            />
          </div>

          {/* Bugungi reja */}
          <div className="section-head">
            <div>
              <div className="section-title">Bugungi reja</div>
            </div>
            <span className="section-sub">avtomatik tuzildi</span>
          </div>
          <div className="card-surface" style={{ padding: '4px 16px' }}>
            <PlanList />
          </div>

          {/* Davom etayotgan loyihalar */}
          <div className="section-head">
            <div className="section-title">Davom etayotgan loyihalar</div>
            <span className="section-sub">asosiy maqsadlar</span>
          </div>
          <div className="card-surface" style={{ padding: 16 }}>
            <OngoingList />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
