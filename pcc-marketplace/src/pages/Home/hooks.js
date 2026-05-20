import { useState, useEffect } from 'react';

/** Cycles words for hero headline */
export const useWordCycle = (words, ms = 2800) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % words.length), ms);
    return () => clearInterval(t);
  }, []);
  return { word: words[idx], idx };
};
