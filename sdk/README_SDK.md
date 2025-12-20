# 🔌 SDK PaieCashFan - Widget Embeddable pour Clubs

## 📋 Vue d'ensemble

Le **SDK PaieCashFan** permet aux clubs de sport d'intégrer facilement PaieCashFan sur leur site web officiel.

**Ce que ça fait :**
- ✅ Widget de connexion/inscription
- ✅ Accès direct à la boutique du club
- ✅ Wallet crypto intégré
- ✅ Réseau social des fans
- ✅ Billetterie
- ✅ Design personnalisable (light/dark theme)

---

## 🚀 Installation (2 minutes)

### Méthode 1 : Script + Div (Le plus simple)

**Sur le site web du club, ajoutez :**

```html
<!-- 1. Charger le SDK (avant </body>) -->
<script src="https://paiecashfan.com/sdk/paiecashfan-widget.js"></script>

<!-- 2. Ajouter le widget où vous voulez -->
<div id="paiecashfan-widget" 
     data-club="marseille"
     data-theme="light">
</div>
```

**C'est tout ! Le widget apparaît automatiquement.**

---

### Méthode 2 : Installation via NPM (Pour développeurs)

```bash
npm install @paiecashfan/widget
```

```javascript
import PaieCashFanWidget from '@paiecashfan/widget';

const widget = new PaieCashFanWidget(document.getElementById('container'), {
    club: 'marseille',
    theme: 'light'
});
```

---

## 🎨 Configuration

### Options disponibles

```html
<div id="paiecashfan-widget" 
     data-club="marseille"           <!-- ID du club (requis) -->
     data-theme="light"               <!-- light | dark -->
     data-mode="compact"              <!-- compact | full -->
     data-show-shop="true"            <!-- Afficher boutique -->
     data-show-wallet="true"          <!-- Afficher wallet -->
     data-show-social="true">         <!-- Afficher réseau social -->
</div>
```

---

## 📝 Exemples d'Intégration

### Exemple 1 : Olympique de Marseille

**Sur olympiquedemarseille.com :**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Olympique de Marseille - Officiel</title>
</head>
<body>
    <header>
        <h1>Olympique de Marseille</h1>
        <nav>
            <!-- Menu du club -->
        </nav>
    </header>

    <main>
        <!-- Contenu du site -->
        
        <!-- Widget PaieCashFan -->
        <aside style="position: fixed; right: 20px; top: 100px;">
            <div id="paiecashfan-widget" 
                 data-club="marseille"
                 data-theme="light">
            </div>
        </aside>
    </main>

    <!-- Charger SDK avant </body> -->
    <script src="https://paiecashfan.com/sdk/paiecashfan-widget.js"></script>
</body>
</html>
```

**Résultat :**
- Widget flottant à droite de la page
- Fans peuvent se connecter depuis le site officiel
- Accès direct à la boutique OM
- Wallet crypto pour achats

---

### Exemple 2 : Paris Saint-Germain

**Sur psg.fr :**

```html
<div style="max-width: 400px; margin: 50px auto;">
    <h2>Espace Fan PSG</h2>
    
    <div id="paiecashfan-widget" 
         data-club="psg"
         data-theme="dark"
         data-mode="full">
    </div>
</div>

<script src="https://paiecashfan.com/sdk/paiecashfan-widget.js"></script>
```

---

### Exemple 3 : Mode Responsive (Mobile-friendly)

```html
<style>
    .widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
    }

    @media (max-width: 768px) {
        .widget-container {
            bottom: 10px;
            right: 10px;
            left: 10px;
        }
    }
</style>

<div class="widget-container">
    <div id="paiecashfan-widget" 
         data-club="lyon"
         data-theme="light">
    </div>
</div>

<script src="https://paiecashfan.com/sdk/paiecashfan-widget.js"></script>
```

---

## 🎯 Événements JavaScript (Avancé)

Le widget émet des événements que vous pouvez écouter :

```javascript
// Écouter connexion utilisateur
window.addEventListener('paiecashfan:login', (event) => {
    console.log('User logged in:', event.detail.user);
    console.log('Club:', event.detail.club);
    
    // Faire quelque chose (ex: afficher message de bienvenue)
    alert(`Bienvenue ${event.detail.user.name} !`);
});

// Écouter déconnexion
window.addEventListener('paiecashfan:logout', (event) => {
    console.log('User logged out');
});

// Écouter actions (shop, wallet, etc.)
window.addEventListener('paiecashfan:action', (event) => {
    console.log('Action:', event.detail.action);
    console.log('Club:', event.detail.club);
    
    // Suivre avec Google Analytics
    gtag('event', 'paiecashfan_action', {
        action: event.detail.action,
        club: event.detail.club
    });
});
```

---

## 🔧 API JavaScript (Contrôle Programmatique)

Si vous voulez contrôler le widget depuis votre code :

```javascript
// Récupérer l'instance du widget
const container = document.getElementById('paiecashfan-widget');
const widget = new PaieCashFanWidget(container, {
    club: 'marseille',
    theme: 'light'
});

// Vérifier si utilisateur est connecté
if (widget.isLoggedIn()) {
    console.log('User is logged in');
    const user = widget.getUser();
    console.log('User:', user);
}
```

---

## 🎨 Personnalisation Avancée (CSS)

Vous pouvez personnaliser l'apparence du widget :

```css
/* Changer couleur principale */
.pcf-widget-header {
    background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2) !important;
}

/* Changer couleur boutons */
.pcf-btn-primary {
    background: #YOUR_COLOR !important;
}

/* Changer taille du widget */
.pcf-widget {
    max-width: 500px !important;
}
```

---

## 📊 Tracking & Analytics

### Google Analytics

```javascript
window.addEventListener('paiecashfan:login', (event) => {
    gtag('event', 'login', {
        method: 'paiecashfan',
        club: event.detail.club
    });
});

window.addEventListener('paiecashfan:action', (event) => {
    gtag('event', 'paiecashfan_action', {
        event_category: 'engagement',
        event_label: event.detail.action,
        club: event.detail.club
    });
});
```

### Facebook Pixel

```javascript
window.addEventListener('paiecashfan:login', (event) => {
    fbq('track', 'CompleteRegistration', {
        content_name: 'PaieCashFan Login',
        club: event.detail.club
    });
});
```

---

## 🔐 Sécurité

### HTTPS Obligatoire

Le widget nécessite HTTPS pour fonctionner (pour la sécurité des paiements crypto).

### CORS

Le SDK est configuré pour accepter les requêtes depuis :
- ✅ Tous les domaines de clubs partenaires
- ✅ localhost (pour développement)

---

## 🌍 Multi-langue

Le widget détecte automatiquement la langue du site :

```html
<!-- Site en français -->
<html lang="fr">
<!-- Widget en français -->

<!-- Site en anglais -->
<html lang="en">
<!-- Widget en anglais -->
```

**Langues supportées :**
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português

---

## 📱 Iframe Alternative (Sans JavaScript)

Si vous ne pouvez pas utiliser JavaScript, utilisez un iframe :

```html
<iframe 
    src="https://paiecashfan.com/widget/embed?club=marseille&theme=light" 
    width="400" 
    height="600" 
    frameborder="0"
    style="border-radius: 12px;">
</iframe>
```

---

## 🐛 Dépannage

### Le widget n'apparaît pas

**Vérifiez :**
1. ✅ Script chargé avant `</body>`
2. ✅ `data-club` défini
3. ✅ Console JavaScript (F12) pour erreurs

### Problème de connexion

**Vérifiez :**
1. ✅ Site en HTTPS
2. ✅ Cookies autorisés
3. ✅ Pas de bloqueur de pub actif

---

## 💡 Cas d'Usage

### 1. Widget Flottant (Recommandé)

```html
<style>
    .pcf-floating-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
    }
</style>

<div class="pcf-floating-widget">
    <div id="paiecashfan-widget" data-club="marseille"></div>
</div>
```

**Avantages :**
- Toujours visible
- N'interfère pas avec contenu
- Facile d'accès

---

### 2. Widget dans Sidebar

```html
<aside class="sidebar">
    <h3>Espace Fan</h3>
    <div id="paiecashfan-widget" data-club="marseille"></div>
</aside>
```

**Avantages :**
- Intégration naturelle
- Contexte clair

---

### 3. Widget Page Dédiée

```html
<div class="container">
    <h1>Rejoignez la Communauté PaieCashFan</h1>
    
    <div style="max-width: 450px; margin: 50px auto;">
        <div id="paiecashfan-widget" 
             data-club="marseille"
             data-mode="full">
        </div>
    </div>
</div>
```

**Avantages :**
- Expérience complète
- Focus utilisateur

---

## 📞 Support

### Documentation
- 📖 Guide complet : https://paiecashfan.com/docs/sdk
- 🎥 Vidéos tutoriels : https://paiecashfan.com/tutorials

### Contact
- 📧 Email : sdk@paiecashfan.com
- 💬 Discord : https://discord.gg/paiecashfan
- 📞 Support 24/7 : +33 1 23 45 67 89

---

## 🚀 Prochaines Étapes

1. **Testez le widget** sur votre site en local
2. **Personnalisez** l'apparence selon votre charte
3. **Configurez** les événements analytics
4. **Déployez** en production
5. **Contactez-nous** pour devenir club partenaire officiel

---

## 📄 Licence

Le SDK PaieCashFan est gratuit pour tous les clubs partenaires.

**Inclus :**
- ✅ Widget illimité
- ✅ Support technique
- ✅ Mises à jour gratuites
- ✅ Analytics de base

**Version Pro (sur demande) :**
- ✅ Personnalisation avancée
- ✅ White-label
- ✅ Support prioritaire
- ✅ Analytics avancés

---

**© 2024 PaieCashFan - Tous droits réservés**

---

## ✅ Checklist d'Intégration

- [ ] SDK téléchargé et testé en local
- [ ] Widget affiché sur site de dev
- [ ] Connexion/inscription testée
- [ ] Actions (boutique, wallet) testées
- [ ] Responsive vérifié (mobile, tablet, desktop)
- [ ] Analytics configuré
- [ ] Site déployé en HTTPS
- [ ] Widget testé en production
- [ ] Support contacté pour validation
- [ ] Annonce aux fans ! 🎉

---

**FIN DE LA DOCUMENTATION SDK**

Pour toute question : sdk@paiecashfan.com
