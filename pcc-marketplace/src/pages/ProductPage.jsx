import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getClubTheme, getClubProducts, injectClubTheme } from '../clubThemes';
import { fetchPlayerImage } from '../playerImages';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../App';
import api from '../api';
import './ProductPage.css';

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated Number Counter ─── */
function CountUp({ end, duration = 1.2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString();
      },
      delay: 0.6,
    });
  }, [end, duration]);
  return <span ref={ref}>0</span>;
}

export default function ProductPage() {
  const { slugOrId, productId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);
  const [addDone, setAddDone] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [starImage, setStarImage] = useState(null);
  const [isFastCheckingOut, setIsFastCheckingOut] = useState(false);

  const { cart, addToCart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const { balance, setBalance } = useWallet();
  const { user } = useAuth();

  const pageRef = useRef(null);
  const imageRef = useRef(null);
  const tiltRef = useRef(null);

  const shadowRef = useRef(null);
  const glowRef = useRef(null);
  const detailsRef = useRef(null);
  const showcaseRef = useRef(null);
  const curtainRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const btnRef = useRef(null);

  /* ── Load data ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    const clubTheme = getClubTheme(slugOrId);
    if (!clubTheme) return;
    setTheme(clubTheme);
    const prod = getClubProducts(clubTheme.id).find(p => p.id === productId);
    if (prod) setProduct(prod);

    // Fetch star player image
    if (clubTheme.squad && clubTheme.squad.length > 0) {
      const star = clubTheme.squad[0];
      // Check hardcoded first
      if (star.image && !star.image.includes('transfermarkt.technology')) {
        setStarImage(star.image);
      } else {
        fetchPlayerImage(star.name).then(img => {
          if (img) setStarImage(img.cutout || img.thumb);
        });
      }
    }
  }, [slugOrId, productId]);

  /* ── Inject theme ── */
  useEffect(() => {
    if (!theme || !pageRef.current) return;
    injectClubTheme(pageRef.current, theme.id);
    document.body.style.background = theme.darkColor;
    return () => { document.body.style.background = ''; };
  }, [theme]);

  /* ── Floating orbs parallax ── */
  useEffect(() => {
    const onMove = (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 30;
      const my = (e.clientY / window.innerHeight - 0.5) * 30;
      if (orb1Ref.current) gsap.to(orb1Ref.current, { x: mx * 1.5, y: my * 1.5, duration: 1.2, ease: 'power1.out' });
      if (orb2Ref.current) gsap.to(orb2Ref.current, { x: -mx, y: -my, duration: 1.8, ease: 'power1.out' });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Sync Qty with Cart ── */
  const cartItem = cart.find(c => c.id === product?.id && c.size === selectedSize);

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(1);
    }
  }, [cartItem?.quantity, selectedSize, product?.id]);

  /* ── Master GSAP entrance ── */
  useLayoutEffect(() => {
    if (!product || !pageRef.current) return;

    const ctx = gsap.context(() => {
      /* 1. Page curtain wipe */
      if (curtainRef.current) {
        gsap.fromTo(curtainRef.current,
          { scaleX: 1 },
          { scaleX: 0, duration: 1.1, ease: 'expo.inOut', transformOrigin: 'right center', delay: 0.1 }
        );
      }

      /* 2. Showcase side */
      if (showcaseRef.current) {
        gsap.fromTo(showcaseRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.inOut', delay: 0.4 }
        );
      }

      /* 3. Image entrance with 3-D flip */
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { opacity: 0, scale: 0.65, rotationY: -30, y: 60 },
          { opacity: 1, scale: 1, rotationY: 0, y: 0, duration: 1.3, ease: 'back.out(1.4)', delay: 0.7 }
        );
        /* Continuous float */
        gsap.to(imageRef.current, {
          y: '-=18', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2,
        });
      }

      /* 4. Glow bloom */
      if (glowRef.current) {
        gsap.fromTo(glowRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.6, duration: 2, ease: 'power2.out', delay: 0.9 }
        );
      }

      /* 5. Details panel stagger */
      if (detailsRef.current) {
        const kids = detailsRef.current.querySelectorAll('.pp-anim');
        gsap.fromTo(kids,
          { opacity: 0, y: 36, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.75, ease: 'power3.out', delay: 0.85 }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [product]);

  /* ── Cinematic Spotlight & Zoom ── */
  const handleMouseMove = (e) => {
    if (!tiltRef.current || !showcaseRef.current) return;
    const { left, top, width, height } = showcaseRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Normalized coordinates (-1 to 1)
    const x = (e.clientX - centerX) / (width / 2);
    const y = (e.clientY - centerY) / (height / 2);

    // Subtle pan and scale for the image
    gsap.to(tiltRef.current, {
      x: -x * 12,
      y: -y * 12,
      scale: 1.05,
      rotationY: x * 4,
      rotationX: -y * 4,
      transformPerspective: 1200,
      ease: 'power2.out',
      duration: 0.8,
      overwrite: 'auto',
    });

    // Spotlight glow intensely tracks the mouse
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: x * 60,
        y: y * 60,
        scale: 1.15,
        opacity: 0.95,
        ease: 'power3.out',
        duration: 0.6,
        overwrite: 'auto'
      });
    }

    // Shadow counters the image
    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: x * 5,
        opacity: 0.4,
        scale: 0.95,
        ease: 'power2.out',
        duration: 0.8,
        overwrite: 'auto'
      });
    }
  };

  const handleMouseLeave = () => {
    if (tiltRef.current) {
      gsap.to(tiltRef.current, {
        rotationY: 0, rotationX: 0, x: 0, y: 0, scale: 1,
        ease: 'power3.out', duration: 1.2, overwrite: 'auto',
      });
    }
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: 0, y: 0, scale: 1, opacity: 0.6,
        ease: 'power3.out', duration: 1.2, overwrite: 'auto'
      });
    }
    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: 0, y: 0, scale: 1, opacity: 0.6,
        ease: 'power3.out', duration: 1.2, overwrite: 'auto'
      });
    }
  };

  const handleAdjustQty = (delta) => {
    const newQty = Math.max(1, qty + delta);
    setQty(newQty);
    if (cartItem) {
      updateQuantity(product.id, selectedSize, newQty);
    }
  };

  /* ── Add to cart pulse ── */
  const handleAddToCart = () => {
    if (!user) {
      showToast('Please login to add items to cart.', 'error');
      navigate('/login');
      return;
    }

    if (cartItem) {
      setIsCartOpen(true);
      return;
    }

    if (isAdding || addDone) return;
    setIsAdding(true);
    if (btnRef.current) {
      gsap.to(btnRef.current, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 });
    }

    // Actually add to cart state
    addToCart(product, selectedSize, qty);
    showToast(`Added ${qty}x ${product.name} to cart`, 'success');

    setTimeout(() => {
      setIsAdding(false);
      setAddDone(true);
      setTimeout(() => setAddDone(false), 2500);
    }, 600);
  };

  /* ── Fast Checkout Flow ── */
  const handleFastCheckout = async () => {
    if (!user) {
      showToast('Please login to checkout.', 'error');
      navigate('/login');
      return;
    }
    if (isFastCheckingOut) return;
    const totalCost = product.price * qty;

    if (balance === null) {
      showToast('Please login and connect wallet first.', 'error');
      return;
    }

    if (balance < totalCost) {
      showToast(`Insufficient balance. You need ${totalCost.toLocaleString()} PCC.`, 'error');
      return;
    }

    setIsFastCheckingOut(true);
    showToast('🔗 Connecting to blockchain...', 'info');

    try {
      // Build order data for the real API
      const orderData = {
        userId: user.id,
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          size: selectedSize,
          image: product.image,
          tenantId: theme.id,
        }],
        shipping: {
          fullName: user.name || 'Fast Checkout',
          address: 'Fast Checkout Order',
          city: 'N/A',
          country: 'N/A',
          phone: 'N/A',
        },
        totalPcc: totalCost,
      };

      // Show processing stages with toasts
      setTimeout(() => showToast('🔍 Verifying wallet balance...', 'info'), 1500);
      setTimeout(() => showToast('⛓️ Processing transaction...', 'info'), 3000);

      const res = await api.placeOrder(orderData);

      if (res && res.status === 'confirmed') {
        // Wait for the animation to feel realistic
        setTimeout(() => {
          setBalance(prev => prev - totalCost);
          showToast('✅ Purchase successful! Authenticity NFT sent to wallet.', 'success');
          setIsFastCheckingOut(false);
        }, 4500);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Fast checkout failed', 'error');
      setIsFastCheckingOut(false);
    }
  };

  /* ── Contrast helper ── */
  const contrast = (hex) => {
    if (!hex) return '#fff';
    const h = hex.replace('#', '');
    if (h.length !== 6) return '#fff';
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 140 ? '#0a0a1a' : '#ffffff';
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const tabs = ['details', 'materials', 'shipping'];
  const tabContent = {
    details: `An authentic piece of official merchandise, engineered for performance. This ${product?.category?.toLowerCase() ?? 'item'} features the official ${theme?.name ?? ''} crest, crafted with moisture-wicking technology and reinforced seams. Built for true fans who demand excellence.`,
    materials: 'Outer: 92% recycled polyester, 8% elastane. Inner mesh lining: 100% polyester. All inks are eco-certified, water-based, and UV-resistant. Carbon-neutral manufacturing process.',
    shipping: 'Ships within 1-2 business days. Tracked express delivery: 2-4 days. Free returns within 30 days. Each item ships with an NFC-verified authenticity card.',
  };

  if (!theme || !product) {
    return (
      <div className="pp-loading">
        <div className="pp-loading__spinner" />
        <span>Loading Product</span>
      </div>
    );
  }

  return (
    <div className="pp" ref={pageRef} style={{ background: theme.darkColor }}>
      {/* ── Curtain wipe overlay ── */}
      <div className="pp__curtain" ref={curtainRef} style={{ background: theme.primaryColor }} />

      {/* ── Ambient background ── */}
      <div className="pp__bg">
        <div className="pp__orb pp__orb--1" ref={orb1Ref}
          style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 65%)` }} />
        <div className="pp__orb pp__orb--2" ref={orb2Ref}
          style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 65%)` }} />
        <div className="pp__grid-lines" />
        <div className="pp__noise" />
        {/* Diagonal accent stripe */}
        <div className="pp__stripe" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}08, transparent 60%)` }} />
      </div>

      {/* ── Top Nav Bar ── */}
      <nav className="pp__nav">
        <button
          className="pp__back"
          onClick={() => navigate(-1)}

        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <div className="pp__nav-breadcrumb">
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>{theme.name}</span>
          <span className="pp__nav-sep">·</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{product.category}</span>
        </div>

        <div className="pp__nav-right">
          <div className="pp__trust-badge" style={{ borderColor: `${theme.primaryColor}40` }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.primaryColor} strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Official Merchandise</span>
          </div>
        </div>
      </nav>

      {/* ── Main layout ── */}
      <main className="pp__main">

        {/* ════ LEFT: Showcase ════ */}
        <section
          className="pp__showcase"
          ref={showcaseRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Artwork Container */}
          <div className="pp__art-container">
            {/* Edition label rotated */}
            <div className="pp__edition-label" style={{ color: `${theme.primaryColor}70` }}>
              {theme.name} - {new Date().getFullYear()} Collection
            </div>

            {/* Glow sphere */}
            <div className="pp__glow" ref={glowRef}
              style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 68%)` }} />

            {/* Floating rings */}
            <div className="pp__ring pp__ring--1" style={{ borderColor: `${theme.primaryColor}18` }} />
            <div className="pp__ring pp__ring--2" style={{ borderColor: `${theme.primaryColor}0d` }} />

            {/* Product image */}
            <div className="pp__img-wrap" ref={imageRef}>
              <div className="pp__img-tilt" ref={tiltRef}>
                {product.image
                  ? <img src={product.image} alt={product.name} className="pp__img" />
                  : <div className="pp__emoji">{product.emoji || '👕'}</div>
                }
              </div>
              {/* Ground shadow */}
              <div className="pp__shadow" ref={shadowRef} style={{ background: `radial-gradient(ellipse, ${theme.primaryColor}30, transparent 70%)` }} />
            </div>
          </div>

          {/* WORN BY Widget */}
          {theme.squad && theme.squad[0] && (
            <div className="pp__worn-by">
              <div className="pp__worn-by-header">
                <span className="pp__worn-by-dot" style={{ background: theme.primaryColor }} />
                <span>Worn By</span>
              </div>
              <div className="pp__worn-by-card" style={{ borderColor: `${theme.primaryColor}30` }}>
                <div className="pp__worn-by-avatar">
                  {starImage ? (
                    <img src={starImage} alt={theme.squad[0].name} className="pp__worn-by-img" />
                  ) : (
                    <span className="pp__worn-by-emoji" style={{ background: theme.cardGradient }}>{theme.squad[0].emoji}</span>
                  )}
                </div>
                <div className="pp__worn-by-info">
                  <div className="pp__worn-by-name">{theme.squad[0].name}</div>
                  <div className="pp__worn-by-number" style={{ color: theme.primaryColor }}>#{theme.squad[0].number}</div>
                </div>
              </div>
            </div>
          )}

          {/* Authenticity Badge */}
          <div className="pp__auth-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.primaryColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <div className="pp__auth-info">
              <span className="pp__auth-title">Authentic Collection</span>
              <span className="pp__auth-desc">NFC Tag Verified</span>
            </div>
          </div>

          {/* Bottom stat bar */}
          <div className="pp__stat-strip">
            {[
              { label: 'Units sold', value: 4218 },
              { label: 'Reviews', value: 312 },
              { label: 'Rating', value: 4.9, isStar: true },
            ].map(s => (
              <div key={s.label} className="pp__stat">
                <div className="pp__stat-val" style={{ color: theme.primaryColor }}>
                  {s.isStar ? '⭐ 4.9' : <CountUp end={s.value} />}
                </div>
                <div className="pp__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════ RIGHT: Details ════ */}
        <section className="pp__details" ref={detailsRef}>

          {/* Category pill */}
          <div className="pp-anim pp__pill" style={{ borderColor: `${theme.primaryColor}55`, color: theme.primaryColor }}>
            <span className="pp__pill-dot" style={{ background: theme.primaryColor }} />
            {product.category}
          </div>

          {/* Title */}
          <h1 className="pp-anim pp__title">{product.name}</h1>

          {/* Club sub */}
          <p className="pp-anim pp__club-name">{theme.name}</p>

          {/* ── Price row ── */}
          <div className="pp-anim pp__price-row">
            <div className="pp__price">
              <span className="pp__price-int">
                <CountUp end={product.price} />
              </span>
              <span className="pp__price-cur" style={{ color: theme.primaryColor }}>
                {product.currency}
              </span>
            </div>
            <div className="pp__stock-pill">
              <span className="pp__stock-dot" />
              In Stock
            </div>
          </div>

          {/* ── Feature chips ── */}
          <div className="pp-anim pp__chips">
            {['✨ Authentic Crest', '🌬️ Breathable', '🛡️ NFC Verified', '♻️ Eco Fabric'].map(f => (
              <span key={f} className="pp__chip">{f}</span>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="pp-anim pp__hr" style={{ background: `linear-gradient(90deg, ${theme.primaryColor}50, transparent)` }} />

          {/* ── Size selector ── */}
          {['Jersey', 'Hoodie', 'T-Shirt'].includes(product.category) && (
            <div className="pp-anim pp__section">
              <div className="pp__section-head">
                <span className="pp__section-label">Size</span>
                <span className="pp__size-guide">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                  Size Guide
                </span>
              </div>
              <div className="pp__sizes">
                {sizes.map(sz => {
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      className={`pp__size ${active ? 'pp__size--on' : ''}`}
                      onClick={() => setSelectedSize(sz)}
                      style={active ? {
                        background: theme.primaryColor,
                        borderColor: theme.primaryColor,
                        color: contrast(theme.primaryColor),
                        boxShadow: `0 0 16px ${theme.primaryColor}60`,
                      } : {}}
                    >{sz}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Quantity ── */}
          <div className="pp-anim pp__section">
            <div className="pp__section-head">
              <span className="pp__section-label">Quantity</span>
            </div>
            <div className="pp__qty">
              <button className="pp__qty-btn" onClick={() => handleAdjustQty(-1)}>−</button>
              <span className="pp__qty-val">{qty}</span>
              <button className="pp__qty-btn" onClick={() => handleAdjustQty(1)}>+</button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="pp-anim pp__tabs">
            {tabs.map(t => (
              <button
                key={t}
                className={`pp__tab ${activeTab === t ? 'pp__tab--on' : ''}`}
                onClick={() => setActiveTab(t)}
                style={activeTab === t ? { color: theme.primaryColor, borderBottomColor: theme.primaryColor } : {}}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <p className="pp-anim pp__tab-body">{tabContent[activeTab]}</p>

          {/* ── Actions ── */}
          <div className="pp-anim pp__actions">
            {/* Add to cart */}
            <button
              ref={btnRef}
              className={`pp__btn pp__btn--primary ${isAdding ? 'pp__btn--loading' : ''} ${addDone ? 'pp__btn--done' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
              style={{
                background: addDone ? '#22c55e' : theme.primaryColor,
                color: addDone ? '#fff' : contrast(theme.primaryColor),
                boxShadow: addDone ? '0 0 24px rgba(34,197,94,0.4)' : `0 0 24px ${theme.primaryColor}40`,
              }}
            >
              {isAdding ? (
                <><svg className="pp__spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Adding…</>
              ) : addDone ? (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Added!</>
              ) : cartItem ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  View in Cart
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  Add to Cart - {(product.price * qty).toLocaleString()} {product.currency}
                </>
              )}
            </button>

            {/* Fast checkout */}
            <button
              className={`pp__btn pp__btn--secondary ${isFastCheckingOut ? 'pp__btn--loading' : ''}`}
              onClick={handleFastCheckout}
              disabled={isFastCheckingOut}
              style={{ borderColor: `${theme.primaryColor}40`, color: 'rgba(255,255,255,0.85)' }}
            >
              {isFastCheckingOut ? (
                <><svg className="pp__spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Processing…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  Fast Checkout via PCC
                </>
              )}
            </button>
          </div>

          {/* ── Trust row ── */}
          <div className="pp-anim pp__trust-row">
            {[
              { icon: '🔒', text: 'Secure Payment' },
              { icon: '↩️', text: '30-Day Returns' },
              { icon: '📦', text: 'Express Shipping' },
            ].map(t => (
              <div key={t.text} className="pp__trust-item">
                <span className="pp__trust-icon">{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}