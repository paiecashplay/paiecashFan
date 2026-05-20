import React, { useState, useEffect } from 'react';
import { Goal, ShieldCheck, Circle } from 'lucide-react';

export default function FootballAnimation() {
  const [phase, setPhase] = useState('ready'); // ready, kicking, flying, result
  const [outcome, setOutcome] = useState(null); // goal, save

  useEffect(() => {
    const timer = setInterval(() => {
      startAnimation();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const startAnimation = () => {
    setPhase('ready');
    setTimeout(() => {
      setPhase('kicking');
      setTimeout(() => {
        setPhase('flying');
        const res = Math.random() > 0.4 ? 'goal' : 'save';
        setOutcome(res);
        setTimeout(() => {
          setPhase('result');
        }, 1000);
      }, 500);
    }, 500);
  };

  return (
    <div className="football-anim-container">
      {/* Field Background */}
      <div className="field-lines">
        <div className="penalty-box" />
        <div className="penalty-spot" />
      </div>

      {/* Goal Post */}
      <div className="goal-post">
        <div className="goal-net" />
      </div>

      {/* Goalkeeper */}
      <div className={`keeper ${phase === 'flying' ? (outcome === 'save' ? 'dive-save' : 'dive-miss') : ''}`}>
        <ShieldCheck size={48} color="#f87171" strokeWidth={2.5} />
        <div className="keeper-name">KEEPER</div>
      </div>

      {/* Ball */}
      <div className={`ball ${phase === 'flying' ? `ball-path-${outcome}` : phase === 'kicking' ? 'ball-kicked' : ''}`}>
        <Circle size={24} fill="#fff" color="#000" strokeWidth={1} />
      </div>

      {/* Striker */}
      <div className={`striker ${phase === 'kicking' ? 'striker-kick' : ''}`}>
        <Goal size={56} color="#10b981" strokeWidth={2} />
        <div className="striker-name">STRIKER</div>
      </div>

      {/* Result Text */}
      {phase === 'result' && (
        <div className={`result-overlay ${outcome}`}>
          {outcome === 'goal' ? 'GOAL! ⚽🔥' : 'SAVED! 🧤🛡️'}
        </div>
      )}

      <style>{`
        .football-anim-container {
          position: relative;
          width: 100%;
          height: 300px;
          background: linear-gradient(180deg, #064e3b 0%, #065f46 100%);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .field-lines {
          position: absolute;
          inset: 0;
          opacity: 0.3;
        }
        .penalty-box {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 120px;
          border: 2px solid #fff;
          border-top: none;
        }
        .penalty-spot {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
        }

        .goal-post {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 80px;
          border: 4px solid #fff;
          border-top: none;
          z-index: 1;
        }
        .goal-net {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 10px 10px;
          opacity: 0.2;
        }

        .striker {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          transition: transform 0.3s;
          z-index: 5;
          text-align: center;
        }
        .striker-kick {
          transform: translateX(-50%) scale(1.1) translateY(-10px);
        }
        .striker-name { font-size: 10px; font-weight: 900; color: #10b981; margin-top: 4px; }

        .keeper {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 4;
          text-align: center;
        }
        .keeper-name { font-size: 10px; font-weight: 900; color: #f87171; margin-top: 4px; }

        .dive-save { transform: translate(-120px, 10px) rotate(-45deg); }
        .dive-miss { transform: translate(100px, 10px) rotate(45deg); }

        .ball {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
        }

        .ball-path-goal {
          animation: flight-goal 0.8s forwards ease-out;
        }
        .ball-path-save {
          animation: flight-save 0.8s forwards ease-out;
        }

        @keyframes flight-goal {
          0% { transform: translate(-50%, 0) scale(1); }
          100% { transform: translate(-100px, -180px) scale(0.6); }
        }
        @keyframes flight-save {
          0% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-90px, -150px) scale(0.7); }
          100% { transform: translate(-110px, -130px) scale(0.7) rotate(180deg); }
        }

        .result-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          font-size: 2.5rem;
          font-weight: 900;
          z-index: 20;
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .result-overlay.goal { color: #10b981; }
        .result-overlay.save { color: #f87171; }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
