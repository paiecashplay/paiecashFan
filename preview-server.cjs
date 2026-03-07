const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;
const API_PORT = 3001;

// Démarrer Wrangler en arrière-plan pour l'API
console.log(`🔧 Démarrage backend API sur port ${API_PORT}...`);
const wrangler = spawn('npx', [
    'wrangler', 'pages', 'dev', 'dist',
    '--local', '--ip', '127.0.0.1', '--port', API_PORT.toString()
], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
});

wrangler.stdout.on('data', (data) => {
    if (data.toString().includes('Ready on')) {
        console.log('✅ Backend API prêt');
    }
});

wrangler.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ERROR') && !msg.includes('D1_ERROR')) {
        console.error('❌ Erreur backend:', msg);
    }
});

// Proxy pour les routes API
app.use('/api', async (req, res) => {
    try {
        const url = `http://127.0.0.1:${API_PORT}/api${req.url}`;
        const response = await fetch(url, {
            method: req.method,
            headers: req.headers,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        const data = await response.text();
        res.status(response.status).send(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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
║   🚀 SERVEUR DÉMARRÉ !                                ║
║                                                        ║
║   📍 Port Web: ${PORT}                                     ║
║   📍 Port API: ${API_PORT}                                     ║
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

// Cleanup au shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    wrangler.kill();
    process.exit(0);
});
