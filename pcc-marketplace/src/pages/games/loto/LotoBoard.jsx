import { useRef, useEffect } from 'react';
import { getColumnLetter } from './lotoUtils';

const COLUMNS = [
  { letter: 'B', start: 1, end: 15 },
  { letter: 'I', start: 16, end: 30 },
  { letter: 'N', start: 31, end: 45 },
  { letter: 'G', start: 46, end: 60 },
  { letter: 'O', start: 61, end: 75 },
];

export default function LotoBoard({ drawnNumbers, lastDrawn }) {
  const drawnSet = new Set(drawnNumbers || []);
  const lastNumRef = useRef(null);

  // Re-trigger fly-in on each new lastDrawn
  useEffect(() => {
    if (lastNumRef.current && lastDrawn) {
      lastNumRef.current.classList.remove('fly-in');
      // Force reflow
      void lastNumRef.current.offsetWidth;
      lastNumRef.current.classList.add('fly-in');
    }
  }, [lastDrawn?.number]);

  return (
    <div className="loto-board">
      <h4>🎱 Draw Board</h4>

      {/* ── Last Drawn ── */}
      <div className="loto-last-drawn">
        {lastDrawn ? (
          <>
            <div className="letter">{lastDrawn.letter}</div>
            <div className="number fly-in" key={lastDrawn.number} ref={lastNumRef}>
              {lastDrawn.number}
            </div>
            <div className="label">Last Called</div>
          </>
        ) : (
          <>
            <div className="letter">-</div>
            <div className="number" style={{ color: 'rgba(255,255,255,0.07)', fontSize: 48 }}>?</div>
            <div className="label">Waiting...</div>
          </>
        )}
      </div>

      {/* ── Called-numbers grid ── */}
      <div className="loto-board-columns">
        {COLUMNS.map(col => {
          const nums = [];
          for (let n = col.start; n <= col.end; n++) nums.push(n);
          return (
            <div key={col.letter}>
              <div className={`loto-board-col-header col-${col.letter}`}>
                {col.letter}
              </div>
              {nums.map(n => {
                const called = drawnSet.has(n);
                const latest = lastDrawn?.number === n;
                return (
                  <div
                    key={n}
                    className={[
                      'loto-board-number',
                      called ? 'called' : 'uncalled',
                      called ? `col-${col.letter}` : '',
                      latest ? 'latest' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}