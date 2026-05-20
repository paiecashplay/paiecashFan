import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { getClubProducts } from '../clubThemes';

const CATEGORIES = ['All', 'Jersey', 'Hoodie', 'T-Shirt', 'Accessory', 'Collectible'];

export default function MerchandiseGrid({ theme, clubId }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Load products - use mock data for now, API-ready
    const items = getClubProducts(clubId);
    setProducts(items);
  }, [clubId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = activeFilter === 'All'
    ? products
    : products.filter(p => p.category === activeFilter);

  return (
    <section
      ref={sectionRef}
      className={`merch-grid ${isVisible ? 'merch-grid--visible' : ''}`}
      style={{
        '--merch-primary': theme?.primaryColor,
        '--merch-secondary': theme?.secondaryColor,
        '--merch-accent': theme?.accentColor,
        '--merch-glow': theme?.glowColor,
      }}
    >
      <div className="merch-grid__header">
        <div>
          <span className="merch-grid__label">Official Store</span>
          <h2 className="merch-grid__title">Merchandise</h2>
        </div>
        <span className="merch-grid__count">{filtered.length} items</span>
      </div>

      {/* Filter bar */}
      <div className="merch-grid__filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`merch-grid__filter-btn ${activeFilter === cat ? 'merch-grid__filter-btn--active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="merch-grid__products">
        {filtered.map((product, i) => (
          <div key={product.id} style={{ animationDelay: `${i * 0.08}s` }} className="merch-grid__product-wrap">
            <ProductCard product={product} theme={theme} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="merch-grid__empty">
          <span>No products in this category yet</span>
        </div>
      )}
    </section>
  );
}
