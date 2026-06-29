import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Remonte en haut de page à chaque changement de route. React Router conserve
// par défaut la position de scroll : sans ça, cliquer une card depuis le bas
// d'une liste fait arriver au milieu (voire dans le footer) de la page suivante.
// On se base sur le pathname uniquement → les changements de query (?tab=…) et
// les scrolls internes (ancres du SideDock) ne sont pas affectés.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
