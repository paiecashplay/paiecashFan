import { useRef, useEffect } from 'react';

const HEADERS = ['B', 'I', 'N', 'G', 'O'];

export default function LotoCard({ card, markedNumbers, drawnNumbers, winningCells, onCellClick }) {
  if (!card) return null;

  const markedSet = new Set(markedNumbers || []);
  const drawnSet = new Set(drawnNumbers || []);
  const winSet = new Set((winningCells || []).map(([r, c]) => `${r}-${c}`));

  return (
    <div className="loto-card">
      {/* ── BINGO Header ── */}
      <div className="loto-card-headers">
        {HEADERS.map(h => (
          <div key={h} className="loto-card-header">{h}</div>
        ))}
      </div>

      {/* ── Number Grid ── */}
      <div className="loto-card-grid">
        {card.map((row, r) =>
          row.map((num, c) => {
            const isFree = num === 0;
            const isMarked = markedSet.has(num) || isFree;
            const isDrawn = drawnSet.has(num);
            const isWinning = winSet.has(`${r}-${c}`);
            const isAvailable = isDrawn && !isMarked && !isFree;

            const className = [
              'loto-card-cell',
              isFree && 'free',
              isMarked && !isFree && 'marked',
              isWinning && 'winning',
              isAvailable && 'drawn-available',
            ].filter(Boolean).join(' ');

            return (
              <CellWithStamp
                key={`${r}-${c}`}
                className={className}
                num={num}
                isFree={isFree}
                isMarked={isMarked}
                isAvailable={isAvailable}
                onClick={() => {
                  if (!isFree && isAvailable && onCellClick) {
                    onCellClick(num);
                  }
                }}
                role={isAvailable ? 'button' : undefined}
                tabIndex={isAvailable ? 0 : undefined}
                aria-label={
                  isFree
                    ? 'Free space'
                    : `Number ${num}${isMarked ? ', marked' : ''}${isDrawn ? ', drawn' : ''}`
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * CellWithStamp - wraps each cell so we can re-trigger
 * the stamp animation whenever isMarked transitions true.
 */
function CellWithStamp({ className, num, isFree, isMarked, isAvailable, onClick, role, tabIndex, 'aria-label': ariaLabel }) {
  const ref = useRef(null);
  const prevMarked = useRef(false);

  useEffect(() => {
    if (isMarked && !prevMarked.current && ref.current) {
      // Remove then re-add class to retrigger animation
      ref.current.classList.remove('marked');
      void ref.current.offsetWidth;
      ref.current.classList.add('marked');
    }
    prevMarked.current = isMarked;
  }, [isMarked]);

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onKeyDown={e => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) onClick?.();
      }}
    >
      {isFree ? '★' : num}
    </div>
  );
}