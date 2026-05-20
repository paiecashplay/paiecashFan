import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../App';

export default function ProductCard({ product, theme }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if item exists in cart (assuming default size 'M' for quick add)
  const cartItem = cart.find(item => item.id === product.id && item.size === 'M');
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (!user) {
      showToast('Please login to add items to cart.', 'error');
      navigate('/login');
      return;
    }

    addToCart(product, 'M', 1); // Default size M, qty 1
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const handleUpdateQty = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    const newQty = cartQty + delta;
    if (newQty < 1) {
      removeFromCart(product.id, 'M');
    } else {
      updateQuantity(product.id, 'M', newQty);
    }
  };

  return (
    <Link
      to={`/clubs/${theme?.id}/product/${product.id}`}
      className="product-card-v2"
      style={{
        '--prod-primary': theme?.primaryColor || '#fff',
        '--prod-secondary': theme?.secondaryColor || '#D4AF37',
        '--prod-accent': theme?.accentColor || '#001489',
        '--prod-glow': theme?.glowColor || 'rgba(255,255,255,0.1)',
        textDecoration: 'none',
        color: 'var(--club-text)'
      }}
    >
      {/* Product image area */}
      <div className="product-card-v2__img-wrap">
        <div className="product-card-v2__img-bg">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-card-v2__img" />
          ) : (
            <span className="product-card-v2__img-emoji">{product.emoji || '👕'}</span>
          )}
        </div>

        {/* Category tag */}
        <span className="product-card-v2__category">{product.category}</span>
      </div>

      {/* Product info */}
      <div className="product-card-v2__body">
        <h4 className="product-card-v2__name">{product.name}</h4>

        <div className="product-card-v2__footer">
          <div className="product-card-v2__price">
            <span className="product-card-v2__price-amount">{product.price.toLocaleString()}</span>
            <span className="product-card-v2__price-currency">{product.currency}</span>
          </div>

          {cartQty > 0 ? (
            <div className="product-card-v2__qty">
              <button className="product-card-v2__qty-btn" onClick={(e) => handleUpdateQty(e, -1)}>−</button>
              <span className="product-card-v2__qty-val">{cartQty}</span>
              <button className="product-card-v2__qty-btn" onClick={(e) => handleUpdateQty(e, 1)}>+</button>
            </div>
          ) : (
            <button
              className="product-card-v2__btn"
              onClick={handleAddToCart}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
