# 🚀 GUIDE DE DÉPLOIEMENT - PLAN B (CLOUDFLARE)

## Option Rapide : Cloudflare Pages + Tencent TRTC

### Avantages
- ✅ Déjà configuré (paiecashfan.pages.dev)
- ✅ Fonctionne immédiatement
- ✅ Juste 2 secrets à ajouter
- ✅ 5 minutes top chrono

### Étapes

#### 1. Configurer les secrets TRTC sur Cloudflare

```bash
# Dans votre terminal local (pas le sandbox)
npx wrangler pages secret put TRTC_SDK_APP_ID --project-name paiecashfan
# Quand demandé, entrez: 20033758

npx wrangler pages secret put TRTC_SECRET_KEY --project-name paiecashfan
# Quand demandé, entrez: 2865fa36abca00e0cbd108001236ba2ba10b0e4f2bfb81c4bf43b5a43e22a3ad
```

#### 2. Déployer

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name paiecashfan
```

#### 3. Tester

```
https://paiecashfan.pages.dev/index.html
https://paiecashfan.paiecashplay.com/index.html (si DNS configuré)
```

Cliquez "Live Stream" → Devrait fonctionner !

---

## ⏰ TEMPS ESTIMÉ PAR OPTION

| Option | Temps | Difficulté | Résultat |
|--------|-------|------------|----------|
| Cloudflare (Plan B) | 5 min | ⭐ Facile | ✅ Fonctionne |
| Tencent Cloud (Plan A) | 1-2h | ⭐⭐⭐ Moyen | ✅ Optimal |

