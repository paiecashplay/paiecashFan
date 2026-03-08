const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// CORS pour permettre les appels API cross-origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Injecter le port API dans le HTML (AVANT static middleware)
app.get('/app-universal-simple', (req, res) => {
  const fs = require('fs');
  let html = fs.readFileSync(path.join(__dirname, 'public/app-universal-simple.html'), 'utf8');
  // Remplacer les appels API pour pointer vers le port 3001
  html = html.replace(/fetch\('\/api\//g, "fetch('http://localhost:3001/api/");
  html = html.replace(/fetch\("\/api\//g, 'fetch("http://localhost:3001/api/');
  res.send(html);
});

// Route avec .html (même traitement)
app.get('/app-universal-simple.html', (req, res) => {
  const fs = require('fs');
  let html = fs.readFileSync(path.join(__dirname, 'public/app-universal-simple.html'), 'utf8');
  // Remplacer les appels API pour pointer vers le port 3001
  html = html.replace(/fetch\('\/api\//g, "fetch('http://localhost:3001/api/");
  html = html.replace(/fetch\("\/api\//g, 'fetch("http://localhost:3001/api/');
  res.send(html);
});

// Servir les fichiers statiques (APRÈS les routes spécifiques)
// Exclure app-universal-simple.html du static middleware
app.use('/static', express.static(path.join(__dirname, 'public/static')));
app.use((req, res, next) => {
  if (req.path === '/app-universal-simple.html' || req.path === '/app-universal-simple') {
    return next('route'); // Skip static middleware for this file
  }
  next();
}, express.static(path.join(__dirname, 'public')));

// Route racine
app.get('/', (req, res) => {
  res.redirect('/app-universal-simple');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur web démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📄 HTML servi depuis ./public/`);
  console.log(`🔌 API disponible sur http://localhost:3001/api`);
  console.log(`\n🎯 Testez: http://localhost:${PORT}/app-universal-simple`);
});

