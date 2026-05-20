// ═══════════════════════════════════════════════════════════════
// services/loto.service.js - Core LOTO game engine logic
// Card generation, win detection, draw management, scoring
// ═══════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');

// ─── CARD GENERATION ─────────────────────────────────────────

/**
 * Generate a valid 5×5 LOTO card using B-I-N-G-O column rules:
 *   B: 1–15, I: 16–30, N: 31–45, G: 46–60, O: 61–75
 *   Center cell [2][2] is FREE (represented as 0)
 */
function generateCard() {
  const ranges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ];

  const card = [];
  for (let col = 0; col < 5; col++) {
    const { min, max } = ranges[col];
    const pool = [];
    for (let n = min; n <= max; n++) pool.push(n);
    shuffleArray(pool);
    const selected = pool.slice(0, 5);
    for (let row = 0; row < 5; row++) {
      if (!card[row]) card[row] = [];
      card[row][col] = selected[row];
    }
  }

  // Center cell is FREE SPACE
  card[2][2] = 0;
  return card;
}

/**
 * Generate a unique card that doesn't duplicate any existing card in the room.
 * @param {Array<Array<Array<number>>>} existingCards - Cards already assigned
 * @param {number} maxAttempts - Max generation attempts
 * @returns {Array<Array<number>>} 5×5 card
 */
function generateUniqueCard(existingCards = [], maxAttempts = 100) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const card = generateCard();
    const cardStr = JSON.stringify(card);
    const isDuplicate = existingCards.some(ec => JSON.stringify(ec) === cardStr);
    if (!isDuplicate) return card;
  }
  // Extremely unlikely to reach here, but generate and return anyway
  return generateCard();
}

// ─── DRAW POOL ───────────────────────────────────────────────

/**
 * Generate a shuffled pool of 75 numbers for drawing.
 */
function generateDrawPool() {
  const pool = [];
  for (let i = 1; i <= 75; i++) pool.push(i);
  shuffleArray(pool);
  return pool;
}

/**
 * Draw the next number from the pool.
 * @param {number[]} drawPool - Full shuffled pool
 * @param {number[]} drawnNumbers - Already drawn numbers
 * @returns {{ number: number, drawOrder: number } | null}
 */
function drawNextNumber(drawPool, drawnNumbers) {
  const drawOrder = drawnNumbers.length + 1;
  if (drawOrder > 75) return null; // All numbers drawn

  // Find the next number in the pool that hasn't been drawn
  for (const num of drawPool) {
    if (!drawnNumbers.includes(num)) {
      return { number: num, drawOrder };
    }
  }
  return null;
}

// ─── WIN DETECTION ───────────────────────────────────────────

/**
 * Check if a player's card has a winning pattern.
 * @param {number[][]} card - 5×5 card grid
 * @param {number[]} markedNumbers - Numbers the player has marked
 * @param {string} winPattern - 'line' | 'column' | 'diagonal' | 'blackout'
 * @returns {{ won: boolean, pattern: string, winningCells: [number,number][] }}
 */
function checkWin(card, markedNumbers, winPattern) {
  const marked = new Set(markedNumbers);
  // FREE space (0) is always marked
  marked.add(0);

  const isMarked = (row, col) => {
    const val = card[row][col];
    return val === 0 || marked.has(val);
  };

  // Check all possible patterns based on winPattern
  switch (winPattern) {
    case 'line':
      return checkLines(card, isMarked);
    case 'column':
      return checkColumns(card, isMarked);
    case 'diagonal':
      return checkDiagonals(card, isMarked);
    case 'blackout':
      return checkBlackout(card, isMarked);
    default:
      // Check all patterns
      const line = checkLines(card, isMarked);
      if (line.won) return line;
      const col = checkColumns(card, isMarked);
      if (col.won) return col;
      const diag = checkDiagonals(card, isMarked);
      if (diag.won) return diag;
      return { won: false, pattern: null, winningCells: [] };
  }
}

function checkLines(card, isMarked) {
  for (let row = 0; row < 5; row++) {
    const cells = [];
    let complete = true;
    for (let col = 0; col < 5; col++) {
      if (isMarked(row, col)) {
        cells.push([row, col]);
      } else {
        complete = false;
        break;
      }
    }
    if (complete) return { won: true, pattern: 'line', winningCells: cells };
  }
  return { won: false, pattern: null, winningCells: [] };
}

function checkColumns(card, isMarked) {
  for (let col = 0; col < 5; col++) {
    const cells = [];
    let complete = true;
    for (let row = 0; row < 5; row++) {
      if (isMarked(row, col)) {
        cells.push([row, col]);
      } else {
        complete = false;
        break;
      }
    }
    if (complete) return { won: true, pattern: 'column', winningCells: cells };
  }
  return { won: false, pattern: null, winningCells: [] };
}

function checkDiagonals(card, isMarked) {
  // Main diagonal (top-left to bottom-right)
  let cells = [];
  let complete = true;
  for (let i = 0; i < 5; i++) {
    if (isMarked(i, i)) {
      cells.push([i, i]);
    } else {
      complete = false;
      break;
    }
  }
  if (complete) return { won: true, pattern: 'diagonal', winningCells: cells };

  // Anti-diagonal (top-right to bottom-left)
  cells = [];
  complete = true;
  for (let i = 0; i < 5; i++) {
    if (isMarked(i, 4 - i)) {
      cells.push([i, 4 - i]);
    } else {
      complete = false;
      break;
    }
  }
  if (complete) return { won: true, pattern: 'diagonal', winningCells: cells };

  return { won: false, pattern: null, winningCells: [] };
}

function checkBlackout(card, isMarked) {
  const cells = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (isMarked(row, col)) {
        cells.push([row, col]);
      } else {
        return { won: false, pattern: null, winningCells: [] };
      }
    }
  }
  return { won: true, pattern: 'blackout', winningCells: cells };
}

/**
 * Check if a player CAN potentially win (has a completeable pattern).
 * Used to enable/disable the LOTO button on the client.
 */
function canCallLoto(card, markedNumbers, winPattern) {
  return checkWin(card, markedNumbers, winPattern).won;
}

// ─── SCORING ─────────────────────────────────────────────────

/**
 * Calculate score based on how quickly the player won.
 * Fewer draws = higher score.
 */
function calculateScore(drawCount, winPattern) {
  const baseScore = {
    line: 100,
    column: 100,
    diagonal: 150,
    blackout: 500
  };

  const base = baseScore[winPattern] || 100;
  // Bonus for winning in fewer draws (max 75 draws)
  const speedBonus = Math.max(0, Math.floor((75 - drawCount) * 2));
  return base + speedBonus;
}

// ─── ROOM CODE GENERATION ────────────────────────────────────

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0, O, 1, I to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── HELPERS ─────────────────────────────────────────────────

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get B-I-N-G-O column letter for a number.
 */
function getColumnLetter(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '?';
}

module.exports = {
  generateCard,
  generateUniqueCard,
  generateDrawPool,
  drawNextNumber,
  checkWin,
  canCallLoto,
  calculateScore,
  generateRoomCode,
  shuffleArray,
  getColumnLetter
};
