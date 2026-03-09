/**
 * storiesManager.js — Gestionnaire de Stories PaieCashFan
 * Gère l'affichage des stories des fans et des clubs
 */

const storiesManager = {
    stories: [],
    currentIndex: 0,
    autoPlayInterval: null,

    // Charger toutes les stories
    loadAllStories() {
        // Stories de démonstration
        this.stories = [
            { id: 1, user: 'Fan OM', avatar: null, content: '🔵⚪ Allez l\'OM !', type: 'text', seen: false },
            { id: 2, user: 'Fan PSG', avatar: null, content: '🔴🔵 Paris est magique !', type: 'text', seen: false },
            { id: 3, user: 'Fan Lyon', avatar: null, content: '🔴 Allez l\'OL !', type: 'text', seen: false },
        ];
        this._renderStoriesBar();
    },

    // Démarrer la lecture automatique
    startAutoPlay() {
        // Auto-play désactivé par défaut pour ne pas perturber l'UX
    },

    // Arrêter la lecture automatique
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    },

    // Afficher une story
    showStory(index) {
        if (index < 0 || index >= this.stories.length) return;
        this.currentIndex = index;
        const story = this.stories[index];
        story.seen = true;
        console.log('📖 Story:', story.content);
    },

    // Rendu de la barre de stories
    _renderStoriesBar() {
        const container = document.querySelector('.stories-container');
        if (!container || this.stories.length === 0) return;

        container.innerHTML = this.stories.map((story, i) => `
            <div class="story-item" onclick="storiesManager.showStory(${i})">
                <div class="story-avatar ${story.seen ? 'seen' : 'unseen'}">
                    <div style="width:100%;height:100%;background:linear-gradient(135deg,#f59e0b,#ec4899);display:flex;align-items:center;justify-content:center;font-size:20px;">
                        ${story.user.charAt(0)}
                    </div>
                </div>
                <span class="story-name">${story.user}</span>
            </div>
        `).join('');
    }
};

// Export global
window.storiesManager = storiesManager;
