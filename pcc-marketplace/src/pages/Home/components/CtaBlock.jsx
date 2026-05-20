import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomLink } from './CustomLink';

gsap.registerPlugin(ScrollTrigger);

export const CtaBlock = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-card', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start: 'top 86%' } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="home-section" style={{ paddingTop: 0 }}>
      <div className="cta-card" style={{ opacity: 0 }}>
        <div className="cta-bg-text">PCC</div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <h2 className="cta-title">Ready to enter<br />the new era?</h2>
          <CustomLink to="/login" className="btn-cta"><span>Create Account →</span></CustomLink>
        </div>
      </div>
    </section>
  );
};
