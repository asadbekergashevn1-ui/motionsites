import { useApp } from '../context/AppContext';
import { fmtClock, nowMinutes } from '../utils/time';

export default function AttendanceBar() {
  const { state, checkIn, checkOut } = useApp();
  const { attendance, settings } = state;

  let statusText = 'Hali kelmagan';
  let statusClass = 'status-wait';

  if (attendance.checkIn && !attendance.checkOut) {
    const late = Math.max(0, attendance.checkIn - settings.shiftStart);
    statusText =
      'Ishda · keldi ' +
      fmtClock(attendance.checkIn) +
      (late > 0 ? ` (+${late} daq. kech)` : '');
    statusClass = 'status-in';
  } else if (attendance.checkIn && attendance.checkOut) {
    statusText =
      'Kun yakunlandi · ' +
      fmtClock(attendance.checkIn) +
      '–' +
      fmtClock(attendance.checkOut);
    statusClass = 'status-out';
  }

  const canIn = !attendance.checkIn;
  const canOut = !!attendance.checkIn && !attendance.checkOut;

  return (
    <div className="attendance card-surface">
      <div className="attendance-info">
        <span className="attendance-shift">
          Smena: {fmtClock(settings.shiftStart)}–{fmtClock(settings.shiftEnd)}
        </span>
        <span className={`status-pill ${statusClass}`}>{statusText}</span>
      </div>
      <div className="attendance-btns">
        <button
          className="att-btn att-in"
          disabled={!canIn}
          onClick={() => checkIn(nowMinutes())}
        >
          Keldim
        </button>
        <button
          className="att-btn att-out"
          disabled={!canOut}
          onClick={() => checkOut(nowMinutes())}
        >
          Ketdim
        </button>
      </div>
    </div>
  );
}
