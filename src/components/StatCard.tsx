import { useEffect, useRef } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  subTone?: 'neg' | 'pos';
  hero?: boolean;
}

/** Statistika kartasi — o'zgarganda qiymat "sakraydi" (bump) */
export default function StatCard({ label, value, sub, subTone, hero }: Props) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const prev = useRef<string>('');

  useEffect(() => {
    const str = String(value);
    if (prev.current && prev.current !== str && valueRef.current) {
      const el = valueRef.current;
      el.classList.remove('bump');
      // reflow — animatsiyani qayta ishga tushirish uchun
      void el.offsetWidth;
      el.classList.add('bump');
    }
    prev.current = str;
  }, [value]);

  return (
    <div className={`stat-card ${hero ? 'stat-hero' : 'stat-plain'}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value mono" ref={valueRef}>
        {value}
      </span>
      {sub && <span className={`stat-sub ${subTone ?? ''}`}>{sub}</span>}
    </div>
  );
}
