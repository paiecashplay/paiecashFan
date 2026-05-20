import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />

      <div className="cart-drawer">

        {/* ── Header ── */}
        <div className="cart-header">
          <div className="cart-header-left">
            <h2>Your Cart</h2>
            {itemCount > 0 && (
              <span className="cart-count-badge">{itemCount}</span>
            )}
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l13 13M14 1L1 14"/>
            </svg>
          </button>
        </div>

        {/* ── Items ── */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p>Your cart is empty</p>
              <span>Add some items from the store<br/>to get started.</span>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} className="cart-item">

                {/* Thumbnail */}
                <div className="cart-item-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <span>{item.emoji || '👕'}</span>
                  }
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <div>
                    <h4>{item.name}</h4>
                    <div className="cart-item-meta">
                      <span className="cart-meta-chip">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                        {item.size}
                      </span>
                      <span className="cart-item-price">{item.price.toLocaleString()} PCC</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    {/* Qty stepper    */}
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>

                    {/* Remove */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <button
                        className="cart-remove"
                        onClick={() => removeFromCart(item.id, item.size)}
                        aria-label="Remove item"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: '4px' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>{cartTotal.toLocaleString()} PCC</span>
              </div>
              <div className="cart-summary-row">
                <span>Network fee</span>
                <span style={{ color: 'var(--c-green)' }}>FREE</span>
              </div>
              <div className="cart-divider" />
              <div className="cart-total">
                <span>Total</span>
                <div className="cart-total-amount">
                  <span>{cartTotal.toLocaleString()}</span>
                  <span className="cart-total-pcc">PCC</span>
                </div>
              </div>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
            >
              <span className="btn-inner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                Proceed to Checkout
              </span>
            </button>

            <div className="cart-security">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secured by blockchain · PCC Network
            </div>
          </div>
        )}

      </div>
    </>
  );
}