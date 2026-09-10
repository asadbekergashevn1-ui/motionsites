import { useApp } from '../context/AppContext';
import { ongoingTasks } from '../utils/points';
import { DIFFICULTIES } from '../data/difficulty';

/** Davom etayotgan ko'p kunlik loyihalar (asosiy maqsadlar) */
export default function OngoingList() {
  const { state } = useApp();
  const items = ongoingTasks(state.tasks);
  const points = DIFFICULTIES.judaqiyin.points;

  if (items.length === 0) {
    return <div className="empty-state">Hozircha ko'p kunlik loyiha yo'q</div>;
  }

  return (
    <div>
      {items.map((t) => {
        const pct = Math.round(((t.dayProgress ?? 0) / (t.days ?? 1)) * 100);
        return (
          <div className="ongoing-item" key={t.id}>
            <div className="ongoing-title">{t.title}</div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${pct}%`, background: 'var(--c-veryhard)' }}
              />
            </div>
            <div className="ongoing-meta">
              <span>
                {t.dayProgress ?? 0} / {t.days ?? 1} kun
              </span>
              <span>+{points} ball (yakunda)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
