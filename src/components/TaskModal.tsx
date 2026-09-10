import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type { Difficulty, Task } from '../types';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../data/difficulty';

export interface TaskDraft {
  title: string;
  difficulty: Difficulty;
  hours?: number;
  days?: number;
  note?: string;
}

interface Props {
  isOpen: boolean;
  /** Tahrirlanayotgan vazifa (edit rejimi) yoki null (yangi qo'shish) */
  editing?: Task | null;
  /** Yangi qo'shishda oldindan tanlangan ustun */
  defaultDifficulty?: Difficulty;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
}

export default function TaskModal({
  isOpen,
  editing,
  defaultDifficulty = 'oson',
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [hours, setHours] = useState<number>(1);
  const [days, setDays] = useState<number>(3);

  // Oyna ochilganda maydonlarni to'ldirish
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTitle(editing.title);
      setDifficulty(editing.difficulty);
      setHours(editing.hours ?? 1);
      setDays(editing.days ?? 3);
    } else {
      setTitle('');
      setDifficulty(defaultDifficulty);
      setHours(1);
      setDays(3);
    }
  }, [isOpen, editing, defaultDifficulty]);

  const isMultiDay = difficulty === 'judaqiyin';

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const draft: TaskDraft = { title: trimmed, difficulty };
    if (isMultiDay) draft.days = Math.max(1, Math.round(days));
    else draft.hours = Math.max(0.25, hours);
    onSubmit(draft);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.72}
      breakpoints={[0, 0.72, 0.95]}
      handle
    >
      <IonHeader className="modal-header">
        <IonToolbar>
          <IonTitle>
            {editing ? 'Vazifani tahrirlash' : "Yangi vazifa qo'shish"}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Yopish</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="modal-body">
        <div style={{ padding: '18px 18px 8px' }}>
          <div className="field">
            <label className="field-label">Vazifa nomi</label>
            <IonInput
              className="app-input"
              value={title}
              placeholder="Masalan: Hisobotni yakunlash"
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Qiyinlik darajasi</label>
            <IonSelect
              className="app-select"
              value={difficulty}
              interface="action-sheet"
              cancelText="Bekor"
              onIonChange={(e) => setDifficulty(e.detail.value)}
            >
              {DIFFICULTY_ORDER.map((key) => {
                const d = DIFFICULTIES[key];
                return (
                  <IonSelectOption key={key} value={key}>
                    {d.label} · {d.sub} (+{d.points})
                  </IonSelectOption>
                );
              })}
            </IonSelect>
          </div>

          {isMultiDay ? (
            <div className="field">
              <label className="field-label">Taxminiy muddat (kun)</label>
              <IonInput
                className="app-input"
                type="number"
                min="1"
                step="1"
                value={String(days)}
                onIonInput={(e) => setDays(Number(e.detail.value) || 1)}
              />
            </div>
          ) : (
            <div className="field">
              <label className="field-label">Taxminiy vaqt (soat)</label>
              <IonInput
                className="app-input"
                type="number"
                min="0.25"
                step="0.25"
                value={String(hours)}
                onIonInput={(e) => setHours(Number(e.detail.value) || 0.25)}
              />
            </div>
          )}

          <IonButton
            expand="block"
            className="submit-btn"
            style={{ marginTop: 8 }}
            onClick={submit}
          >
            {editing ? 'Saqlash' : "Qo'shish"}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
