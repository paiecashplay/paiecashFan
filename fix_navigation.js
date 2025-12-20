// ========================================
// CORRECTION URGENTE - NAVIGATION
// ========================================

console.log('🔧 Chargement de la correction de navigation...');

// Forcer l'initialisation de la navigation après un court délai
setTimeout(() => {
    console.log('🚀 Tentative de correction de la navigation...');
    
    const navButtons = document.querySelectorAll('.nav-item');
    console.log('📋 Boutons de navigation trouvés:', navButtons.length);
    
    if (navButtons.length === 0) {
        console.error('❌ Aucun bouton de navigation trouvé !');
        return;
    }
    
    // Réattacher les événements de clic
    navButtons.forEach((btn, index) => {
        const section = btn.dataset.section;
        console.log(`🔘 Réattachement du bouton ${index + 1}: ${section}`);
        
        // Supprimer les anciens listeners (si existants)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Ajouter le nouveau listener
        newBtn.addEventListener('click', function() {
            console.log('👆 Clic détecté sur:', section);
            switchSection(section);
        });
    });
    
    console.log('✅ Correction de navigation appliquée !');
    
}, 2500); // Attendre que tout soit chargé (après le loader de 2000ms)

// Fonction switchSection (au cas où elle n'existe pas)
function switchSection(sectionName) {
    console.log('🔄 Changement vers section:', sectionName);
    
    // Cacher toutes les sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Afficher la section ciblée
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('✅ Section affichée:', sectionName);
    } else {
        console.error('❌ Section introuvable:', `${sectionName}Section`);
    }
    
    // Mettre à jour les boutons de navigation
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log('✅ Bouton actif:', sectionName);
    }
}

// Exposer la fonction globalement
window.switchSection = switchSection;

console.log('✅ Correction de navigation chargée !');
