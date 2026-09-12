import { useState } from 'react';
import { useApp } from '../context/AppContext';
export default function RewardPopup() {
  const { state, acceptWeeklyReward } = useApp();
  const [closing, setClosing] = useState(false);

  if (!state.weeklyRewardPending) return null;

  const totalDays = state.history.length;
  const goodDays = state.history.filter(
    (d) => d.netPoints >= state.settings.dailyThreshold
  ).length;
  const isGoodWeek = totalDays > 0 && goodDays >= Math.ceil(totalDays * 0.6);

  const handleAccept = () => {
    setClosing(true);
    setTimeout(() => {
      acceptWeeklyReward();
    }, 500);
  };

  return (
    <div className={`reward-overlay${closing ? ' closing' : ''}`}>
      <div className={`reward-popup${closing ? ' closing' : ''}`}>
        <div className="reward-img-wrap">
          <img src="/images/gift-box.jpg" alt="" className="reward-img" />
        </div>

        {isGoodWeek ? (
          <>
            <h2 className="reward-title">Tabriklaymiz!</h2>
            <p className="reward-desc">
              Siz bu haftani muvaffaqiyatli yakunladingiz.
              {totalDays > 0 && (
                <span className="reward-stat">
                  {' '}{goodDays}/{totalDays} kun maqsadga erishildi
                </span>
              )}
            </p>
            <div className="reward-prize good">
              <span className="reward-emoji">🎁</span>
              <span>{state.settings.weeklyReward}</span>
            </div>
          </>
        ) : (
          <>
            <h2 className="reward-title penalty">Hafta yakunlandi</h2>
            <p className="reward-desc">
              Bu hafta maqsadga etarlicha erishilmadi.
              {totalDays > 0 && (
                <span className="reward-stat">
                  {' '}{goodDays}/{totalDays} kun maqsadga erishildi
                </span>
              )}
            </p>
            <div className="reward-prize bad">
              <span className="reward-emoji">⚠️</span>
              <span>{state.settings.weeklyPenalty}</span>
            </div>
          </>
        )}

        <button className="reward-accept-btn" onClick={handleAccept}>
          Qabul qilish
        </button>
      </div>
    </div>
  );
}
