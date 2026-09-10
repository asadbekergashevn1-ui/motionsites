import { useState } from 'react';
import { IonButton, IonContent, IonInput, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

type Mode = 'in' | 'up';

export default function LoginPage() {
  const { signIn, signUp, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    clearError();
    setInfo(null);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    setInfo(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError("To'g'ri email kiriting");
      return;
    }
    if (password.length < 6) {
      setFormError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'in') {
        await signIn(trimmedEmail, password);
      } else {
        await signUp(trimmedEmail, password);
        setInfo(
          "Hisob yaratildi 🎉 Agar Supabase'da email tasdiqlash yoqilgan bo'lsa, " +
            "pochtangizni tekshiring. Aks holda \"Kirish\" bo'limidan davom eting."
        );
      }
    } catch {
      // Xato AuthContext orqali `error` ga yoziladi va pastda ko'rsatiladi
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="auth-wrap">
          <div className="auth-brand">
            <div className="auth-logo">IR</div>
            <div className="auth-title">Ish Ritmi</div>
            <div className="auth-sub">Bitta hisob — barcha qurilmalarda</div>
          </div>

          <div className="card-surface auth-card">
            <div className="chip-row" style={{ marginBottom: 18 }}>
              <button
                className={`chip${mode === 'in' ? ' active' : ''}`}
                onClick={() => switchMode('in')}
              >
                Kirish
              </button>
              <button
                className={`chip${mode === 'up' ? ' active' : ''}`}
                onClick={() => switchMode('up')}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            <div className="field">
              <label className="field-label">Email</label>
              <IonInput
                className="app-input"
                type="email"
                placeholder="siz@misol.com"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? '')}
              />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label className="field-label">Parol</label>
              <IonInput
                className="app-input"
                type="password"
                placeholder="kamida 6 ta belgi"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </div>

            {(formError || error) && (
              <div className="auth-error">{formError ?? error}</div>
            )}
            {info && <div className="auth-info">{info}</div>}

            <IonButton
              expand="block"
              className="submit-btn"
              style={{ marginTop: 6 }}
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? (
                <IonSpinner name="crescent" />
              ) : mode === 'in' ? (
                'Kirish'
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </IonButton>
          </div>

          <div className="auth-hint">
            Bir marta kiring — vazifalaringiz, ballaringiz va sozlamalaringiz
            telefon, planshet va kompyuterda avtomatik bir xil bo'ladi.
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
