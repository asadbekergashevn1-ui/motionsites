import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
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
import { useApp } from './context/AppContext';
import { useTheme } from './theme/useTheme';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';

setupIonicReact({ mode: 'ios' });

export default function App() {
  const { state } = useApp();
  useTheme(state.settings.theme);

  return (
    <IonApp>
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
    </IonApp>
  );
}
