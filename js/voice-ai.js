/**
 * PaieCashFan - Voice AI Extension
 * Ajoute capacités vocales (Speech-to-Text & Text-to-Speech)
 */

class VoiceAI {
    constructor() {
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        
        this.initSpeechRecognition();
        this.loadVoices();
    }
    
    // Initialiser la reconnaissance vocale
    initSpeechRecognition() {
        // Vérifier le support navigateur
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('⚠️ La reconnaissance vocale n\'est pas supportée par ce navigateur');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'fr-FR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Événements
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Écoute en cours...');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🎤 Écoute terminée');
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Erreur reconnaissance vocale:', event.error);
            this.isListening = false;
        };
    }
    
    // Charger les voix disponibles
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Les voix ne sont pas toujours chargées immédiatement
        if (this.voices.length === 0) {
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis.getVoices();
            };
        }
    }
    
    // Obtenir la meilleure voix française
    getFrenchVoice() {
        // Chercher une voix française de qualité
        const frenchVoices = this.voices.filter(voice => 
            voice.lang.startsWith('fr')
        );
        
        // Préférer les voix Google ou Microsoft
        const premiumVoice = frenchVoices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Premium')
        );
        
        return premiumVoice || frenchVoices[0] || this.voices[0];
    }
    
    /**
     * Démarrer l'écoute (Speech-to-Text)
     * @returns {Promise<string>} Le texte reconnu
     */
    startListening() {
        return new Promise((resolve, reject) => {
            if (!this.recognition) {
                reject(new Error('Reconnaissance vocale non supportée'));
                return;
            }
            
            if (this.isListening) {
                reject(new Error('Déjà en écoute'));
                return;
            }
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                console.log('🎤 Reconnu:', transcript, `(confiance: ${(confidence * 100).toFixed(0)}%)`);
                resolve({
                    text: transcript,
                    confidence: confidence
                });
            };
            
            this.recognition.onerror = (event) => {
                reject(new Error(`Erreur: ${event.error}`));
            };
            
            try {
                this.recognition.start();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Arrêter l'écoute
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    /**
     * Lire du texte (Text-to-Speech)
     * @param {string} text - Le texte à lire
     * @param {object} options - Options (rate, pitch, volume)
     * @returns {Promise<void>}
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Synthèse vocale non supportée'));
                return;
            }
            
            // Arrêter toute lecture en cours
            this.stopSpeaking();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configuration
            utterance.voice = this.getFrenchVoice();
            utterance.rate = options.rate || 1.0; // Vitesse (0.1 à 10)
            utterance.pitch = options.pitch || 1.0; // Tonalité (0 à 2)
            utterance.volume = options.volume || 1.0; // Volume (0 à 1)
            utterance.lang = 'fr-FR';
            
            // Événements
            utterance.onstart = () => {
                this.isSpeaking = true;
                console.log('🔊 Lecture en cours...');
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                console.log('🔊 Lecture terminée');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('❌ Erreur synthèse vocale:', event.error);
                reject(new Error(event.error));
            };
            
            // Lancer la lecture
            this.synthesis.speak(utterance);
        });
    }
    
    /**
     * Arrêter la lecture
     */
    stopSpeaking() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }
    
    /**
     * Mettre en pause la lecture
     */
    pauseSpeaking() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.pause();
        }
    }
    
    /**
     * Reprendre la lecture
     */
    resumeSpeaking() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }
    
    /**
     * Vérifier si le navigateur supporte la synthèse vocale
     */
    isSpeechSynthesisSupported() {
        return 'speechSynthesis' in window;
    }
    
    /**
     * Vérifier si le navigateur supporte la reconnaissance vocale
     */
    isSpeechRecognitionSupported() {
        return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    }
    
    /**
     * Obtenir les capacités vocales
     */
    getCapabilities() {
        return {
            speechSynthesis: this.isSpeechSynthesisSupported(),
            speechRecognition: this.isSpeechRecognitionSupported(),
            voices: this.voices.length,
            isListening: this.isListening,
            isSpeaking: this.isSpeaking
        };
    }
}

// Instance globale
window.voiceAI = new VoiceAI();
