import { useEffect, useRef } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  subTone?: 'neg' | 'pos';
  color?: 'pink' | 'blue' | 'yellow' | 'purple';
  icon?: string;
}

const COLOR_MAP = {
  pink: { bg: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)', iconBg: 'rgba(255,255,255,0.22)' },
  blue: { bg: 'linear-gradient(135deg, #4facfe 0%, #2f80ed 100%)', iconBg: 'rgba(255,255,255,0.22)' },
  yellow: { bg: 'linear-gradient(135deg, #F4CA7A 0%, #e0a84a 100%)', iconBg: 'rgba(255,255,255,0.22)' },
  purple: { bg: 'linear-gradient(135deg, #a18cd1 0%, #6c5ce7 100%)', iconBg: 'rgba(255,255,255,0.22)' },
};

const ICONS: Record<string, JSX.Element> = {
  star: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  zap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  trend: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

export default function StatCard({ label, value, sub, subTone, color, icon }: Props) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const prev = useRef<string>('');

  useEffect(() => {
    const str = String(value);
    if (prev.current && prev.current !== str && valueRef.current) {
      const el = valueRef.current;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
    prev.current = str;
  }, [value]);

  const colorStyle = color ? COLOR_MAP[color] : null;

  if (colorStyle) {
    return (
      <div className="stat-card stat-colorful" style={{ background: colorStyle.bg }}>
        {icon && ICONS[icon] && (
          <div className="stat-icon-circle" style={{ background: colorStyle.iconBg }}>
            {ICONS[icon]}
          </div>
        )}
        <span className="stat-label">{label}</span>
        <span className="stat-value mono" ref={valueRef}>{value}</span>
        {sub && <span className={`stat-sub ${subTone ?? ''}`}>{sub}</span>}
      </div>
    );
  }

  return (
    <div className="stat-card stat-plain">
      <span className="stat-label">{label}</span>
      <span className="stat-value mono" ref={valueRef}>{value}</span>
      {sub && <span className={`stat-sub ${subTone ?? ''}`}>{sub}</span>}
    </div>
  );
}
