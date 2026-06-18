# Intégration PaieCashFan ⇄ pcc-marketplace ⇄ backend

Document de pilotage pour la fusion du repo `paiecashfan` (Hono + Cloudflare
Pages + D1) avec le nouveau code poussé par l'équipe Frostrek :
- `pcc-marketplace/` — SPA React 18 + Vite 5 + Framer Motion + GSAP (frontend marketplace + gaming)
- `backend/` — serveur Express + Postgres (Supabase) + Socket.io (API REST + temps réel)

Branche de travail : **`feature/integration-marketplace`** (issue de `main`).

---

## 🎯 Architecture cible (validée)

**Deux runtimes en parallèle**, reliés par CORS + DNS :

```
                        ┌──────────────────────────────────────────────┐
                        │ paiecashfan.com (Cloudflare Pages)            │
                        ├──────────────────────────────────────────────┤
                        │ /                          → static HTML legacy│
                        │ /boutique.html, /tombola... → 48 pages héritées│
                        │ /api/internal/*            → Worker Hono (S2S) │
                        │ /api/lyra, /api/stream...  → Worker Hono       │
                        │ /api/costreaming, /ws/*    → Worker Hono       │
                        │ /marketplace/*             → SPA React (Sprint 1)│
                        └──────────────────────────────────────────────┘
                                            │  CORS + fetch
                                            ▼
                        ┌──────────────────────────────────────────────┐
                        │ api.paiecashfan.com (Render / Fly.io)         │
                        ├──────────────────────────────────────────────┤
                        │ Express backend (148 fichiers)                │
                        │ /api/v2/mint/{auth,wallet,topup,...}          │
                        │ /api/v2/marketplace/{clubs,products,orders}   │
                        │ /api/v2/gaming/{contests,sessions}            │
                        │ /api/v2/betting/pools                         │
                        │ /api/loto, /api/chat, /api/posts...           │
                        │ Socket.io (loto multi-joueurs)                │
                        └─────────────────────┬────────────────────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │ Supabase PostgreSQL       │
                                │ (source de vérité unique) │
                                └──────────────────────────┘
```

---

## 🗺️ Plan en 6 sprints

| # | Sprint | Statut | Durée |
|---|---|---|---|
| 0 | Vérifier que `backend` et `pcc-marketplace` tournent en local | 🟡 en cours | 1-2 j |
| 1 | Intégrer le build `pcc-marketplace` sur `/marketplace/*` du Cloudflare Pages | ⚪ pending | 2-3 j |
| 2 | Déployer le backend sur Render → `api.paiecashfan.com` | ⚪ pending | 1-2 j |
| 3 | Connecter marketplace prod ↔ backend prod (VITE_API_URL + CORS) | ⚪ pending | 1 j |
| 4 | Porter le design system du marketplace dans les pages legacy | ⚪ pending | 1-2 sem |
| 5 | Unifier l'auth (Hono custom JWT + backend JWT → 1 seul système) | ⚪ pending | 1 sem |
| 6 | Décommissionner les doublons Hono ↔ Express (loto, shop, posts…) | ⚪ pending | 3-5 j |

---

## 🚀 Sprint 0 — Faire tourner les deux services en local

### 1. Backend Express (port 3001)

```powershell
cd backend
npm install
```

Crée `backend/.env` à partir de `backend/.env.example`. Au minimum :

```
PORT=3001
JWT_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
FRONTEND_URL=http://localhost:5174
```

> 💡 Tu as déjà `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` du chantier précédent
> (cf. `.dev.vars` à la racine).

Lance :

```powershell
npm run dev
# ou: node server.js
```

Attendu : `Server listening on port 3001`. Test rapide :

```powershell
curl http://localhost:3001/api/health
# {"success":true, "data":{"status":"ok",...}}
```

### 2. Marketplace React (port 5174)

```powershell
cd pcc-marketplace
npm install
```

Crée `pcc-marketplace/.env` à partir de `pcc-marketplace/.env.example` :

```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key Supabase>
VITE_MINT_URL=
```

> 💡 `VITE_SUPABASE_ANON_KEY` est différente de la `service_role` — c'est la
> clé publique côté client. À récupérer dans Supabase Dashboard → API → anon public.

Lance :

```powershell
npm run dev
```

Ouvre http://localhost:5174 → tu dois voir la home page futuriste (avec le
preloader GSAP, hero "Football / Web3 / On-Chain / Gaming", cartes flottantes).

### 3. Tester un flow end-to-end

- Aller sur `/login` ou `/register` sur le marketplace
- Créer un compte → ça doit hit `POST http://localhost:3001/api/v2/mint/auth/register`
- Le backend doit créer un user dans Supabase Postgres (table `users`)
- Le JWT renvoyé est stocké dans `localStorage.pcc_user`

⚠️ Si le backend crashe à la création de wallet Circle (`CIRCLE_API_KEY` non
configurée), c'est attendu pour l'instant. Demande à l'équipe Frostrek les
clés de dev ou stubbe la création de wallet temporairement.

### 4. Critères de validation du Sprint 0

- [ ] `npm install` passe sans erreur sur `backend/`
- [ ] `npm install` passe sans erreur sur `pcc-marketplace/`
- [ ] Le backend démarre sur :3001 et `/api/health` répond
- [ ] Le marketplace démarre sur :5174 et la home s'affiche
- [ ] Au moins un endpoint hit le backend (vérifié via DevTools → Network)

Quand ces 5 cases sont OK : on passe au Sprint 1.

---

## 📌 Décisions actées dans ce repo

- **Source de vérité users + abonnements** : Supabase PostgreSQL (table `users`
  + dérivés gérée par le backend Express)
- **Auth canonique (à terme)** : JWT du backend Express (lié aux wallets
  Circle créés à l'inscription). À unifier au Sprint 5.
- **Design system de référence** : celui de `pcc-marketplace` (Inter + Outfit,
  palette Web3 teal + amber, GSAP transitions, glassmorphism).
- **Branche `feature/refonte-design-v2`** : archivée. Le scaffold React/Vite
  fait avant (`client/`) est dépassé par pcc-marketplace et ne sera pas
  réutilisé tel quel — sauf si on en extrait quelques tokens design.

---

## 🔗 Stack reference

| Côté | Stack | Hébergement |
|---|---|---|
| Frontend marketplace | React 18, Vite 5, React Router v6, Framer Motion 12, GSAP, Three.js, lucide, Supabase JS, Socket.io-client | Cloudflare Pages (`/marketplace/*`) |
| Backend marketplace | Node 18+, Express 4, Postgres (Supabase), Socket.io, Circle SDK, ethers v6, Stripe, MoonPay, Transak, JWT, bcryptjs | Render / Fly.io (à déployer Sprint 2) |
| Frontend paiecashfan legacy | HTML statique + Vanilla JS + Tailwind CDN | Cloudflare Pages (`/*`) |
| Worker paiecashfan | Hono 4, JSX SSR | Cloudflare Workers (paths `/api/*`, `/ws/*`) |
| DB legacy paiecashfan | Cloudflare D1 (SQLite) | Cloudflare D1 (à migrer vers Supabase Sprint 5-6) |
