import React, { useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

import './Home.css';

import { Preloader } from './components/Preloader';
import { Hero } from './components/Hero';
import { GamesBento } from './components/GamesBento';
import { Stats } from './components/Stats';
import { HowItWorks } from './components/Pillars';
import { Manifesto } from './components/Manifesto';
import { ScrollBar } from './components/ScrollBar';
import { Noise } from './components/Noise';

export default function Home() {
  const [done, setDone] = useState(() => {
    return sessionStorage.getItem('pcc_preloader_done') === 'true';
  });

  const handleComplete = () => {
    setDone(true);
    sessionStorage.setItem('pcc_preloader_done', 'true');
  };

  useLayoutEffect(() => {
    if (!done) {
      gsap.to('.pg-overlay', { y: '-100%', duration: 0.5, ease: 'expo.inOut', delay: 0.05 });
    }
  }, [done]);

  return (
    <>
      <Noise />
      <ScrollBar />
      {!done && <div className="pg-overlay" />}

      {!done && <Preloader onComplete={handleComplete} />}

      <div style={{ visibility: done ? 'visible' : 'hidden' }}>
        <Hero done={done} />
        <GamesBento />
        <Stats />
        <HowItWorks />
        <Manifesto />
      </div>
    </>
  );
}

