import React from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export const CustomLink = ({ to, children, className, style, ...rest }) => {
  const navigate = useNavigate();
  const go = (e) => {
    e.preventDefault();
    const ov = document.querySelector('.pg-overlay');
    if (ov) gsap.to(ov, { y: '0%', duration: 0.5, ease: 'expo.inOut', onComplete: () => navigate(to) });
    else navigate(to);
  };
  return <a href={to} onClick={go} className={className} style={style} {...rest}>{children}</a>;
};
