import {
  IonAlert,
  IonContent,
  IonInput,
  IonPage,
} from '@ionic/react';
import { useState } from 'react';
import type { ThemeMode } from '../types';
import { useApp, type SyncStatus } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fmtClock, parseClock } from '../utils/time';

const THEME_OPTS: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: 'Yorug\'' },
  { key: 'dark', label: 'Qorong\'u' },
  { key: 'system', label: 'Tizim' },
];

const SYNC_META: Record<SyncStatus, { label: string; color: string; bg: string }> = {
  synced: { label: '✓ Sinxronlangan', color: 'var(--c-easy)', bg: 'var(--c-easy-soft)' },
  syncing: { label: '⟳ Sinxronlanmoqda…', color: 'var(--c-medium)', bg: 'var(--c-medium-soft)' },
  offline: { label: '⚠ Oflayn (mahalliy)', color: 'var(--c-hard)', bg: 'var(--c-hard-soft)' },
  error: { label: '✕ Xatolik', color: 'var(--c-veryhard)', bg: 'var(--c-veryhard-soft)' },
};

export default function ProfilePage() {
  const { state, updateSettings, syncStatus, hardReset } = useApp();
  const { user, signOut } = useAuth();
  const s = state.settings;
  const [resetOpen, setResetOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const initials = s.userName.trim().charAt(0).toUpperCase() || 'A';
  const sync = SYNC_META[syncStatus];

  return (
    <IonPage>
      <IonContent>
        <div className="page-pad page-enter">
          <div style={{ paddingTop: 8, marginBottom: 12 }}>
            <div className="section-title" style={{ fontSize: 22, fontWeight: 800 }}>
              Profil
            </div>
          </div>

          {/* Foydalanuvchi kartasi */}
          <div className="card-surface profile-hero">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-name">{s.userName}</div>
              <div className="profile-sub">{user?.email}</div>
            </div>
          </div>

          {/* Hisob va sinxronizatsiya */}
          <div className="section-head">
            <div className="section-title">Hisob</div>
          </div>
          <div className="card-surface" style={{ padding: '4px 16px' }}>
            <div className="setting-row">
              <div>
                <div className="setting-label">Sinxronizatsiya</div>
                <div className="setting-hint">Barcha qurilmalarda bir xil</div>
              </div>
              <span
                className="badge sync-badge"
                style={{ background: sync.bg, color: sync.color }}
              >
                {sync.label}
              </span>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Hisobdan chiqish</div>
                <div className="setting-hint">Boshqa qurilmadagi hisobingiz saqlanadi</div>
              </div>
              <button
                className="att-btn att-out"
                style={{ flex: '0 0 auto', padding: '9px 16px' }}
                onClick={() => setSignOutOpen(true)}
              >
                Chiqish
              </button>
            </div>
          </div>

          {/* Mavzu */}
          <div className="section-head">
            <div className="section-title">Ko'rinish</div>
          </div>
          <div className="card-surface" style={{ padding: '4px 16px' }}>
            <div className="setting-row">
              <div>
                <div className="setting-label">Mavzu</div>
                <div className="setting-hint">Yorug', qorong'u yoki tizim bo'yicha</div>
              </div>
              <div className="theme-toggle">
                {THEME_OPTS.map((opt) => (
                  <button
                    key={opt.key}
                    className={`theme-opt${s.theme === opt.key ? ' active' : ''}`}
                    onClick={() => updateSettings({ theme: opt.key })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sozlamalar */}
          <div className="section-head">
            <div className="section-title">Sozlamalar</div>
          </div>
          <div className="card-surface" style={{ padding: '4px 16px' }}>
            <div className="setting-row">
              <div className="setting-label">Ism</div>
              <IonInput
                className="app-input"
                style={{ maxWidth: 180 }}
                value={s.userName}
                onIonInput={(e) => updateSettings({ userName: e.detail.value || '' })}
              />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Smena boshlanishi</div>
                <div className="setting-hint">Kechiksangiz jarima</div>
              </div>
              <IonInput
                className="app-input"
                type="time"
                style={{ maxWidth: 130 }}
                value={fmtClock(s.shiftStart)}
                onIonInput={(e) =>
                  updateSettings({ shiftStart: parseClock(e.detail.value || '09:00') })
                }
              />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Smena tugashi</div>
                <div className="setting-hint">Erta ketsangiz jarima</div>
              </div>
              <IonInput
                className="app-input"
                type="time"
                style={{ maxWidth: 130 }}
                value={fmtClock(s.shiftEnd)}
                onIonInput={(e) =>
                  updateSettings({ shiftEnd: parseClock(e.detail.value || '18:00') })
                }
              />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">Kunlik chegara (ball)</div>
                <div className="setting-hint">Streak uchun minimal ball</div>
              </div>
              <IonInput
                className="app-input"
                type="number"
                style={{ maxWidth: 110 }}
                value={String(s.dailyThreshold)}
                onIonInput={(e) =>
                  updateSettings({ dailyThreshold: Number(e.detail.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Mukofot / Jarima */}
          <div className="section-head">
            <div className="section-title">Mukofot va jarima</div>
            <span className="section-sub">haftalik natijaga qarab</span>
          </div>
          <div className="card-surface" style={{ padding: 16 }}>
            <div className="field">
              <label className="field-label">🎁 Yaxshi hafta uchun mukofot</label>
              <IonInput
                className="app-input"
                value={s.weeklyReward}
                onIonInput={(e) => updateSettings({ weeklyReward: e.detail.value || '' })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">⚠️ Yomon hafta uchun jarima</label>
              <IonInput
                className="app-input"
                value={s.weeklyPenalty}
                onIonInput={(e) => updateSettings({ weeklyPenalty: e.detail.value || '' })}
              />
            </div>
          </div>

          {/* Ma'lumotni tozalash */}
          <div className="section-head">
            <div className="section-title">Ma'lumot</div>
          </div>
          <div className="card-surface" style={{ padding: '4px 16px' }}>
            <div className="setting-row">
              <div>
                <div className="setting-label" style={{ color: 'var(--c-danger)' }}>
                  Hammasini tozalash
                </div>
                <div className="setting-hint">Barcha vazifa va sozlamalar o'chadi</div>
              </div>
              <button
                className="att-btn att-out"
                style={{ flex: '0 0 auto', padding: '9px 16px' }}
                onClick={() => setResetOpen(true)}
              >
                Tozalash
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--c-text-3)', fontSize: 11, marginTop: 20 }}>
            Ish Ritmi v1.0 · shaxsiy foydalanish uchun
          </div>
        </div>

        <IonAlert
          isOpen={resetOpen}
          onDidDismiss={() => setResetOpen(false)}
          header="Ishonchingiz komilmi?"
          message="Barcha ma'lumotlar (barcha qurilmalarda) o'chiriladi va ilova qayta ishga tushadi."
          buttons={[
            { text: 'Bekor', role: 'cancel' },
            {
              text: "O'chirish",
              role: 'destructive',
              handler: () => {
                hardReset();
              },
            },
          ]}
        />

        <IonAlert
          isOpen={signOutOpen}
          onDidDismiss={() => setSignOutOpen(false)}
          header="Hisobdan chiqasizmi?"
          message="Ma'lumotlaringiz Supabase'da saqlanadi — keyingi safar shu email bilan kirsangiz hammasi joyida bo'ladi."
          buttons={[
            { text: 'Bekor', role: 'cancel' },
            { text: 'Chiqish', role: 'destructive', handler: () => signOut() },
          ]}
        />
      </IonContent>
    </IonPage>
  );
}
