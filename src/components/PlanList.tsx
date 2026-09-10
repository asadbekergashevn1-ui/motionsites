import { useApp } from '../context/AppContext';
import { DIFFICULTIES } from '../data/difficulty';
import { computeSchedule } from '../utils/points';
import { fmtClock } from '../utils/time';

/** Bugungi reja — vazifalarga qarab avtomatik tuziladi */
export default function PlanList() {
  const { state } = useApp();
  const sched = computeSchedule(state.tasks, state.attendance, state.settings);

  if (sched.rows.length === 0) {
    return (
      <div className="empty-state">Barcha kunlik vazifalar bajarildi 🎉</div>
    );
  }

  return (
    <div className="plan-list">
      {sched.rows.map((r, i) => {
        if (r.lunch) {
          return (
            <div className="plan-row" key={`lunch-${i}`}>
              <span className="plan-time mono">
                {fmtClock(r.start)}–{fmtClock(r.end)}
              </span>
              <span className="plan-bar" style={{ background: 'var(--c-border)' }} />
              <span className="plan-title plan-lunch">Tushlik tanaffusi</span>
            </div>
          );
        }
        const meta = DIFFICULTIES[r.task!.difficulty];
        return (
          <div className="plan-row" key={r.task!.id}>
            <span className="plan-time mono">
              {fmtClock(r.start)}–{fmtClock(r.end)}
            </span>
            <span className="plan-bar" style={{ background: meta.colorVar }} />
            <span className="plan-title">{r.task!.title}</span>
          </div>
        );
      })}
    </div>
  );
}
