import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
document.head.appendChild(fontLink);

const styles = `
  .aww-login-root {
    min-height: 100vh;
    background: #050505;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    font-family: 'Outfit', sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .aww-bg-mesh {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .aww-orb-1 {
    position: absolute;
    width: 50vw;
    height: 50vw;
    background: radial-gradient(circle, rgba(29, 158, 117, 0.15) 0%, transparent 60%);
    top: -20%;
    right: -10%;
    filter: blur(100px);
    animation: orbFloat1 20s ease-in-out infinite alternate;
  }

  .aww-orb-2 {
    position: absolute;
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, rgba(14, 49, 37, 0.25) 0%, transparent 60%);
    bottom: -30%;
    left: -20%;
    filter: blur(120px);
    animation: orbFloat2 25s ease-in-out infinite alternate;
  }

  @keyframes orbFloat1 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-5%, 10%) scale(1.1); }
  }

  @keyframes orbFloat2 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(5%, -10%) scale(1.05); }
  }

  .aww-container {
    width: 100%;
    max-width: 1100px;
    min-height: 640px;
    display: flex;
    background: rgba(15, 15, 15, 0.4);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    position: relative;
    z-index: 1;
    overflow: hidden;
    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .aww-left {
    flex: 1.2;
    padding: 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    background: linear-gradient(180deg, rgba(29, 158, 117, 0.02) 0%, transparent 100%);
  }

  .aww-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .aww-logo-mark {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #1D9E75 0%, #0d4a36 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    color: #fff;
    box-shadow: 0 10px 20px -5px rgba(29, 158, 117, 0.4);
  }

  .aww-logo-text {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .aww-hero-content {
    margin-top: auto;
    margin-bottom: auto;
  }

  .aww-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba(29, 158, 117, 0.1);
    border: 1px solid rgba(29, 158, 117, 0.2);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #1D9E75;
    margin-bottom: 32px;
  }

  .aww-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    line-height: 1;
    font-weight: 400;
    letter-spacing: -2px;
    margin-bottom: 24px;
    color: #fff;
  }

  .aww-hero-title em {
    font-style: italic;
    color: #1D9E75;
  }

  .aww-hero-desc {
    font-size: 15px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.5);
    max-width: 320px;
    font-weight: 300;
  }

  .aww-right {
    flex: 1;
    padding: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    background: rgba(5, 5, 5, 0.4);
  }

  .aww-tabs {
    display: flex;
    gap: 32px;
    margin-bottom: 48px;
    position: relative;
  }

  .aww-tab {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 500;
    padding: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.3s;
    position: relative;
  }

  .aww-tab.active {
    color: #fff;
  }

  .aww-tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: #1D9E75;
    border-radius: 2px;
  }

  .aww-form-wrapper {
    position: relative;
    width: 100%;
  }

  .aww-field {
    position: relative;
    margin-bottom: 24px;
  }

  .aww-label {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 300;
  }

  .aww-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 0;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    color: #fff;
    outline: none;
    transition: border-color 0.3s;
  }

  .aww-input:focus,
  .aww-input:not(:placeholder-shown) {
    border-bottom-color: #1D9E75;
  }

  .aww-input:focus + .aww-label,
  .aww-input:not(:placeholder-shown) + .aww-label {
    top: -8px;
    font-size: 11px;
    color: #1D9E75;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .aww-submit {
    width: 100%;
    padding: 18px;
    margin-top: 32px;
    background: #fff;
    color: #050505;
    border: none;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .aww-submit::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
    transform: translateX(-100%);
    transition: 0.5s;
  }

  .aww-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -10px rgba(255, 255, 255, 0.3);
  }

  .aww-submit:hover::after {
    transform: translateX(100%);
  }

  .aww-submit:active {
    transform: translateY(0) scale(0.98);
  }

  .aww-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .aww-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(0,0,0,0.1);
    border-top-color: #050505;
    border-radius: 50%;
    animation: aww-spin 0.8s linear infinite;
  }

  @keyframes aww-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .aww-container { flex-direction: column; }
    .aww-left { padding: 40px; border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .aww-hero-title { font-size: 48px; }
    .aww-right { padding: 40px; }
  }
`;

export default function Login() {
  const [email, setEmail]     = useState('');
  const [name, setName]       = useState('');
  const [sport, setSport]     = useState('');
  const [team, setTeam]       = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();
  const toast                 = useToast();
  const styleRef              = useRef(null);

  useEffect(() => {
    if (!document.getElementById('aww-login-styles')) {
      const tag = document.createElement('style');
      tag.id = 'aww-login-styles';
      tag.textContent = styles;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, sport, team);
      } else {
        await login(email);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="aww-login-root">
      <div className="aww-bg-mesh">
        <div className="aww-orb-1" />
        <div className="aww-orb-2" />
      </div>

      <motion.div 
        className="aww-container"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="aww-left">
          <motion.div 
            className="aww-brand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="aww-logo-mark">P</div>
            <span className="aww-logo-text">PaieCashFan</span>
          </motion.div>

          <motion.div 
            className="aww-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="aww-hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75' }}></span>
              Marketplace V2
            </div>
            <h1 className="aww-hero-title">
              Enter the<br />
              <em>future</em> of<br />
              sports.
            </h1>
            <p className="aww-hero-desc">
              Connect with fellow fans, earn exclusive rewards, and trade digital assets seamlessly on the world's most elegant sports marketplace.
            </p>
          </motion.div>
        </div>

        <div className="aww-right">
          <div className="aww-tabs">
            <button 
              type="button"
              className={`aww-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
              {!isRegister && (
                <motion.div 
                  layoutId="tab-indicator"
                  className="aww-tab-indicator"
                  style={{ width: '100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
            <button 
              type="button"
              className={`aww-tab ${isRegister ? 'active' : ''}`}
              onClick={() => setIsRegister(true)}
            >
              Create Account
              {isRegister && (
                <motion.div 
                  layoutId="tab-indicator"
                  className="aww-tab-indicator"
                  style={{ width: '100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>

          <div className="aww-form-wrapper">
            <AnimatePresence mode="wait">
              <motion.form
                key={isRegister ? 'register' : 'login'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
              >
                {isRegister && (
                  <div className="aww-field">
                    <input
                      type="text"
                      className="aww-input"
                      placeholder=" "
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <label className="aww-label">Full Name</label>
                  </div>
                )}

                <div className="aww-field">
                  <input
                    type="email"
                    className="aww-input"
                    placeholder=" "
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <label className="aww-label">Email Address</label>
                </div>

                {isRegister && (
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div className="aww-field" style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="aww-input"
                        placeholder=" "
                        value={sport}
                        onChange={e => setSport(e.target.value)}
                        required
                      />
                      <label className="aww-label">Favorite Sport</label>
                    </div>
                    <div className="aww-field" style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="aww-input"
                        placeholder=" "
                        value={team}
                        onChange={e => setTeam(e.target.value)}
                        required
                      />
                      <label className="aww-label">Club / Team</label>
                    </div>
                  </div>
                )}

                <button type="submit" className="aww-submit" disabled={loading}>
                  {loading ? (
                    <div className="aww-spinner" />
                  ) : (
                    <>
                      {isRegister ? 'Begin Journey' : 'Access Account'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}