import React from 'react';

export const Noise = () => (
  <svg className="home-noise">
    <filter id="nf"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
    <rect width="100%" height="100%" filter="url(#nf)" />
  </svg>
);
