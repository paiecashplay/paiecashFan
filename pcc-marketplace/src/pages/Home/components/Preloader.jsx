import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const Preloader = ({ onComplete }) => {
  const wrap = useRef(null);
  const top = useRef(null);
  const bot = useRef(null);
  const fill = useRef(null);
  const num = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const tl = gsap.timeline({
      onComplete: () => { document.body.style.overflow = ''; onComplete?.(); }
    });
    tl.to({ v: 0 }, {
      v: 100, duration: 1.4, ease: 'power2.inOut',
      onUpdate: function () {
        const v = this.targets()[0].v;
        if (num.current) num.current.textContent = Math.round(v);
        if (fill.current) fill.current.style.transform = `scaleX(${v / 100})`;
      }
    })
    .to([top.current, bot.current], {
      y: (i) => i === 0 ? '-100%' : '100%',
      duration: 0.85, ease: 'expo.inOut', stagger: 0.05
    }, '+=0.08')
    .set(wrap.current, { autoAlpha: 0 }, '-=0.1');
    return () => tl.kill();
  }, []);

  return (
    <div ref={wrap} className="preloader-wrap">
      <div ref={top} className="preloader-half preloader-half--top" />
      <div ref={bot} className="preloader-half preloader-half--bot" />
      <div className="preloader-center">
        <div className="preloader-logo">PAIECASH</div>
        <div className="preloader-track">
          <div ref={fill} className="preloader-fill" />
        </div>
        <div className="preloader-num"><span ref={num}>0</span>%</div>
      </div>
    </div>
  );
};
