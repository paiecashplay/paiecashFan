// ═══════════════════════════════════════════════════════════
// LOTO utility functions (shared client-side)
// ═══════════════════════════════════════════════════════════

/**
 * Generate a 5x5 Bingo card with BINGO column constraints
 * B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
 * Center cell (row 2, col 2) is FREE (0)
 */
export function generateCard() {
  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ];

  const card = [];
  for (let row = 0; row < 5; row++) {
    card.push([]);
  }

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const pool = [];
    for (let n = min; n <= max; n++) pool.push(n);
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (let row = 0; row < 5; row++) {
      if (row === 2 && col === 2) {
        card[row][col] = 0; // FREE
      } else {
        card[row][col] = pool[row];
      }
    }
  }
  return card;
}

/**
 * Check if a card has a winning pattern
 * Returns { won: boolean, pattern: string, winningCells: [row, col][] }
 */
export function checkWin(card, markedNumbers, pattern) {
  if (!card || !markedNumbers) return { won: false, pattern: '', winningCells: [] };
  const marked = new Set(markedNumbers);
  const isMarked = (r, c) => card[r][c] === 0 || marked.has(card[r][c]);

  // Check rows
  if (pattern === 'line' || pattern === 'blackout') {
    for (let r = 0; r < 5; r++) {
      const cells = [];
      let complete = true;
      for (let c = 0; c < 5; c++) {
        if (!isMarked(r, c)) { complete = false; break; }
        cells.push([r, c]);
      }
      if (complete && pattern === 'line') return { won: true, pattern: 'Horizontal Line', winningCells: cells };
    }
  }

  // Check columns
  if (pattern === 'column' || pattern === 'blackout') {
    for (let c = 0; c < 5; c++) {
      const cells = [];
      let complete = true;
      for (let r = 0; r < 5; r++) {
        if (!isMarked(r, c)) { complete = false; break; }
        cells.push([r, c]);
      }
      if (complete && pattern === 'column') return { won: true, pattern: 'Vertical Column', winningCells: cells };
    }
  }

  // Check diagonals
  if (pattern === 'diagonal' || pattern === 'blackout') {
    const diag1 = [[0,0],[1,1],[2,2],[3,3],[4,4]];
    const diag2 = [[0,4],[1,3],[2,2],[3,1],[4,0]];
    if (diag1.every(([r,c]) => isMarked(r, c)) && pattern === 'diagonal') {
      return { won: true, pattern: 'Diagonal ↘', winningCells: diag1 };
    }
    if (diag2.every(([r,c]) => isMarked(r, c)) && pattern === 'diagonal') {
      return { won: true, pattern: 'Diagonal ↙', winningCells: diag2 };
    }
  }

  // Full blackout
  if (pattern === 'blackout') {
    const cells = [];
    let complete = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!isMarked(r, c)) { complete = false; break; }
        cells.push([r, c]);
      }
      if (!complete) break;
    }
    if (complete) return { won: true, pattern: 'BLACKOUT!', winningCells: cells };
  }

  return { won: false, pattern: '', winningCells: [] };
}

/**
 * Get the BINGO column letter for a number
 */
export function getColumnLetter(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
}

/**
 * Get human-readable pattern label
 */
export function getPatternLabel(pattern) {
  const labels = {
    line: '↔ Horizontal Line',
    column: '↕ Vertical Column',
    diagonal: '↗ Diagonal',
    blackout: '⬛ Full Blackout',
  };
  return labels[pattern] || pattern;
}

/**
 * Format room code for display
 */
export function formatRoomCode(code) {
  if (!code) return '';
  return code.toUpperCase().split('').join(' ');
}
