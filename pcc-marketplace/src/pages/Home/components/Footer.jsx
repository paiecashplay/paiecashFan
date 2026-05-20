import React from 'react';
import { CustomLink } from './CustomLink';

export const Footer = () => (
  <footer className="home-footer">
    <div className="home-footer__logo">Paiecash</div>
    <div className="home-footer__links">
      {[['Clubs', '/clubs'], ['Gaming', '/gaming'], ['Contests', '/contests']].map(([l, h]) => (
        <CustomLink key={l} to={h} className="home-footer__link">{l}</CustomLink>
      ))}
    </div>
    <div className="home-footer__copy">© 2025 Paiecash. All rights reserved.</div>
  </footer>
);
