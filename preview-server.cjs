const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir les fichiers statiques depuis public/
app.use(express.static('public'));

// Servir les fichiers statiques depuis public/static/
app.use('/static', express.static('public/static'));

// Route pour les fichiers HTML (avec ou sans extension)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    
    // Si la requête a déjà .html, servir directement
    if (page.endsWith('.html')) {
        return res.sendFile(path.join(__dirname, 'public', page));
    }
    
    // Sinon, essayer avec .html
    const htmlPath = path.join(__dirname, 'public', `${page}.html`);
    res.sendFile(htmlPath, (err) => {
        if (err) {
            // Si le fichier n'existe pas, passer au middleware suivant
            next();
        }
    });
});

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 SERVEUR D'APERÇU DÉMARRÉ !                       ║
║                                                        ║
║   📍 Port: ${PORT}                                         ║
║   🌐 URL: http://0.0.0.0:${PORT}                           ║
║                                                        ║
║   ✅ Les 3 jeux sont disponibles :                    ║
║      - SCRATCH                                        ║
║      - LOTO CHIFFRES                                  ║
║      - TOMBOLA                                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
});
