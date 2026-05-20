// ═══════════════════════════════════════════════════════════════
// lotoUtils.test.js - Unit tests for LOTO card generation & win detection
// Run: npx vitest run src/pages/games/loto/lotoUtils.test.js
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { generateCard, checkWin, getColumnLetter, COLUMN_RANGES } from './lotoUtils';

describe('generateCard', () => {
  it('generates a 5x5 card', () => {
    const card = generateCard();
    expect(card.length).toBe(5);
    card.forEach(row => expect(row.length).toBe(5));
  });

  it('has FREE space at center [2][2] = 0', () => {
    const card = generateCard();
    expect(card[2][2]).toBe(0);
  });

  it('follows B-I-N-G-O column ranges', () => {
    const card = generateCard();
    for (let col = 0; col < 5; col++) {
      const { min, max } = COLUMN_RANGES[col];
      for (let row = 0; row < 5; row++) {
        const val = card[row][col];
        if (row === 2 && col === 2) {
          expect(val).toBe(0); // FREE
        } else {
          expect(val).toBeGreaterThanOrEqual(min);
          expect(val).toBeLessThanOrEqual(max);
        }
      }
    }
  });

  it('has no duplicate numbers in a column', () => {
    const card = generateCard();
    for (let col = 0; col < 5; col++) {
      const values = [];
      for (let row = 0; row < 5; row++) {
        if (card[row][col] !== 0) values.push(card[row][col]);
      }
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    }
  });

  it('generates different cards', () => {
    const cards = Array.from({ length: 10 }, () => JSON.stringify(generateCard()));
    const unique = new Set(cards);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('checkWin', () => {
  const makeCard = () => [
    [1, 16, 31, 46, 61],
    [2, 17, 32, 47, 62],
    [3, 18, 0, 48, 63],
    [4, 19, 33, 49, 64],
    [5, 20, 34, 50, 65],
  ];

  it('detects horizontal line win (row 0)', () => {
    const card = makeCard();
    const marked = [1, 16, 31, 46, 61];
    const result = checkWin(card, marked, 'line');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('line');
    expect(result.winningCells).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
  });

  it('detects horizontal line win (row 2 with FREE)', () => {
    const card = makeCard();
    const marked = [3, 18, 48, 63]; // 0 (FREE) auto-counted
    const result = checkWin(card, marked, 'line');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('line');
  });

  it('detects column win', () => {
    const card = makeCard();
    const marked = [1, 2, 3, 4, 5]; // Column B
    const result = checkWin(card, marked, 'column');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('column');
  });

  it('detects main diagonal win', () => {
    const card = makeCard();
    const marked = [1, 17, 49, 65]; // + FREE at [2][2]
    const result = checkWin(card, marked, 'diagonal');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('diagonal');
  });

  it('detects anti-diagonal win', () => {
    const card = makeCard();
    const marked = [61, 47, 4, 20]; // + FREE at [2][2]
    const result = checkWin(card, marked, 'diagonal');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('diagonal');
  });

  it('detects blackout win', () => {
    const card = makeCard();
    const allNums = [];
    card.forEach(row => row.forEach(n => { if (n !== 0) allNums.push(n); }));
    const result = checkWin(card, allNums, 'blackout');
    expect(result.won).toBe(true);
    expect(result.pattern).toBe('blackout');
    expect(result.winningCells.length).toBe(25);
  });

  it('returns false for incomplete line', () => {
    const card = makeCard();
    const marked = [1, 16, 31, 46]; // missing 61
    const result = checkWin(card, marked, 'line');
    expect(result.won).toBe(false);
  });

  it('returns false for empty marks', () => {
    const card = makeCard();
    const result = checkWin(card, [], 'line');
    expect(result.won).toBe(false);
  });

  it('line pattern does not detect column win', () => {
    const card = makeCard();
    const marked = [1, 2, 3, 4, 5]; // Column B complete
    const result = checkWin(card, marked, 'line');
    expect(result.won).toBe(false);
  });
});

describe('getColumnLetter', () => {
  it('returns correct letters', () => {
    expect(getColumnLetter(1)).toBe('B');
    expect(getColumnLetter(15)).toBe('B');
    expect(getColumnLetter(16)).toBe('I');
    expect(getColumnLetter(30)).toBe('I');
    expect(getColumnLetter(31)).toBe('N');
    expect(getColumnLetter(45)).toBe('N');
    expect(getColumnLetter(46)).toBe('G');
    expect(getColumnLetter(60)).toBe('G');
    expect(getColumnLetter(61)).toBe('O');
    expect(getColumnLetter(75)).toBe('O');
  });
});
