import { useState } from 'react';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import type { Difficulty, Task } from '../types';
import { useApp } from '../context/AppContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal, { TaskDraft } from '../components/TaskModal';

export default function TasksPage() {
  const { addTask, updateTask } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultDiff, setDefaultDiff] = useState<Difficulty>('oson');

  const openAdd = (difficulty: Difficulty) => {
    setEditing(null);
    setDefaultDiff(difficulty);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSubmit = (draft: TaskDraft) => {
    if (editing) {
      // Tahrirlash — ustun (difficulty) o'zgarsa, tegishli maydonlar yangilanadi
      const patch: Partial<Task> = {
        title: draft.title,
        difficulty: draft.difficulty,
        hours: draft.hours,
        days: draft.days,
      };
      if (draft.difficulty === 'judaqiyin' && editing.dayProgress == null) {
        patch.dayProgress = 0;
      }
      updateTask(editing.id, patch);
    } else {
      addTask({
        title: draft.title,
        difficulty: draft.difficulty,
        hours: draft.hours,
        days: draft.days,
        ...(draft.difficulty === 'judaqiyin' ? { dayProgress: 0 } : {}),
      });
    }
    setModalOpen(false);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="page-pad">
          <div style={{ paddingTop: 8, marginBottom: 6 }}>
            <div className="section-title" style={{ fontSize: 22, fontWeight: 800 }}>
              Vazifalar taxtasi
            </div>
            <div className="greeting-date">
              Vazifani bosib ushlang va kerakli ustunga suring
            </div>
          </div>

          <KanbanBoard onAddTask={openAdd} onEditTask={openEdit} />
        </div>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton className="fab-add" onClick={() => openAdd('oson')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <TaskModal
          isOpen={modalOpen}
          editing={editing}
          defaultDifficulty={defaultDiff}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </IonContent>
    </IonPage>
  );
}
