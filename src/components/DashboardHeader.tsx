import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLongDate, formatTime } from '../utils/time';

export default function DashboardHeader() {
  const { state, updateSettings } = useApp();
  const [now, setNow] = useState(new Date());
  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteText, setQuoteText] = useState(state.settings.motivationalQuote);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const firstName = state.settings.userName.split(' ').pop() || state.settings.userName;

  const saveQuote = () => {
    if (quoteText.trim()) {
      updateSettings({ motivationalQuote: quoteText.trim() });
    }
    setEditingQuote(false);
  };

  return (
    <div className="dash-header">
      <div className="dash-header-content">
        <div className="dash-header-text">
          <div className="dash-date">{formatLongDate(now)} · {formatTime(now)}</div>
          <h1 className="dash-greeting">
            Salom {firstName}, <br />bugun nima qilamiz?
          </h1>
          {editingQuote ? (
            <div className="dash-quote-edit">
              <input
                className="dash-quote-input"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                onBlur={saveQuote}
                onKeyDown={(e) => e.key === 'Enter' && saveQuote()}
                autoFocus
              />
            </div>
          ) : (
            <p
              className="dash-quote"
              onClick={() => {
                setQuoteText(state.settings.motivationalQuote);
                setEditingQuote(true);
              }}
            >
              "{state.settings.motivationalQuote}"
            </p>
          )}
        </div>
        <div className="dash-header-img">
          <img src="/images/calendar-clock.png" alt="" />
        </div>
      </div>
    </div>
  );
}
