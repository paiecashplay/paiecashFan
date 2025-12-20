# 🤖 DOCUMENTATION IA VOCALE MULTILINGUE

**Module :** `ai-voice-multilingual.js`  
**Version :** 1.0  
**Langues supportées :** 8 (FR, EN, ES, DE, IT, AR, ZH, JA)

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Langues supportées](#langues-supportées)
3. [Fonctionnalités](#fonctionnalités)
4. [Utilisation](#utilisation)
5. [Intégration dans un club](#intégration-dans-un-club)
6. [API Référence](#api-référence)
7. [Exemples de code](#exemples-de-code)
8. [Dépannage](#dépannage)

---

## 🌟 VUE D'ENSEMBLE

Le module **IA Vocale Multilingue** est un système complet qui combine :
- **Reconnaissance vocale** (Speech-to-Text)
- **Synthèse vocale** (Text-to-Speech)
- **Chat conversationnel** avec réponses contextuelles
- **Traduction automatique** entre 8 langues

### Technologies utilisées
- **Web Speech API** (reconnaissance vocale)
- **Speech Synthesis API** (synthèse vocale)
- **JavaScript ES6+** (classes, async/await)

---

## 🌍 LANGUES SUPPORTÉES

| Langue | Code | Drapeau | Code locale | Support navigateurs |
|--------|------|---------|-------------|---------------------|
| **Français** | `fr` | 🇫🇷 | `fr-FR` | ✅ Chrome, Edge, Safari |
| **Anglais** | `en` | 🇬🇧 | `en-US` | ✅ Chrome, Edge, Safari, Firefox |
| **Espagnol** | `es` | 🇪🇸 | `es-ES` | ✅ Chrome, Edge, Safari |
| **Allemand** | `de` | 🇩🇪 | `de-DE` | ✅ Chrome, Edge, Safari |
| **Italien** | `it` | 🇮🇹 | `it-IT` | ✅ Chrome, Edge, Safari |
| **Arabe** | `ar` | 🇸🇦 | `ar-SA` | ✅ Chrome, Edge |
| **Chinois** | `zh` | 🇨🇳 | `zh-CN` | ✅ Chrome, Edge |
| **Japonais** | `ja` | 🇯🇵 | `ja-JP` | ✅ Chrome, Edge, Safari |

### Compatibilité navigateurs

| Fonctionnalité | Chrome | Edge | Safari | Firefox | Opera |
|----------------|--------|------|--------|---------|-------|
| Reconnaissance vocale | ✅ | ✅ | ✅ | ⚠️ Limité | ✅ |
| Synthèse vocale | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ✨ FONCTIONNALITÉS

### 1. Reconnaissance Vocale (Speech-to-Text)
- Écoute de la voix de l'utilisateur
- Transcription en texte en temps réel
- Support de 8 langues
- Détection automatique de la fin de parole

### 2. Synthèse Vocale (Text-to-Speech)
- Lecture à voix haute des réponses
- Voix naturelles dans chaque langue
- Contrôle du débit, volume, tonalité
- Annulation de synthèse en cours

### 3. Chat Conversationnel
- Réponses contextuelles basées sur des mots-clés
- Support multi-langues
- Intégration avec l'interface de chat

### 4. Détection de mots-clés
- **Billets** : Informations sur la billetterie
- **Boutique** : Accès au shop officiel
- **Wallet** : Informations sur le portefeuille
- **Fidélité** : Points et récompenses
- **Aide** : Menu d'aide complet

---

## 🔧 UTILISATION

### Installation

**1. Copier le fichier dans votre projet**
```bash
cp clubs/paris-fc/ai-voice-multilingual.js votre-club/
```

**2. Inclure dans votre HTML**
```html
<script src="ai-voice-multilingual.js"></script>
```

**3. Initialiser dans votre JavaScript**
```javascript
let aiVoice = new AIVoiceMultilingual();
```

### Utilisation de base

**Démarrer l'écoute :**
```javascript
aiVoice.startListening(
    (transcript) => {
        console.log('User said:', transcript);
        // Traiter la transcription
    },
    (error) => {
        console.error('Error:', error);
    }
);
```

**Arrêter l'écoute :**
```javascript
aiVoice.stopListening();
```

**Faire parler l'IA :**
```javascript
aiVoice.speak('Bonjour ! Comment puis-je vous aider ?', () => {
    console.log('Speech finished');
});
```

**Changer de langue :**
```javascript
aiVoice.setLanguage('en'); // Passer en anglais
aiVoice.setLanguage('es'); // Passer en espagnol
aiVoice.setLanguage('ja'); // Passer en japonais
```

---

## 🏗️ INTÉGRATION DANS UN CLUB

### Étape 1 : Structure HTML

Ajoutez ces éléments dans votre `app.html` :

```html
<!-- Modal IA -->
<div class="modal-overlay" id="aiModal">
    <div class="ai-modal-container">
        <div class="ai-modal-header">
            <h3>🤖 Assistant IA</h3>
            <button class="btn-close-modal" onclick="closeAIModal()">✕</button>
        </div>
        <div class="ai-modal-body" id="aiChatMessages">
            <!-- Messages IA -->
        </div>
        <div class="ai-modal-footer">
            <!-- Sélecteur de langue -->
            <select id="langSelector" class="lang-selector">
                <option value="fr">🇫🇷 FR</option>
                <option value="en">🇬🇧 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="de">🇩🇪 DE</option>
                <option value="it">🇮🇹 IT</option>
                <option value="ar">🇸🇦 AR</option>
                <option value="zh">🇨🇳 ZH</option>
                <option value="ja">🇯🇵 JA</option>
            </select>
            <!-- Bouton micro -->
            <button class="btn-voice" id="btnVoice">🎤</button>
            <!-- Input texte -->
            <input type="text" id="aiInput" placeholder="Posez votre question...">
            <!-- Bouton envoi -->
            <button class="btn-send" id="btnSend">📤</button>
        </div>
    </div>
</div>
```

### Étape 2 : Styles CSS

Ajoutez ces styles dans votre `app.css` :

```css
/* Sélecteur de langue */
.lang-selector {
    background: var(--bg-card);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 10px;
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 13px;
    cursor: pointer;
    min-width: 80px;
}

/* Bouton vocal */
.btn-voice {
    background: linear-gradient(135deg, var(--om-blue), #3b82f6);
    border: none;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-voice:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
}

/* Messages chat */
.ai-message {
    margin-bottom: 12px;
    display: flex;
    animation: fadeInUp 0.3s ease;
}

.user-message {
    justify-content: flex-end;
}

.bot-message {
    justify-content: flex-start;
}

.message-content {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
}

.user-message .message-content {
    background: linear-gradient(135deg, var(--om-blue), #3b82f6);
    color: white;
    border-bottom-right-radius: 4px;
}

.bot-message .message-content {
    background: var(--bg-card);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
}
```

### Étape 3 : JavaScript

Ajoutez ce code dans votre `app.js` :

```javascript
// Initialisation IA Vocale
let aiVoice = null;

function initAIVoice() {
    if (typeof AIVoiceMultilingual === 'undefined') {
        console.warn('⚠️ AIVoiceMultilingual non chargé');
        return;
    }
    
    aiVoice = new AIVoiceMultilingual();
    console.log('✅ IA Vocale initialisée (8 langues)');
    
    // Event listeners
    document.getElementById('langSelector').onchange = (e) => {
        aiVoice.setLanguage(e.target.value);
    };
    
    document.getElementById('btnVoice').onclick = toggleVoiceRecording;
}

function toggleVoiceRecording() {
    if (!aiVoice) return;
    
    const btn = document.getElementById('btnVoice');
    
    if (aiVoice.isRecording) {
        aiVoice.stopListening();
        btn.innerHTML = '🎤';
        btn.style.background = '';
    } else {
        btn.innerHTML = '🔴';
        btn.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
        
        aiVoice.startListening(
            (transcript) => {
                // Afficher le message utilisateur
                addChatMessage(transcript, 'user');
                
                // Obtenir et afficher la réponse
                const response = aiVoice.processVoiceMessage(transcript);
                addChatMessage(response, 'bot');
                
                btn.innerHTML = '🎤';
                btn.style.background = '';
            },
            (error) => {
                console.error('Erreur reconnaissance:', error);
                btn.innerHTML = '🎤';
                btn.style.background = '';
            }
        );
    }
}

function addChatMessage(text, type) {
    const chatMessages = document.getElementById('aiChatMessages');
    const messageClass = type === 'user' ? 'user-message' : 'bot-message';
    
    chatMessages.innerHTML += `
        <div class="ai-message ${messageClass}">
            <div class="message-content">${text}</div>
        </div>
    `;
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Appeler dans votre fonction init()
window.addEventListener('DOMContentLoaded', () => {
    initAIVoice();
});
```

---

## 📖 API RÉFÉRENCE

### Classe `AIVoiceMultilingual`

#### Constructeur
```javascript
new AIVoiceMultilingual()
```
Crée une nouvelle instance de l'IA vocale.

#### Propriétés

| Propriété | Type | Description |
|-----------|------|-------------|
| `currentLanguage` | `string` | Langue actuelle (ex: 'fr', 'en') |
| `isRecording` | `boolean` | État de l'enregistrement vocal |
| `recognition` | `SpeechRecognition` | Instance Web Speech API |
| `synthesis` | `SpeechSynthesis` | Instance Speech Synthesis API |
| `languages` | `object` | Dictionnaire des langues supportées |
| `responses` | `object` | Réponses pré-définies par langue |

#### Méthodes

##### `setLanguage(lang)`
Change la langue de l'IA.

**Paramètres :**
- `lang` (string) : Code de langue ('fr', 'en', 'es', etc.)

**Retour :**
- `boolean` : `true` si succès, `false` si langue invalide

**Exemple :**
```javascript
aiVoice.setLanguage('en'); // Passer en anglais
```

##### `startListening(onResult, onError)`
Démarre l'écoute vocale.

**Paramètres :**
- `onResult` (function) : Callback avec la transcription
- `onError` (function) : Callback en cas d'erreur

**Exemple :**
```javascript
aiVoice.startListening(
    (transcript) => console.log('Transcription:', transcript),
    (error) => console.error('Erreur:', error)
);
```

##### `stopListening()`
Arrête l'écoute vocale.

**Exemple :**
```javascript
aiVoice.stopListening();
```

##### `speak(text, onEnd)`
Fait parler l'IA.

**Paramètres :**
- `text` (string) : Texte à prononcer
- `onEnd` (function) : Callback à la fin de la synthèse

**Exemple :**
```javascript
aiVoice.speak('Bonjour !', () => {
    console.log('Synthèse terminée');
});
```

##### `getResponse(message)`
Obtient une réponse contextuelle.

**Paramètres :**
- `message` (string) : Message de l'utilisateur

**Retour :**
- `string` : Réponse de l'IA

**Exemple :**
```javascript
const response = aiVoice.getResponse('billets');
console.log(response); // "🎫 Super ! Je peux t'aider à réserver des billets..."
```

##### `processVoiceMessage(message, onResponse)`
Traite un message vocal complet (réponse + synthèse vocale).

**Paramètres :**
- `message` (string) : Message de l'utilisateur
- `onResponse` (function) : Callback avec la réponse

**Retour :**
- `string` : Réponse de l'IA

**Exemple :**
```javascript
const response = aiVoice.processVoiceMessage('boutique', (resp) => {
    console.log('Réponse parlée:', resp);
});
```

---

## 💡 EXEMPLES DE CODE

### Exemple 1 : Chat vocal simple
```javascript
const aiVoice = new AIVoiceMultilingual();

// Écouter et répondre
aiVoice.startListening(
    (transcript) => {
        console.log('Utilisateur:', transcript);
        const response = aiVoice.getResponse(transcript);
        console.log('IA:', response);
        aiVoice.speak(response);
    }
);
```

### Exemple 2 : Changement de langue dynamique
```javascript
const aiVoice = new AIVoiceMultilingual();

// Interface de sélection de langue
document.getElementById('langFR').onclick = () => aiVoice.setLanguage('fr');
document.getElementById('langEN').onclick = () => aiVoice.setLanguage('en');
document.getElementById('langES').onclick = () => aiVoice.setLanguage('es');
```

### Exemple 3 : Chat multilingue complet
```javascript
const aiVoice = new AIVoiceMultilingual();
let chatHistory = [];

function sendMessage(text) {
    // Ajouter message utilisateur
    chatHistory.push({ role: 'user', text });
    
    // Obtenir réponse
    const response = aiVoice.getResponse(text);
    chatHistory.push({ role: 'bot', text: response });
    
    // Parler
    aiVoice.speak(response);
    
    // Afficher
    displayChat();
}

function displayChat() {
    const container = document.getElementById('chat');
    container.innerHTML = chatHistory.map(msg => `
        <div class="${msg.role}-message">${msg.text}</div>
    `).join('');
}
```

---

## 🐛 DÉPANNAGE

### Problème 1 : La reconnaissance vocale ne fonctionne pas

**Causes possibles :**
- ❌ Navigateur non supporté (Firefox limité)
- ❌ Site non HTTPS (Web Speech API requiert HTTPS)
- ❌ Microphone non autorisé

**Solutions :**
```javascript
// Vérifier le support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    console.log('✅ Reconnaissance vocale supportée');
} else {
    console.error('❌ Reconnaissance vocale non supportée');
}
```

### Problème 2 : La synthèse vocale ne parle pas

**Causes possibles :**
- ❌ Voix non disponible pour la langue choisie
- ❌ Volume du système en sourdine

**Solutions :**
```javascript
// Lister les voix disponibles
speechSynthesis.getVoices().forEach(voice => {
    console.log(voice.name, voice.lang);
});
```

### Problème 3 : L'IA ne répond pas correctement

**Causes possibles :**
- ❌ Mots-clés non détectés
- ❌ Langue incorrecte

**Solutions :**
```javascript
// Ajouter des mots-clés personnalisés
aiVoice.responses.fr.custom = "Votre réponse personnalisée";
```

---

## 📞 SUPPORT

**Questions ou problèmes ?**
1. Consultez `README.md` pour la documentation générale
2. Vérifiez `GUIDE_DEMARRAGE_RAPIDE.md` pour les tutoriels
3. Inspectez la console (F12) pour les erreurs JavaScript

---

## 🚀 ÉVOLUTIONS FUTURES

### Version 2.0 (planifiée)
- [ ] Support de 20 langues
- [ ] Intégration GPT-4 pour réponses avancées
- [ ] Reconnaissance d'intentions avec IA
- [ ] Support de commandes vocales ("Achète un billet VIP")
- [ ] Historique de conversation persistant

---

**Documentation mise à jour :** 11 Décembre 2025  
**Version IA Vocale :** 1.0  
**Auteur :** PaieCashFan Team
