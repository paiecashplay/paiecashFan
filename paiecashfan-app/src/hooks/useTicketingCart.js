import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// Panier de billetterie partagé (contexte) + persistant via localStorage :
// il survit au rafraîchissement et à la navigation, et — contrairement à un
// simple hook — un seul état est partagé par tous les composants (badge navbar,
// page /panier, page billetterie) donc les mises à jour sont instantanées.
// Circuit d'émission distinct de la boutique (checkout /api/v2/checkout/ticketing,
// puis Redtaag) : on garde donc un panier séparé, unifié seulement côté surface.
const STORAGE_KEY = 'pcf_ticketing_cart_v1';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const TicketingCartContext = createContext(null);

export function TicketingCartProvider({ children }) {
  const [cart, setCart] = useState(read);

  // Sauvegarde à chaque changement.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* quota / navigation privée */
    }
  }, [cart]);

  // Synchronise entre onglets ouverts (l'état partagé gère déjà le même onglet).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setCart(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback(
    (item) => setCart((prev) => [...prev, item]),
    []
  );
  const removeItem = useCallback(
    (index) => setCart((prev) => prev.filter((_, i) => i !== index)),
    []
  );
  const clear = useCallback(() => setCart([]), []);

  // createElement (pas de JSX) pour que ce provider reste dans un fichier .js
  // sans casser le build (rollup n'accepte pas le JSX en .js).
  return createElement(
    TicketingCartContext.Provider,
    { value: { cart, addItem, removeItem, clear, setCart } },
    children
  );
}

export function useTicketingCart() {
  const ctx = useContext(TicketingCartContext);
  if (!ctx) {
    throw new Error(
      'useTicketingCart doit être utilisé dans <TicketingCartProvider>'
    );
  }
  return ctx;
}
