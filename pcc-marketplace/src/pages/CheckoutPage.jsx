import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../App';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import api from '../api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { balance, setBalance, refreshBalance } = useWallet();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  
  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    country: '',
    phone: '',
  });

  const PROCESSING_STAGES = [
    { label: 'Connecting to blockchain...', icon: '🔗' },
    { label: 'Verifying wallet balance...', icon: '🔍' },
    { label: 'Processing transaction...', icon: '⛓️' },
    { label: 'Confirming on-chain...', icon: '✅' },
  ];

  useEffect(() => {
    if (!user) {
      showToast('Please login to checkout', 'info');
      navigate('/login');
    }
    if (cart.length === 0 && step === 1) {
      navigate('/clubs');
    }
  }, [user, cart.length, navigate, showToast, step]);

  if (!user || (cart.length === 0 && step !== 3 && step !== 'processing')) return null;

  const handleChange = (e) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      showToast('Please fill in all required shipping fields', 'error');
      return;
    }
    setStep(2);
  };

  const runProcessingAnimation = () => {
    setStep('processing');
    setProcessingStage(0);

    const stageTimings = [1500, 1800, 2000, 1500];
    let elapsed = 0;
    stageTimings.forEach((delay, idx) => {
      elapsed += delay;
      if (idx < stageTimings.length - 1) {
        setTimeout(() => setProcessingStage(idx + 1), elapsed);
      }
    });

    return elapsed;
  };

  const handleCheckout = async () => {
    if (balance === null) {
      showToast('Wallet balance not loaded yet', 'error');
      return;
    }
    
    if (balance < cartTotal) {
      showToast(`Insufficient balance. You need ${cartTotal.toLocaleString()} PCC.`, 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        userId: user.id,
        items: cart,
        shipping,
        totalPcc: cartTotal
      };

      // Start processing animation
      const totalAnimTime = runProcessingAnimation();

      const res = await api.placeOrder(orderData);
      
      if (res && res.status === 'confirmed') {
        setBalance(prev => prev - cartTotal);
        clearCart();
        
        // Wait for remaining animation time before showing confirmation
        const waitTime = Math.max(totalAnimTime - 500, 3000);
        setTimeout(() => {
          setStep(3);
          setIsProcessing(false);
        }, waitTime);
        
        setTimeout(() => refreshBalance(), waitTime + 2000);
      }
    } catch (err) {
      console.error(err);
      setStep(2);
      showToast(err.message || 'Checkout failed', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* Progress Stepper */}
        <div className="checkout-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span>Shipping</span>
          </div>
          <div className={`step-line ${step >= 2 || step === 'processing' ? 'active' : ''}`} />
          <div className={`step ${step >= 2 || step === 'processing' ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span>Payment</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''} ${step === 'processing' ? 'processing-pulse' : ''}`} />
          <div className={`step ${step >= 3 ? 'active' : ''} ${step === 'processing' ? 'processing-step' : ''}`}>
            <div className="step-circle">{step === 'processing' ? <span className="spinner-small-white"></span> : '3'}</div>
            <span>Confirmation</span>
          </div>
        </div>

        <div className={`checkout-content ${step === 3 || step === 'processing' ? 'success-layout' : ''}`}>
          
          {/* Main Content Area */}
          <div className="checkout-main">
            {step === 1 && (
              <div className="checkout-card slide-in">
                <h2>Shipping Details</h2>
                <p className="checkout-subtitle">Where should we send your merchandise?</p>
                
                <form className="shipping-form" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={shipping.fullName} 
                      onChange={handleChange} 
                      required 
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={shipping.address} 
                      onChange={handleChange} 
                      required 
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={shipping.city} 
                        onChange={handleChange} 
                        required 
                        placeholder="New York"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={shipping.country} 
                        onChange={handleChange} 
                        placeholder="USA"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={shipping.phone} 
                      onChange={handleChange} 
                      required 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  
                  <button type="submit" className="btn-checkout-primary">
                    Continue to Payment
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card slide-in">
                <h2>Review & Pay</h2>
                <p className="checkout-subtitle">Complete your transaction securely on the blockchain.</p>
                
                <div className="payment-review">
                  <div className="review-section">
                    <h3>Shipping To</h3>
                    <p>{shipping.fullName}</p>
                    <p>{shipping.address}</p>
                    <p>{shipping.city}, {shipping.country}</p>
                    <button className="btn-text" onClick={() => setStep(1)}>Edit Shipping</button>
                  </div>
                  
                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <div className="wallet-card">
                      <div className="wallet-card-icon">🪙</div>
                      <div className="wallet-card-info">
                        <span className="wallet-card-name">PCC Wallet</span>
                        <span className="wallet-card-balance">Balance: {balance !== null ? balance.toLocaleString() : '...'} PCC</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button 
                    className="btn-checkout-secondary" 
                    onClick={() => setStep(1)}
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button 
                    className={`btn-checkout-primary ${isProcessing ? 'loading' : ''}`} 
                    onClick={handleCheckout}
                    disabled={isProcessing || balance === null || balance < cartTotal}
                  >
                    {isProcessing ? (
                      <span className="btn-inner">
                        <span className="spinner-small"></span> Processing...
                      </span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', marginBottom: '2px' }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Pay {cartTotal.toLocaleString()} PCC
                      </>
                    )}
                  </button>
                </div>
                
                {balance === null ? (
                  <div className="balance-warning">
                    ⚠️ Loading wallet balance...
                  </div>
                ) : balance < cartTotal ? (
                  <div className="balance-warning">
                    ⚠️ You need {(cartTotal - balance).toLocaleString()} more PCC to complete this order.
                  </div>
                ) : null}
              </div>
            )}

            {step === 'processing' && (
              <div className="checkout-processing slide-in">
                <div className="processing-spinner-ring">
                  <div className="processing-ring-outer"></div>
                  <div className="processing-ring-inner">⛓️</div>
                </div>
                <h2>Processing Transaction</h2>
                <p>Please wait while we process your payment on the blockchain.</p>
                <div className="processing-stages">
                  {PROCESSING_STAGES.map((stage, idx) => (
                    <div key={idx} className={`processing-stage ${idx <= processingStage ? 'active' : ''} ${idx === processingStage ? 'current' : ''}`}>
                      <span className="stage-icon">{idx < processingStage ? '✓' : stage.icon}</span>
                      <span className="stage-label">{stage.label}</span>
                      {idx === processingStage && <span className="stage-dots"><span>.</span><span>.</span><span>.</span></span>}
                    </div>
                  ))}
                </div>
                <div className="processing-progress-bar">
                  <div className="processing-progress-fill" style={{ width: `${((processingStage + 1) / PROCESSING_STAGES.length) * 100}%` }}></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-success slide-in">
                <div className="success-icon-container">
                  <div className="success-icon">✓</div>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Your payment was successfully processed on the blockchain.</p>
                <div className="receipt-box">
                  <p>A digital receipt has been sent to your email.</p>
                  <p>You can track your order status in your profile.</p>
                </div>
                <button className="btn-checkout-primary" onClick={() => navigate('/clubs')}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 3 && step !== 'processing' && (
            <div className="checkout-sidebar">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-items">
                  {cart.map((item, idx) => (
                    <div key={idx} className="summary-item">
                      <div className="summary-item-img">
                        {item.image ? <img src={item.image} alt={item.name} /> : <span>{item.emoji || '👕'}</span>}
                        <span className="summary-item-qty">{item.quantity}</span>
                      </div>
                      <div className="summary-item-info">
                        <h4>{item.name}</h4>
                        <span>Size: {item.size}</span>
                      </div>
                      <div className="summary-item-price">
                        {(item.price * item.quantity).toLocaleString()} PCC
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{cartTotal.toLocaleString()} PCC</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className="highlight-free">FREE</span>
                  </div>
                  <div className="summary-row">
                    <span>Network Fee</span>
                    <span className="highlight-free">Sponsored</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{cartTotal.toLocaleString()} PCC</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
