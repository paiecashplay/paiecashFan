import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ln', label: 'Lingala' },
  { code: 'bm', label: 'Bambara' },
  { code: 'rn', label: 'Kirundi' },
  { code: 'wo', label: 'Wolof' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'ko', label: '한국어 (Korean)' },
];

const INCLUDED_LANGS = LANGUAGES.map(l => l.code).join(',');
const STORAGE_KEY = 'pcc_translate_lang';

/* ── CSS to nuke Google Translate's default chrome ── */
const HIDE_CSS = `
  .goog-te-banner-frame,
  .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
  #goog-gt-tt,
  .goog-te-menu-value,
  .goog-te-gadget-icon,
  .goog-te-balloon-frame {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  .skiptranslate:not(#gtranslate-hidden) {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  body {
    top: 0px !important;
    margin-top: 0px !important;
    padding-top: 0px !important;
    position: static !important;
  }
  .goog-text-highlight {
    background: none !important;
    box-shadow: none !important;
  }
  /* ── FOUT masking: smooth fade during re-translation ── */
  .app-container {
    transition: opacity 0.18s ease-out;
  }
  .app-container.gt-retranslating {
    opacity: 0;
  }
`;

function injectHideStyles() {
  if (document.getElementById('gtranslate-hide-css')) return;
  const style = document.createElement('style');
  style.id = 'gtranslate-hide-css';
  style.textContent = HIDE_CSS;
  document.head.appendChild(style);
}

function hideGoogleToolbar() {
  document.body.style.top = '0px';
  document.body.style.marginTop = '0px';
  document.body.style.paddingTop = '0px';
  document.body.style.position = '';

  const frame = document.querySelector('.goog-te-banner-frame');
  if (frame) frame.style.display = 'none';

  document.querySelectorAll('.skiptranslate').forEach(el => {
    if (el.id !== 'gtranslate-hidden') {
      el.style.display = 'none';
    }
  });
}

/**
 * Create the hidden Google Translate container OUTSIDE React's root,
 * directly on document.body.
 */
function ensureHiddenContainer() {
  if (document.getElementById('gtranslate-hidden')) return;
  const div = document.createElement('div');
  div.id = 'gtranslate-hidden';
  div.style.cssText =
    'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;';
  document.body.appendChild(div);
}

/**
 * Fire a change event on the Google Translate combo box to trigger translation.
 */
function triggerTranslation(langCode) {
  const select = document.querySelector('#gtranslate-hidden select.goog-te-combo');
  if (!select) return false;
  select.value = langCode;
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent('change', true, true);
  select.dispatchEvent(evt);
  return true;
}

/**
 * Briefly hide the app content, re-trigger translation, then fade back in.
 * This masks the "flash of English" during SPA route changes.
 */
function retranslateWithFade(langCode) {
  const appContainer = document.querySelector('.app-container');
  if (!appContainer) {
    triggerTranslation(langCode);
    return;
  }

  // Phase 1: fade out instantly
  appContainer.classList.add('gt-retranslating');

  // Phase 2: re-trigger translation after a tiny delay (let React finish rendering)
  setTimeout(() => {
    triggerTranslation(langCode);

    // Phase 3: fade back in after Google has processed the new DOM
    setTimeout(() => {
      appContainer.classList.remove('gt-retranslating');
      hideGoogleToolbar();
    }, 250);
  }, 50);

  // Extra cleanup passes
  [600, 1200, 2000].forEach(ms => setTimeout(hideGoogleToolbar, ms));
}

export default function GoogleTranslateWidget({ scrolled, dropDirection = 'down', variant = 'icon' }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeLang, setActiveLang] = useState(() => {
    // Restore persisted language choice
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });
  const wrapperRef = useRef(null);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const initialAppliedRef = useRef(false);

  /* ── Bootstrap Google Translate ── */
  useEffect(() => {
    injectHideStyles();
    ensureHiddenContainer();

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: INCLUDED_LANGS,
            autoDisplay: false,
          },
          'gtranslate-hidden'
        );
      } catch {
        // Silently handle if already initialized
      }
    };

    if (!document.getElementById('gtranslate-script')) {
      const script = document.createElement('script');
      script.id = 'gtranslate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    const poll = setInterval(() => {
      const combo = document.querySelector('#gtranslate-hidden select.goog-te-combo');
      if (combo) {
        setReady(true);
        clearInterval(poll);
      }
    }, 200);

    const nukeInterval = setInterval(hideGoogleToolbar, 300);

    const observer = new MutationObserver(() => {
      hideGoogleToolbar();
    });
    observer.observe(document.body, { childList: true });

    return () => {
      clearInterval(poll);
      clearInterval(nukeInterval);
      observer.disconnect();
    };
  }, []);

  /* ── Auto-apply saved language once Google Translate is ready ── */
  useEffect(() => {
    if (!ready || initialAppliedRef.current) return;
    initialAppliedRef.current = true;

    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && savedLang !== 'en') {
      // Apply saved language — use fade to mask the initial translation
      retranslateWithFade(savedLang);
    }
  }, [ready]);

  /* ── Re-apply translation on route change ── */
  useEffect(() => {
    if (!ready) return;
    // Skip the initial mount — only react to actual navigation
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    if (activeLang !== 'en') {
      // New page rendered → briefly hide, re-trigger, fade back
      retranslateWithFade(activeLang);
    }
  }, [location.pathname, ready, activeLang]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Select a language ── */
  const selectLanguage = useCallback(
    (langCode) => {
      if (!ready) return;

      if (langCode === 'en') {
        try {
          const frame = document.querySelector('.goog-te-banner-frame');
          if (frame) {
            const restore = frame.contentDocument?.querySelector('.goog-close-link');
            if (restore) restore.click();
          }
        } catch {
          // Cross-origin may block
        }
        triggerTranslation('en');
        localStorage.removeItem(STORAGE_KEY);
      } else {
        triggerTranslation(langCode);
        localStorage.setItem(STORAGE_KEY, langCode);
      }

      setActiveLang(langCode);
      setOpen(false);

      [500, 1000, 1500, 2500].forEach((ms) => {
        setTimeout(hideGoogleToolbar, ms);
      });
    },
    [ready]
  );

  const isTranslated = activeLang !== 'en';
  const currentLangLabel = LANGUAGES.find(l => l.code === activeLang)?.label || 'English';

  const isFull = variant === 'full';

  return (
    <>
      <div ref={wrapperRef} className="notranslate" style={{ position: 'relative', width: isFull ? '100%' : 'auto' }}>
        {/* ── Globe Button ── */}
        <button
          onClick={() => setOpen((p) => !p)}
          aria-label="Translate page"
          style={{
            width: isFull ? '100%' : (scrolled ? 34 : 38),
            height: isFull ? 44 : (scrolled ? 34 : 38),
            borderRadius: isFull ? 12 : '50%',
            background: open ? 'rgba(0,230,118,0.12)' : 'rgba(255,255,255,0.06)',
            border: open
              ? '1px solid rgba(0,230,118,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            color: open || isTranslated ? '#00e676' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isFull ? 'space-between' : 'center',
            padding: isFull ? '0 16px' : 0,
            position: 'relative',
            transition: 'all 0.3s',
            flexShrink: 0,
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 14,
          }}
          onMouseEnter={(e) => {
            if (!open) {
              e.currentTarget.style.borderColor = 'rgba(0,230,118,0.5)';
              e.currentTarget.style.color = '#00e676';
            }
          }}
          onMouseLeave={(e) => {
            if (!open) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = isTranslated ? '#00e676' : 'rgba(255,255,255,0.6)';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={isFull ? 18 : 16} strokeWidth={2} />
            {isFull && <span>{currentLangLabel}</span>}
          </div>

          {isFull && (
            <motion.svg
              animate={{ rotate: open ? 180 : 0 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          )}

          {/* Active-language dot (only for icon mode) */}
          {!isFull && isTranslated && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00e676',
                border: '2px solid #060f0a',
                boxShadow: '0 0 6px rgba(0,230,118,0.6)',
              }}
            />
          )}
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div
            className="notranslate"
            style={{
              position: 'absolute',
              ...(dropDirection === 'up'
                ? { bottom: 'calc(100% + 10px)', right: 0 }
                : { top: 'calc(100% + 10px)', right: 0 }),
              width: 220,
              maxWidth: 'calc(100vw - 32px)',
              background: 'rgba(8,20,12,0.97)',
              border: '1px solid rgba(0,230,118,0.2)',
              borderRadius: 16,
              boxShadow: dropDirection === 'up'
                ? '0 -12px 40px rgba(0,0,0,0.5)'
                : '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 9999,
              overflow: 'hidden',
              animation: dropDirection === 'up' ? 'gtDropUp 0.2s ease-out' : 'gtDropIn 0.18s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 14px 8px',
                borderBottom: '1px solid rgba(0,230,118,0.1)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#00e676',
                }}
              >
                🌐 Translate
              </span>
            </div>

            {/* Language list */}
            <div
              style={{
                maxHeight: 280,
                overflowY: 'auto',
                padding: '4px 6px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,230,118,0.2) transparent',
              }}
            >
              {LANGUAGES.map((lang) => {
                const isActive = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '9px 10px',
                      background: isActive
                        ? 'rgba(0,230,118,0.1)'
                        : 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#00e676' : 'rgba(255,255,255,0.7)',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(0,230,118,0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{lang.label}</span>
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        style={{ color: '#00e676', flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div
              style={{
                padding: '8px 14px 10px',
                borderTop: '1px solid rgba(0,230,118,0.08)',
                fontSize: 10,
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Rajdhani', sans-serif",
                textAlign: 'center',
              }}
            >
              Powered by Google Translate
            </div>
          </div>
        )}
      </div>

      {/* Dropdown animation keyframes */}
      <style>{`
        @keyframes gtDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gtDropUp {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        #gtranslate-hidden .goog-te-combo {
          opacity: 0 !important;
          position: absolute !important;
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
}
