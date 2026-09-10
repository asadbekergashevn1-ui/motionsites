import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonSpinner, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  homeOutline,
  home,
  gridOutline,
  grid,
  statsChartOutline,
  statsChart,
  personOutline,
  person,
} from 'ionicons/icons';
import { useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { useTheme } from './theme/useTheme';
import { isSupabaseConfigured } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';

setupIonicReact({ mode: 'ios' });

/** Tizimga kirilgandan keyingi asosiy ilova (tab navigatsiyasi) */
function AuthedApp() {
  const { state } = useApp();
  useTheme(state.settings.theme);

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/asosiy" component={HomePage} />
          <Route exact path="/vazifalar" component={TasksPage} />
          <Route exact path="/statistika" component={StatsPage} />
          <Route exact path="/profil" component={ProfilePage} />
          <Route exact path="/">
            <Redirect to="/asosiy" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="asosiy" href="/asosiy">
            <IonIcon aria-hidden="true" ios={homeOutline} md={home} />
            <IonLabel>Asosiy</IonLabel>
          </IonTabButton>
          <IonTabButton tab="vazifalar" href="/vazifalar">
            <IonIcon aria-hidden="true" ios={gridOutline} md={grid} />
            <IonLabel>Vazifalar</IonLabel>
          </IonTabButton>
          <IonTabButton tab="statistika" href="/statistika">
            <IonIcon aria-hidden="true" ios={statsChartOutline} md={statsChart} />
            <IonLabel>Statistika</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profil" href="/profil">
            <IonIcon aria-hidden="true" ios={personOutline} md={person} />
            <IonLabel>Profil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}

/** Ildiz komponent: tizimga kirilmagan bo'lsa Login, kirilgan bo'lsa ilova */
export default function App() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <IonApp>
        <div className="splash">
          <div className="card-surface auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-logo" style={{ margin: '0 auto 14px' }}>
              !
            </div>
            <div className="auth-title" style={{ marginBottom: 8 }}>
              Supabase sozlanmagan
            </div>
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
