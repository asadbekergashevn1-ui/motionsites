import { useRef, useEffect, useCallback } from 'react';
import { currentWeekDates, getDayInfo, isoDate, todayWeekIndex } from '../utils/time';
import { useApp } from '../context/AppContext';

interface WeekSliderProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export default function WeekSlider({ selectedDate, onSelect }: WeekSliderProps) {
  const { state } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const weekDates = currentWeekDates();
  const today = isoDate();
  const todayIdx = todayWeekIndex();

  const findDayRecord = useCallback(
    (date: string) => state.history.find((h) => h.date === date),
    [state.history]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('.week-day.active') as HTMLElement;
    if (activeBtn) {
      const offset = activeBtn.offsetLeft - el.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      el.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [selectedDate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = e.clientX - startX.current;
    containerRef.current.scrollLeft = scrollLeft.current - dx;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="week-slider"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {weekDates.map((date, i) => {
        const info = getDayInfo(date);
        const isToday = date === today;
        const isActive = date === selectedDate;
        const isFuture = i > todayIdx;
        const record = findDayRecord(date);
        const hasDone = !!record?.tasks && record.tasks.done > 0;

        return (
          <button
            key={date}
            className={`week-day${isActive ? ' active' : ''}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
            onClick={() => !isFuture && onSelect(date)}
            disabled={isFuture}
          >
            <span className="week-day-name">{info.dayName}</span>
            <span className="week-day-num">{info.dayNum}</span>
            {hasDone && !isFuture && <span className="week-day-dot" />}
          </button>
        );
      })}
    </div>
  );
}
