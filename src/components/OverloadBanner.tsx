import { useApp } from '../context/AppContext';
import { computeSchedule } from '../utils/points';

/** 8 soatlik ish vaqtiga sig'magan vazifalar haqida ogohlantirish */
export default function OverloadBanner() {
  const { state } = useApp();
  const { overflow } = computeSchedule(
    state.tasks,
    state.attendance,
    state.settings
  );

  if (overflow.length === 0) return null;

  return (
    <div className="banner">
      <span>⚠️</span>
      <span>
        Bugungi ish vaqtiga sig'maydi:{' '}
        <b>{overflow.map((t) => t.title).join(', ')}</b> — ertaga o'tkazish
        tavsiya etiladi.
      </span>
    </div>
  );
}
