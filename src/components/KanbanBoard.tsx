import { useEffect, useRef, useState } from 'react';
import type { Difficulty, Task } from '../types';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../data/difficulty';
import { useApp } from '../context/AppContext';
import TaskCard from './TaskCard';

interface Props {
  onAddTask: (difficulty: Difficulty) => void;
  onEditTask: (task: Task) => void;
  /** Faqat shu ustunlarni ko'rsatish (filtrlangan ko'rinish uchun) */
  visibleColumns?: Difficulty[];
}

const LONG_PRESS_MS = 180;
const MOVE_THRESHOLD = 12;

export default function KanbanBoard({
  onAddTask,
  onEditTask,
  visibleColumns,
}: Props) {
  const { state, toggleTask, deleteTask, moveTask, setDayProgress } = useApp();
  const columns = visibleColumns ?? DIFFICULTY_ORDER;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<Difficulty | null>(null);
  const [ghost, setGhost] = useState<{ task: Task; x: number; y: number } | null>(
    null
  );

  // Drag holati (render'dan tashqari)
  const drag = useRef({
    id: null as string | null,
    activated: false,
    startX: 0,
    startY: 0,
    timer: 0 as unknown as ReturnType<typeof setTimeout>,
  });

  useEffect(() => {
    // Aktiv drag paytida sahifa scroll bo'lmasligi uchun
    const prevent = (e: TouchEvent) => {
      if (drag.current.activated) e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  const cleanup = () => {
    clearTimeout(drag.current.timer);
    drag.current = {
      id: null,
      activated: false,
      startX: 0,
      startY: 0,
      timer: drag.current.timer,
    };
    setDraggingId(null);
    setHoverCol(null);
    setGhost(null);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };

  const columnUnder = (x: number, y: number): Difficulty | null => {
    const el = document.elementFromPoint(x, y);
    const col = el?.closest('[data-col]') as HTMLElement | null;
    const key = col?.dataset.col as Difficulty | undefined;
    return key ?? null;
  };

  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d.id) return;
    if (!d.activated) {
      const dist =
        Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY);
      if (dist > MOVE_THRESHOLD) {
        // Foydalanuvchi scroll qilyapti — drag'ni bekor qilamiz
        cleanup();
      }
      return;
    }
    e.preventDefault();
    const task = state.tasks.find((t) => t.id === d.id) ?? null;
    if (task) setGhost({ task, x: e.clientX, y: e.clientY });
    setHoverCol(columnUnder(e.clientX, e.clientY));
  };

  const onUp = (e: PointerEvent) => {
    const d = drag.current;
    if (d.activated && d.id) {
      const target = columnUnder(e.clientX, e.clientY);
      const task = state.tasks.find((t) => t.id === d.id);
      if (target && task && task.difficulty !== target) {
        moveTask(d.id, target);
        if ('vibrate' in navigator) navigator.vibrate?.(15);
      }
    }
    cleanup();
  };

  const startDrag = (e: React.PointerEvent, task: Task) => {
    // Faqat asosiy tugma / bitta barmoq
    if (e.button !== undefined && e.button !== 0) return;
    drag.current.id = task.id;
    drag.current.activated = false;
    drag.current.startX = e.clientX;
    drag.current.startY = e.clientY;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    clearTimeout(drag.current.timer);
    drag.current.timer = setTimeout(() => {
      drag.current.activated = true;
      setDraggingId(task.id);
      setGhost({ task, x: e.clientX, y: e.clientY });
      if ('vibrate' in navigator) navigator.vibrate?.(10);
    }, LONG_PRESS_MS);
  };

  return (
    <div className="board" role="list">
      {columns.map((colId) => {
        const meta = DIFFICULTIES[colId];
        const colTasks = state.tasks.filter((t) => t.difficulty === colId);
        return (
          <div
            key={colId}
            className={`column${hoverCol === colId ? ' drag-over' : ''}`}
            data-col={colId}
          >
            <div className="column-head">
              <div className="column-title">
                <span className="dot" style={{ background: meta.colorVar }} />
                {meta.label}
                <span className="column-count">{colTasks.length}</span>
              </div>
              <div className="column-sub">
                {meta.sub} · +{meta.points} ball
              </div>
            </div>

            <div className="column-body">
              {colTasks.length === 0 && (
                <div className="column-empty">Bo'sh — vazifa qo'shing</div>
              )}
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dragging={draggingId === task.id}
                  onPointerDown={(e) => startDrag(e, task)}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  onDayProgress={(v) => setDayProgress(task.id, v)}
                />
              ))}
            </div>

            <button className="add-task-btn" onClick={() => onAddTask(colId)}>
              + Vazifa qo'shish
            </button>
          </div>
        );
      })}

      {ghost && draggingId && (
        <div
          className="drag-ghost"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <span className="dot" style={{ background: DIFFICULTIES[ghost.task.difficulty].colorVar }} />
          {ghost.task.title}
        </div>
      )}
    </div>
  );
}
