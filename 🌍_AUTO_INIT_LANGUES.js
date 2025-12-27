// 🌍 AUTO-INITIALISATION DES LANGUES
// Ce script s'exécute automatiquement sur TOUTES les pages du site
// Il charge et initialise le système multi-langues

(function() {
    'use strict';
    
    console.log('🌍 Auto-init langues : Démarrage...');
    
    // 1. Vérifier si on est sur index.html (déjà géré)
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    
    if (isIndexPage && document.getElementById('languageSelector')) {
        console.log('✅ Page index.html détectée, initialisation déjà gérée');
        return; // Déjà géré par index.html
    }
    
    // 2. Forcer le français si langue = 'pt'
    const langueActuelle = localStorage.getItem('langue_preferee');
    if (langueActuelle === 'pt') {
        console.warn('⚠️ Langue "pt" détectée → Forçage en français');
        localStorage.setItem('langue_preferee', 'fr');
        window.location.reload(); // Recharger pour appliquer
        return;
    }
    
    // 3. Attendre le chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMultiLangues);
    } else {
        initMultiLangues();
    }
    
    async function initMultiLangues() {
        try {
            // 4. Vérifier si le fichier I18N est chargé
            if (typeof LANGUES_SUPPORTEES === 'undefined') {
                console.warn('⚠️ Fichier 🌍_MULTI_LANGUES_I18N.js non chargé');
                return;
            }
            
            // 5. Initialiser le système
            if (typeof initialiserMultiLangues === 'function') {
                await initialiserMultiLangues();
                console.log('✅ Multi-langues initialisé');
            }
            
            // 6. Chercher un conteneur pour le sélecteur
            let selectorContainer = document.getElementById('languageSelector');
            
            // Si pas de conteneur dédié, créer un dans le nav
            if (!selectorContainer) {
                const nav = document.querySelector('nav') || document.querySelector('header');
                if (nav) {
                    selectorContainer = document.createElement('div');
                    selectorContainer.id = 'languageSelector';
                    selectorContainer.style.cssText = 'display: flex; gap: 8px; align-items: center;';
                    nav.appendChild(selectorContainer);
                    console.log('✅ Conteneur sélecteur créé dans nav/header');
                }
            }
            
            // 7. Générer le sélecteur
            if (selectorContainer && typeof genererSelecteurLangue === 'function') {
                selectorContainer.innerHTML = genererSelecteurLangue();
                console.log('✅ Sélecteur de langue généré');
            }
            
            // 8. Traduire la page
            if (typeof traduire === 'function') {
                traduire();
                const langue = typeof getLangueActive === 'function' ? getLangueActive() : 'fr';
                console.log('✅ Page traduite en:', langue);
            }
            
            console.log('🌍 Auto-init langues : Terminé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur auto-init langues:', error);
        }
    }
})();
