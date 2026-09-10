import { useState } from 'react';
import { IonActionSheet } from '@ionic/react';
import type { Task } from '../types';
import { DIFFICULTIES } from '../data/difficulty';

interface Props {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDayProgress?: (value: number) => void;
  /** Sudrash (drag) uchun — butun kartaga biriktiriladi */
  onPointerDown?: (e: React.PointerEvent) => void;
  dragging?: boolean;
  entering?: boolean;
}

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onDayProgress,
  onPointerDown,
  dragging,
  entering,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const meta = DIFFICULTIES[task.difficulty];
  const isMultiDay = task.difficulty === 'judaqiyin';
  const pct = isMultiDay
    ? Math.round(((task.dayProgress ?? 0) / (task.days ?? 1)) * 100)
    : 0;

  const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`task-card${task.completed ? ' completed' : ''}${
        dragging ? ' dragging' : ''
      }${entering ? ' card-enter' : ''}`}
      style={{
        // @ts-expect-error CSS o'zgaruvchisi
        '--card-color': meta.colorVar,
        '--card-soft': meta.softVar,
      }}
      onPointerDown={onPointerDown}
    >
      <div className="task-top">
        <span className="task-title">{task.title}</span>
        <span
          className="badge task-points"
          style={{ background: meta.softVar, color: meta.colorVar }}
        >
          +{meta.points}
        </span>
      </div>

      {isMultiDay ? (
        <>
          <div className="progress-track" style={{ marginTop: 10 }}>
            <div
              className="progress-fill"
              style={{ width: `${pct}%`, background: meta.colorVar }}
            />
          </div>
          <div className="task-bottom">
            <div className="day-stepper" onPointerDown={stop}>
              <button
                className="step-btn"
                aria-label="Kamaytirish"
                onClick={() => onDayProgress?.((task.dayProgress ?? 0) - 1)}
              >
                −
              </button>
              <span className="task-time mono">
                {task.dayProgress ?? 0}/{task.days ?? 1} kun
              </span>
              <button
                className="step-btn"
                aria-label="Oshirish"
                onClick={() => onDayProgress?.((task.dayProgress ?? 0) + 1)}
              >
                +
              </button>
            </div>
            <button
              className="kebab"
              onPointerDown={stop}
              onClick={() => setSheetOpen(true)}
              aria-label="Amallar"
            >
              ⋮
            </button>
          </div>
        </>
      ) : (
        <div className="task-bottom">
          <span className="task-time">{task.hours ?? 1} soat</span>
          <div className="task-actions" onPointerDown={stop}>
            <button
              className="kebab"
              onClick={() => setSheetOpen(true)}
              aria-label="Amallar"
            >
              ⋮
            </button>
            <button
              className={`checkbox${task.completed ? ' checked' : ''}`}
              onClick={onToggle}
              aria-label="Bajarildi"
            >
              {task.completed ? '✓' : ''}
            </button>
          </div>
        </div>
      )}

      <IonActionSheet
        isOpen={sheetOpen}
        onDidDismiss={() => setSheetOpen(false)}
        header={task.title}
        buttons={[
          {
            text: task.completed ? "Bajarilmagan deb belgilash" : 'Bajarildi',
            handler: onToggle,
          },
          { text: 'Tahrirlash', handler: onEdit },
          { text: "O'chirish", role: 'destructive', handler: onDelete },
          { text: 'Bekor qilish', role: 'cancel' },
        ]}
      />
    </div>
  );
}
