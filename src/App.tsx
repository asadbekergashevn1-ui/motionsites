import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { useTheme } from './theme/useTheme';
import { isSupabaseConfigured } from './lib/supabase';
import Sidebar from './components/Sidebar';
import RewardPopup from './components/RewardPopup';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';

setupIonicReact({ mode: 'ios' });

function AuthedApp() {
  const { state } = useApp();
  const { signOut } = useAuth();
  useTheme(state.settings.theme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Hisobdan chiqasizmi?")) {
      signOut();
    }
  };

  return (
    <IonReactRouter>
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="app-main">
          <div className="mobile-topbar">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menyu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <button
              className="topbar-logout-btn"
              onClick={handleLogout}
              aria-label="Chiqish"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Chiqish</span>
            </button>
          </div>

          <IonRouterOutlet animated={false}>
            <Route exact path="/asosiy" component={HomePage} />
            <Route exact path="/vazifalar" component={TasksPage} />
            <Route exact path="/statistika" component={StatsPage} />
            <Route exact path="/profil" component={ProfilePage} />
            <Route exact path="/">
              <Redirect to="/asosiy" />
            </Route>
          </IonRouterOutlet>
        </main>
      </div>

      <RewardPopup />
    </IonReactRouter>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <IonApp>
        <div className="splash">
          <div className="card-surface auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-logo" style={{ margin: '0 auto 14px' }}>!</div>
            <div className="auth-title" style={{ marginBottom: 8 }}>Supabase sozlanmagan</div>
            <div className="setting-hint" style={{ fontSize: 13, lineHeight: 1.6 }}>
              Loyiha ildizida <code>.env</code> fayl yarating va{' '}
              <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>{' '}
              qiymatlarini kiriting (<code>.env.example</code>ga qarang), so'ng
              serverni qayta ishga tushiring.
            </div>
          </div>
        </div>
      </IonApp>
    );
  }

  if (loading) {
    return (
      <IonApp>
        <div className="splash">
          <IonSpinner name="crescent" />
        </div>
      </IonApp>
    );
  }

  if (!user) {
    return (
      <IonApp>
        <LoginPage />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <AppProvider>
        <AuthedApp />
      </AppProvider>
    </IonApp>
  );
}
