import React from 'react';

export const Marquee = () => {
  const items = ['Real Madrid', 'FC Barcelona', 'Liverpool FC', 'Bayern Munich', 'Paris Saint-Germain', 'Manchester City'];
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="home-marquee">
      <div className="home-marquee__inner">
        {repeated.map((c, i) => (
          <React.Fragment key={i}>
            <span className="home-marquee__item">{c}</span>
            <span className="home-marquee__dot" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
