import { useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import type { ThemeMode } from '../types';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { path: '/asosiy', label: 'Asosiy', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/vazifalar', label: 'Vazifalar', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { path: '/statistika', label: 'Statistika', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/profil', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, updateSettings } = useApp();
  const location = useLocation();
  const history = useHistory();
  const backdropRef = useRef<HTMLDivElement>(null);

  const initials = state.settings.userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navigate = (path: string) => {
    history.push(path);
    onClose();
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(state.settings.theme);
    updateSettings({ theme: order[(idx + 1) % order.length] });
  };

  const themeLabel =
    state.settings.theme === 'light'
      ? 'Yorug\''
      : state.settings.theme === 'dark'
        ? 'Qorong\'u'
        : 'Tizim';

  const themeIcon =
    state.settings.theme === 'light'
      ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
      : state.settings.theme === 'dark'
        ? 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
        : 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';

  return (
    <>
      <div
        ref={backdropRef}
        className={`sidebar-backdrop${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />
      <nav className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-name">{state.settings.userName}</div>
            <div className="sidebar-role">Shaxsiy ish boshqaruvi</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-theme-toggle" onClick={cycleTheme}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={themeIcon} />
            </svg>
            <span>{themeLabel}</span>
            <div className="theme-pill">
              <div className={`theme-pill-dot${state.settings.theme === 'dark' ? ' dark' : ''}`} />
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
