# 🪪 PaieCashFan — Fiche technique (carte d'identité de l'application)

> Document vivant : **mis à jour à chaque commit** (section « Journal des évolutions »).
> Dernière mise à jour : 2026-07-10.

## 1. C'est quoi ?
**PaieCashFan** est une plateforme web pour les **fans de football** (et clubs / fédérations) :
boutiques officielles, **billetterie** (billets & abonnements), **tombola/loto**, **fan club**
(communauté + live match), co-streaming, cartes prépayées/eSIM, le tout avec une monnaie
interne **PCC (PaieCashCoin)**. Les clubs et fédérations disposent d'espaces dédiés, et un
back-office super-admin pilote l'ensemble.

## 2. Stack technique
| Couche | Techno |
|--------|--------|
| Frontend | **React 18 + Vite** (SPA), TailwindCSS, Framer Motion, React Router v6, lucide-react |
| Backend | **Node.js / Express** (CommonJS) |
| Base de données | **Supabase** (PostgreSQL) — projet `npmenstkeahngrzemmna` |
| Auth | Supabase Auth (email/mot de passe + Google OAuth) |
| Stockage fichiers | Supabase Storage — bucket public `club-assets`, bucket **privé** `club-documents` |
| Monnaie PCC | Wallet interne + **Circle** (mint on-chain) |
| Hébergement | **Front → Vercel**, **Back → Railway** (déploient la branche `main`) |
| Design | Skill UI/UX Pro Max + composants 21st.dev |

## 3. Architecture
```
paiecashfan-app/   ← Frontend React (Vite)   → Vercel
  src/pages         pages (Home, ClubDetail, FederationDetail, Boutique, Billetterie,
                    ClubBilletterie, Tombola, FanClub, Login, ResetPassword,
                    MonClub, MonClubBO, Transaction, admin/*)
  src/components     UI + SideDock, Navbar, Footer, ScrollToTop, IdleLogout, fanclub/*, club/*
  src/hooks          useClubDetail, useFederationDetail, useCart, useTicketingCart,
                     useOnboarding, useImageUpload, useApi
  src/context        AuthContext (session + profil + rôle)
  src/data           données statiques/mock (leagues, clubProfiles, countries, clubMocks…)

backend/           ← API Express                → Railway
  routes/v2/marketplace   clubs, federations, products, orders, search
  routes/v2/admin         clubs-crud, governance, users, applications
  routes/v2/onboarding    candidature club (documents)
  routes/v2/mint          wallet, transfer, topup, withdraw, treasury (PCC / Circle)
  middleware/auth         requireAuth (token Supabase → rôle + club_id) + requireRole
  services                apiFootball, footmercato, mailer, treasury-service, shared-db
  scripts                 hydrate-static (seed base depuis le front)
```

## 4. Rôles & accès
- **fan** : navigation, achats, fan club.
- **club_admin** : accès à **`/mon-club/bo`** (BO restreint à SON club — infos, joueurs,
  palmarès, boutique, billetterie). Obtenu après validation d'une candidature.
- **super_admin** : back-office complet **`/admin`** (utilisateurs, candidatures, fédérations,
  clubs, produits, paramètres).

Sécurité serveur : toutes les routes `clubs-crud`/`admin` exigent une session ; le super_admin
a tout, le club_admin est **scopé à son `club_id`**.

## 5. Modèle de données (principales tables Supabase)
- **profiles** : `role`, `role_request`, `club_id`, display_name…
- **tenants** : clubs & hubs de fédération (`type`, `status`, `league_name`, `federation_id`,
  `is_federation_hub`, `metadata.ticketing`, `metadata.api_football_id`…).
- **federations** : fédérations nationales (`metadata.acronym` pour la recherche).
- **players**, **trophies** : effectif & palmarès par club.
- **products** : boutique (prix PCC/EUR, images, statut).
- **orders** / **order_items** : commandes (panier `status='cart'`, `total_pcc`, `transaction_id`).
- **club_applications** : candidatures représentant de club (documents, statut, revue).

## 6. Flux clés
- **Inscription club → validation → BO** : signup (fan/représentant) → `/mon-club` (wizard :
  club + documents) → super_admin valide (Candidatures) → `club_admin` + accès `/mon-club/bo`.
- **Fédérations** : hub dynamique en base + repli statique ; import des clubs via API-Football.
- **Ligue 1 dynamique** : sync API-Football (montées/descentes) → cards d'accueil.
- **Billetterie** : offres éditables en BO (`metadata.ticketing`, prix **PCC + EUR**),
  panier localStorage, **checkout PCC branché** (délégué à PaieCashCoin, voir §7) :
  prix recalculés serveur, paiement `pcc_full`, création de commande + confirmation.

## 7. Intégrations externes
- **API-Football** (v3, clé `apisports`) : import clubs, effectifs, championnats.
- **Foot Mercato** (scraping) : import palmarès.
- **PaieCashCoin** (app séparée, Supabase distinct) : **source du wallet PCC**. Wallet
  Crossmint + ledger off-chain `pcc_wallet_transactions` (balance = somme, 1 EUR = 1 PCC).
  Expose une **API v1** (`Authorization: Bearer pcc_live_…` + scopes) sur
  `https://www.paiecashcoin.com/api/v1` : `GET /users/resolve?email=`,
  `POST /pay/quote`, `POST /pay/execute` (modes `pcc_full|pcc_split|card_full|bnpl`).
  Le checkout PaieCashFan délègue le paiement ici — **client** :
  `backend/services/paiecashcoin.js`, **endpoint** : `POST /api/v2/checkout/ticketing`.
  Lien entre les 2 apps par **email** (bonus +5% à la vérification). Repo :
  `C:\Users\valer\OneDrive\Bureau\PAIECASHCOIN\paiecashcoins`.
  ⚠️ **Limites actuelles (côté PaieCashCoin, à finir)** : `pay/execute` ne renvoie
  pas d'URL Stripe → seul `pcc_full` aboutit (MVP PCC-only) ; `merchantRef` est
  seulement stocké → le **club n'est pas encore crédité** (chantier séparé).
- **Stripe** : recharge wallet (côté PaieCashCoin) + prévu en direct pour les clubs hors
  PaieCashCoin (Stripe Connect, à venir).
- **Resend** (à activer en prod) : emails transactionnels (notifications, reset password).
- ~~Circle~~ : ancien wallet on-chain, **remplacé par Crossmint/PaieCashCoin** (code local legacy).

## 8. Déploiement
- Branche déployée : **`main`** (Vercel front + Railway back, auto-deploy).
- Branches de travail : `feature/integration-marketplace` (principale), branches stagiaires
  mergées après revue.

## 9. TODO
Voir **`TODO.md`** (sécurité pré-vérif documents, infra email prod, checkout PCC,
persistance DB panier billetterie, page Fan Club à brancher au back…).

## 10. Journal des évolutions
> Le plus récent en haut. Mis à jour à chaque commit.

- **2026-07-11 (o)** — Fix « Club introuvable » au checkout (mismatch de slug
  registry statique vs base). **A** : hub **billetterie piloté par la base**
  (`/marketplace/clubs?league=` → vrais slugs). **B** : résolveur tolérant
  `getTenantBySlugFlexible` (retrait préfixe/suffixe : `ogc-nice`→`nice`,
  `rc-lens`→`lens`…) utilisé par le checkout ET le fan feed.
- **2026-07-11 (n)** — Page club : **fin des données mock du hub fan**. Wallet
  **confidentiel** (masqué si non connecté, sinon solde réel via `/me/pcc`, et
  seulement si solde > 0). « Fans en ligne » → **supporters réels** du fan feed
  (masqué si vide). Section « Transactions temps réel » (mock) **retirée**.
- **2026-07-11 (m)** — Fan Club : **feed consultable sans connexion** (GET public
  via `optionalAuth`, écritures `requireAuth`) + CTA « Se connecter » propre pour
  les visiteurs (fini l'erreur 404/401 au chargement quand déconnecté). **Section
  « Communauté »** (`ClubCommunitySection`) intégrée directement dans la page de
  chaque club (fil des supporters persisté par club).
- **2026-07-11 (l)** — **Fan Club dynamique par club** : nouvelle route
  `/clubs/:slug/fan-club` (FanClub lit le `slug` → vrai club via `useClubDetail`),
  action **« Fan Club »** ajoutée au SideDock de chaque club. `/fan-club` (navbar)
  garde PSG par défaut. Feed persisté par club (`tenant_id`).
- **2026-07-11 (k)** — **Fan Club branché au backend** (mode « club » persisté).
  Tables `fan_posts` / `fan_comments` / `fan_post_likes` / `fan_messages`
  (migration `backend/migrations/fan-club.sql` à exécuter dans Supabase — pas de
  `DATABASE_URL` côté serveur). API `/api/v2/clubs/:slug/fan-feed` (`requireAuth`)
  : GET feed + POST posts/commentaires/like(toggle)/messages. Hook `useFanFeed`
  rebranché (optimiste + réconciliation, même forme de sortie → composants
  inchangés). Mode « friends » reste local (pas de système d'amis).
- **2026-07-11 (j)** — Intégration branches stagiaire (revue + merge) :
  **boutique club en PCC + EUR** (helper `formatEuro`, prix double sur cards/
  modale/panier ; corrige un bug latent PCC/EUR) et **passe responsive mobile**
  (MonClub, MonClubBO, Transaction, AdminApplications, FanClub, LiveMatchBanner).
  Conflit `LiveMatchBanner` résolu = layout responsive **+** données du hook
  `useFanFeed` (prop `match`, avec repli).
- **2026-07-11 (i)** — Intégration branches stagiaire (revue + merge) :
  **états vides/chargement du BO harmonisés** (skeletons + empty states
  AdminProducts / AdminClubEdit / MonClubBO) et **hook `useFanFeed`** (Fan Club :
  mocks centralisés + loading/error/empty, prêt pour le branchement backend).
- **2026-07-11 (h)** — Pages fédérations : divisions triées par **ordre
  hiérarchique** (D1 → D2 → D3, ex. Ligue 1 → Ligue 2 → National) au lieu du
  nombre de clubs.
- **2026-07-11 (g)** — Fédérations **Italie & Portugal créées** (table
  `federations`) + Serie A / Primeira Liga rattachées ; **Premier League
  ré-importée** correctement (bug : `federation_id` doit pointer sur
  `federations.id`, pas l'id du tenant hub — l'insert échouait en silence).
  `sync-league.js` corrigé (`--federationSlug` via table `federations` +
  contrôle des erreurs d'insert). « Voir tout » actif pour IT/PT.
- **2026-07-11 (f)** — **Accueil piloté par la base + divisions**. Tagging des
  divisions via `sync-league.js` (Ligue 1/2/National, Bundesliga, La Liga,
  Eredivisie — saison 2026). Onglets **« Football France »** (L1+L2+National) et
  **« Football Européen »** désormais **live** (fini le mock), une section par
  division non vide. **« Voir tout »** → page fédération du pays. Pages
  **fédérations regroupées par division** (`league_name` ajouté au endpoint
  membres). **Premier League / Serie A / Primeira Liga importées** (top
  championnats européens complets ; Angleterre rattachée à sa fédération).
  `sync-league.js` enrichi : pays par **nom** (`--country=England`) +
  `--federationSlug` (rattachement des clubs ajoutés au hub).
- **2026-07-11 (e)** — Admin : la confirmation « Sync Ligue 1 » utilise une
  **modale stylée** (plus le `confirm()` natif moche).
- **2026-07-11 (d)** — Outil **`backend/scripts/sync-league.js`** : sync d'une
  ligue depuis API-Football (généralise `/sync-ligue1`), **dry-run par défaut**,
  saison configurable (`--season`), non destructif (match `api_football_id`,
  préserve les données saisies), rétrogradation optionnelle. Prérequis : clé
  API-Football payante (`API_FOOTBALL_KEY` sur Railway + local). La saison est
  auto-détectée (plus récente) — plan payant → saison courante (2026 = 18 clubs L1).
- **2026-07-11 (c)** — UX : la fenêtre « Ajouter au panier » se **ferme
  automatiquement** après ajout. Nouvelle page **`/parametres`** (menu compte →
  Paramètres) : **upload photo de profil** (avatar → Supabase Storage via
  `/clubs-crud/upload`, `updateProfile({avatar_url})`), édition nom, email, lien
  mot de passe. Avatar reflété dans la **navbar** (desktop + mobile).
- **2026-07-11 (b)** — **Checkout multi-rails** (carte / mixte / BNPL). Le panier
  billetterie propose 4 modes (PCC / Carte / PCC+carte / 3×-4×). `pcc_full` inchangé
  (débit immédiat). Modes carte → PaieCashCoin renvoie une **Stripe Checkout URL** :
  on crée une commande `pending`, on redirige, puis les pages **`/checkout/success`
  & `/checkout/cancel`** réconcilient le statut (`GET /checkout/status` via
  `/pay/history`, `POST /checkout/cancel`). Endpoint `execute` enrichi
  (successUrl/cancelUrl/origin/idempotencyKey). Débit carte confirmé par le webhook
  Stripe côté PaieCashCoin (zéro PCC perdu si abandon).
- **2026-07-11** — **BO fan enrichi** : **billet numérique QR** imprimable en PDF
  (via `qrcode.react` + impression navigateur, thème clair), onglet **Historique
  PCC** (`GET /me/pcc-history` → PaieCashCoin `/pay/history`). **Solde wallet =
  disponible réel** : PaieCashCoin a corrigé `currentPccBalance` (= total − épargne
  bloquée) ; on lit ce champ (via `/pay/quote`), affichage clarifié « hors épargne
  bloquée ». Impacte aussi le checkout (bloque si le disponible < total).
- **2026-07-10 (e)** — Checkout : envoi de `merchantName` (nom du club) à
  PaieCashCoin — affiché côté payeur (Stripe Checkout, emails, dashboard, metadata),
  corrige le « undefined » de nom de marchand.
- **2026-07-10 (d)** — **BO fan (`/mon-compte`)** : dashboard fan avec profil
  (édition nom + lien reset mdp), card **wallet PCC** (solde live via PaieCashCoin
  + CTA recharge/création), et **Mes billets & commandes** (statut, club, articles,
  total, réf). Backend `routes/v2/me.js` (`requireAuth`) : `GET /me/orders`
  (commandes du fan enrichies) + `GET /me/pcc` (solde sans effet de bord).
  Backfill de la commande OM orpheline (réf PCC-1783682961460-68F8A4FA).
- **2026-07-10 (c)** — Fix : colonne club = `tenants.name` (pas `club_name`) →
  la description envoyée à PaieCashCoin était « Billetterie **undefined** », et
  les offres par défaut « Billet match undefined ». Corrigé dans `checkout.js`
  (description + résultats) et `ticketingPricing.js` (noms d'offres par défaut).
- **2026-07-10 (b)** — **Fix commande billetterie + vue Commandes admin**.
  Bug : `orders.transaction_id` est un **uuid** et `status='paid'` viole
  `orders_status_check` → la commande n'était jamais écrite (le fan payait sans
  commande, cards admin Transactions/Volume PCC à 0). Fix checkout : `transaction_id=null`
  (réf PCC dans `metadata.notes`), statut **`completed`**. Nouveau
  `GET /api/v2/admin/orders` (filtre statut + pagination, noms club/acheteur) +
  page **AdminOrders** + entrée menu « Commandes ». Card **Treasury** legacy
  (Circle, zéros) masquée tant qu'aucune donnée réelle.
- **2026-07-10 (a)** — **Checkout PCC de la billetterie branché** (MVP PCC-only).
  Backend : client `services/paiecashcoin.js` (resolve/quote/execute, Bearer, sans
  retry sur execute), `services/ticketingPricing.js` (prix recalculés serveur),
  endpoint `POST /api/v2/checkout/ticketing` (`requireAuth`, regroupe par club,
  quote → si solde PCC < total renvoie `402 needTopUp`, sinon `execute` en
  `pcc_full` + crée la commande `status='paid'`, `merchantRef=paiecashfan:<slug>`).
  Front : bouton « Payer Maintenant » branché (états chargement/succès/recharge/
  non-connecté), écran de confirmation, vidage du panier ; `clubSlug` injecté dans
  les items. Env : `PAIECASHCOIN_API_URL/KEY` (backend), `VITE_PAIECASHCOIN_URL`.
- **2026-07-08 (b)** — Billetterie : ajout du **prix EUR** aux offres (BO + affichage
  public PCC · €), en vue du checkout multi-rails. Exploration de **PaieCashCoin** :
  wallet Crossmint + API v1 `pay/execute` → le checkout sera délégué à PaieCashCoin
  (rail PCC), + Stripe direct pour les clubs hors PaieCashCoin.
- **2026-07-08 (a)** — Merge branche stagiaire : déconnexion auto (IdleLogout), page Fan Club
  redesignée + interaction par club (front/mock), page Transactions club. Création de cette
  fiche technique. Démarrage du **checkout PCC** de la billetterie.
- **2026-07-03/07** — Inscription club complète (Phases 1→4) : onboarding `/mon-club`,
  candidatures super_admin, BO club scopé, sécurisation serveur. Édition comptes (email/mdp)
  + page reset password. Hydratation base depuis le statique (Paris FC).
- **2026-06/07** — Billetterie : prix éditables en BO + panier persistant. Ligue 1 dynamique
  (sync API-Football) + dé-doublonnage clubs FR. Recherche d'accueil branchée base.
  Hero club cinématique + SideDock. Dashboard BO dynamique + nav mobile. Suppression partout.
- **2026-06** — Fédérations dynamiques (hub, import clubs, BO dédié). Boutique multi-photos,
  panier persisté. Édition club (onglets), import API-Football / Foot Mercato.
