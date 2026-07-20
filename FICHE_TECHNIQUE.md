# 🪪 PaieCashFan — Fiche technique (carte d'identité de l'application)

> Document vivant : **mis à jour à chaque commit** (section « Journal des évolutions »).
> Dernière mise à jour : 2026-07-20.

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

- ⏳ **Suivi du stock boutique (à faire une fois le site vraiment en prod)** : le
  checkout boutique **vérifie** la disponibilité à l'achat mais ne **décrémente pas**
  encore `products.total_sold` après paiement (pour la carte, la confirmation réelle
  passe par la réconciliation Stripe → décrémenter à la redirection compterait les
  paniers abandonnés). Prévoir : décrément fiable sur commande confirmée + gestion/
  affichage du stock **côté BO Super Admin** ET **côté BO Club** (édition du stock,
  alerte rupture, bascule `sold_out`). Aujourd'hui la majorité des produits sont en
  `stock: -1` (illimité), sans impact immédiat.

## 10. Journal des évolutions
> Le plus récent en haut. Mis à jour à chaque commit.

- **2026-07-20 (bg)** — **SEO & partage de lien** (mise en prod sur `paiecashfan.com`).
  `index.html` : Open Graph + Twitter Card (aperçu WhatsApp/LinkedIn/X), canonical,
  robots, keywords, JSON-LD (Organization + WebSite). Nouveaux fichiers publics :
  `robots.txt` (bloque /admin, /mon-compte, /mon-club, /checkout…), `sitemap.xml`
  (pages publiques), `site.webmanifest` (PWA), `favicon.svg` **provisoire** on-brand
  (était référencé mais absent → 404). Image de partage **provisoire** = hero
  fan-club (à remplacer par `/og-image.png` 1200×630 une fois le logo créé).
  À faire ensuite : vrai logo (header + favicon + og-image), sitemap **dynamique**
  par club/fédération (généré depuis `tenants`).
- **2026-07-20 (bf)** — **Merge stagiaire : édition/suppression des messages, posts &
  commentaires du Fan Club** (branche `feature/fanclub-message-edit-delete`).
  4 conflits résolus en conservant **les deux** apports : mes réactions/favoris/
  présence/compteurs ET l'edit/delete. Backend : `updateMessage`/`deleteMessage`
  (+ posts/commentaires) avec **check auteur serveur** et **suppression logique**
  (`deleted_at`, conservé pour l'audit). L'édition **repasse par la modération**
  (`publishGate` + `screenAsync` + `requireChatAccess`) → pas de contournement
  poste-propre-puis-édite-abusif. Front : édition inline (textarea) + confirm de
  suppression via `MessageReportMenu`, réactions masquées pendant l'édition,
  `{...message}` préserve les réactions. Aucune migration (`deleted_at` déjà là).
  Vérifié : build front OK, boot backend OK, **91 tests modération OK**.
- **2026-07-20 (be)** — **Gains & remise des lots — Lot B (BO club + super admin)**.
  Écran « Lots à expédier » partagé : `db/prizeClaims.js` + `listClaims`
  (scopé : super_admin = tout, club_admin = son club), `updateFulfillment`
  (statut + transporteur + n° de suivi + notes, timestamps, **refuse l'expédition
  sans adresse**, notifie le gagnant à expédié/livré), `remindAddress` (relance
  du gagnant sans adresse). Route `routes/v2/admin/prizes.js` (`GET /`,
  `PATCH /:id`, `POST /:id/remind`) avec cloisonnement par rôle. Front :
  composant réutilisable `PrizeFulfillmentPanel` (filtres par statut, saisie
  suivi, boutons expédié/livré/relancer) monté dans **BO Super Admin**
  (`/admin/prizes`, onglet « Gains & lots ») ET **BO Club** (MonClubBO, onglet
  « Gains »). Aucune migration (même table). Reste Lot C : notifs de relance
  automatiques + branchement loto/bingo.
- **2026-07-20 (bd)** — **Gains & remise des lots — Lot A (côté fan)**. Système
  générique (tombola/loto/bingo) de suivi des lots gagnés. Migration
  `prize-claims.sql` : table `prize_claims` (game_type + game_ref polymorphes,
  `winner_user_id`, `prize_type` physical/digital, `status`
  pending_address→preparing→shipped→delivered, coordonnées de livraison + suivi
  postal, index unique (jeu,réf,gagnant) → tirage idempotent, RLS deny-all).
  `db/prizeClaims.js` : `createClaim` (idempotent, digital→delivered direct),
  `listMyClaims`, `submitAddress` (adresse **collectée au 1er gain**, RGPD-clean ;
  pending_address→preparing). `tombola.drawWinner` crée le claim + notif orientée
  « Mes gains » (`/mon-compte?tab=prizes`). Routes fan `GET /me/prizes`,
  `POST /me/prizes/:id/address`. Front : onglet **« Mes gains »** (Mon Compte,
  deep-link `?tab=prizes`) avec statut lisible + modale de saisie d'adresse.
  ⚠️ **Requiert la migration `prize-claims.sql`**. Suite : Lot B (écran expédition
  BO club/super admin + n° de suivi) puis Lot C (notifs + branchement loto/bingo).
- **2026-07-20 (bc)** — **Paiement carte sur la tombola** (un fan sans compte PCC ne
  pouvait pas jouer). L'achat passe désormais par le moteur générique
  `settleCheckout` (nouvelle route `POST /checkout/tombola`, `buildTombolaGroups`
  valide campagne active + dispo + prix serveur). Le ticket est créé **à la
  confirmation du paiement** via `grantGameEntitlements` (idempotent, flag
  `granted`) : en direct pour PCC, à la réconciliation Stripe pour la carte
  (`/checkout/status` étendu). Front `Tombola`/`BuyModal` : sélecteur PCC/Carte/
  PCC+carte/3×-4× + redirection Stripe + popup rechargement. ⚠️ **Requiert la
  migration `orders-tenant-nullable.sql`** : toutes les tombolas sont « plateforme »
  (sans club) or `orders.tenant_id` était NOT NULL. Constat : bingo = crédits
  séparés, loto = salons gratuits → carte non nécessaire pour eux.
- **2026-07-20 (bb)** — **Popup inscription PCC pédagogique**. Cas « inscription » de
  `PccRechargeModal` : avantages (+5% PCC à l'inscription `SIGNUP_BONUS_PCT`,
  paiement 1 clic, offres/cashback) + rappel que le wallet **n'est pas obligatoire**
  (paiement CB possible partout).
- **2026-07-20 (ba)** — **Favoris depuis le Fan Club**. Le fan pouvait entrer dans un
  salon sans pouvoir le suivre. Ajout : étoile toggle sur chaque carte de l'annuaire
  `FanClubHub` (part de l'état connu, un seul POST/clic, pas de GET par carte) +
  bouton « Suivre ce club » (`FavoriteClubButton`) dans le header de la page salon
  `FanClub`.
- **2026-07-20 (az)** — **Paiement : popup de rechargement PCC + option carte sur la
  boutique**. (1) **Popup explicative `PccRechargeModal`** avant la redirection vers
  PaieCashCoin (remplace les liens bruts de Mon Compte + billetterie) : dit où va le
  fan, avec quel email, et **choisit connexion vs inscription** selon `found` (email
  présent dans la BDD PCC) — deep-links `…/login?redirect=/dashboard?tab=wallet` ou
  `…/register?ref=paiecashfan`. `GET /me/pcc` renvoie désormais `found` ; les 402
  `needTopUp` du checkout aussi. (2) **Checkout boutique branché** (le bouton « Passer
  commande » était mort) : nouvelle route `POST /api/v2/checkout/boutique` qui valide
  les produits **serveur** (prix `pcc_price`/`eur_price` recalculés, stock vérifié,
  `status='active'` requis), groupée par club. **Factorisation `settleCheckout`**
  partagée par billetterie ET boutique (PCC direct / carte Stripe / mixte / 3×-4×),
  zéro duplication. Front `MerchandiseSection` : sélecteur **PCC / Carte / PCC+carte /
  3×-4×**, redirection Stripe (carte), vidage panier + retour compte (PCC), bandeau
  recharge + popup. ⚠️ Décrément de stock **non** automatisé → voir TODO « Suivi du
  stock boutique » (à faire en prod, BO Super Admin + BO Club).
- **2026-07-17 (ay)** — **Réactions emoji sur les messages du chat**. Migration
  `fan-message-reactions.sql` : table `fan_message_reactions(message_id, user_id,
  emoji)` (PK composite → un emoji différent par user/message), CHECK liste
  blanche (👍👎❤️😂😮🔥), RLS deny-all. Backend : `toggleMessageReaction` (bascule),
  `reactionsForMessages` (agrégat `{emoji,count,mine}` ordre palette),
  `getFeed.messages[].reactions`. Route `POST .../messages/:id/reactions` avec la
  **même garde `requireChatAccess`** que l'écriture (sanctionné/charte ⇒ pas de
  réaction) + cloisonnement salon. Front : `MessageReactions` (puces + sélecteur
  au survol), bascule optimiste, garde `pendingWrites`. Validé à 3 niveaux
  (UI / backend / base).
- **2026-07-17 (ax)** — **Merge chantiers 1 & 3 (Kelvine) : chat dynamique +
  compteurs réels**. Chat borné + scroll interne (`min-h-0`), auto-scroll
  intelligent (seuil 120 px, pas de saut si même dernier message), polling 5 s
  (garde `pendingWrites`), compteurs réels (messages publiés / supporters=favoris
  / réactions=likes). Conflit `getFeed` résolu (sa branche antérieure à la
  présence) : compteurs + présence conservés. Fix layout : côte-à-côte
  streaming/chat abaissé `xl:`→`lg:` (basculait sous la vidéo avant 1280 px) +
  `lg:h-full` pour aligner le chat sur la vidéo.
- **2026-07-17 (aw)** — **Présence en ligne par salon (chantier 2 Fan Club)**.
  Corrige « je suis noté hors ligne alors que je suis connecté » : la présence
  était codée en dur (`online:false`). Migration `chat-presence.sql` : table
  `chat_presence(tenant_id, user_id, last_seen_at)`, RLS deny-all. `db/presence.js` :
  `heartbeat()` (upsert) + `onlineInTenant()` (en ligne = vu < **75 s**). Modèle
  heartbeat + fenêtre, **sans websocket** (cohérent avec le polling de l'app,
  nettoyage implicite). Route `POST /api/v2/clubs/:slug/presence`. `getFeed`
  annote chaque participant `online`, **inclut les présents non-auteurs**, trie
  les en-ligne d'abord, renvoie `onlineCount` réel. Front : hook `usePresence`
  (battement toutes les 30 s tant que la page est ouverte + onglet visible,
  reping au retour d'onglet, cleanup au départ), branché dans `FanClub` (salon
  de club + connecté). `ParticipantsPanel` consomme déjà `fan.online`.
  Tests **5/5** (`tests/presence.test.js`).
- **2026-07-16 (av)** — **Recherche navbar (loupe) + retrait de l'icône panier**.
  Fonctionnalité livrée par Kelvine (branche `feature/navbar-search`), revue et
  intégrée : `NavbarSearch` (modale) branchée sur la loupe → `GET /api/v2/marketplace/search?q=`
  (endpoint serveur existant, service-role + sanitize anti-injection PostgREST,
  recherche clubs + fédérations). Front propre : `apiFetch` (jamais Supabase
  direct), debounce 250 ms + annulation, fusion résultats API + données statiques
  dédoublonnée, Échap pour fermer, loupe désormais visible aussi sur mobile.
  **Complété** (partie non faite par la stagiaire) : suppression de l'icône
  `ShoppingBag` (« Panier », décorative et sans lien) à côté de « Se connecter ».
- **2026-07-16 (au)** — **Page Fan Club refondue en HUB (annuaire des salons)**.
  `/fan-club` n'est plus le salon PSG par défaut mais un **annuaire premium**
  (nouvelle page `FanClubHub`) ; le salon d'un club reste sur
  `/clubs/:slug/fan-club`. Hero `fan-club-home.webp` (converti du PNG : 1804→87 ko,
  −95 %). Nouvel endpoint `GET /api/v2/clubs/fan-hub?search=` (`favorites.getFanHubData`)
  avec **compteurs RÉELS** : `supportersCount` (favoris), `membersCount` (charte
  acceptée), `isOfficial` (club_admin assigné). ~1900 clubs en base → on ne les
  charge pas tous : **défaut** = clubs des grandes ligues (~176, 58 ko),
  **recherche** = tout le catalogue côté serveur (debounce). Front : **favoris en
  premier**, puis Ligue 1, puis populaires ; **accès rapide** au salon favori
  (carte en tête) ; recherche/tri, « Voir plus », bandeau valeurs. Devise (motto)
  greffée depuis `clubProfiles` (PSG/OM en ont une). Badge **LIVE** codé mais
  masqué (`isLive:false`) en attendant l'intégration matchs (API-Football).
  ⚠️ « En ligne » remplacé par « Membres » (pas de système de présence temps réel).
- **2026-07-16 (at)** — **Modération Fan Club — Lot 7 (appels + stats avancées)**.
  Migration `chat-appeals.sql` : table `chat_appeals` avec cible **POLYMORPHE**
  (`target_type` case|sanction + `target_id`) — un fan conteste un contenu modéré
  OU une sanction (couvre les suspensions auto sans dossier). `tenant_id` nullable
  (sanction globale → super_admin). Module `db/chatAppeals.js` :
  `listMyModeration` (vue fan), `createAppeal` (1 seul appel/décision, ownership
  vérifié, dossier « classé » non contestable), `listAppeals`/`getAppeal`
  (cloisonné), `decideAppeal` → **réparation AUTO** à l'acceptation (republication
  `moderation_status='published'` / levée de sanction), notification `chat_appeal_result`.
  `moderationStats()` : dossiers par origine/type, top catégories IA, sanctions
  actives, taux d'acceptation des appels, délai moyen. Routes fan (`/me/moderation`,
  `POST /me/moderation/appeals`) + modérateur admin & club (appels, décision,
  `stats/advanced`), tous bornés. Front : onglet **Ma modération** dans MonCompte
  (`MaModeration` + `AppealModal`), onglets **Appels** et **Stats** dans
  `ModerationQueue`. Tests **91/91**. Clôt la série de modération (Lots 1→7).
- **2026-07-16 (as)** — **Notification persistante au fan quand son message est bloqué**.
  La modale s'affiche déjà en temps réel ; on ajoute une **notification dans la
  cloche 🔔** (type `chat_blocked`) pour que le fan retrouve l'info : « Ton
  {message/publication/commentaire} du salon {club} n'a pas été publié car il ne
  respecte pas notre charte. Un modérateur en a été informé. » Émise depuis
  `publishGate` (fire-and-forget), **sauf sur simple rate-limit** (pas une
  violation de charte). **Anti-flood** : `notifyBlocked` n'émet qu'une notif de
  blocage par fan **et par salon** toutes les 5 min (sinon 10 messages bloqués =
  10 notifs). Icônes front ajoutées pour `chat_blocked`/`chat_sanction`/
  `chat_sanction_revoked` dans `NotificationBell`. Le modérateur reste seul juge
  d'une éventuelle sanction (l'IA a juste bloqué + ouvert le dossier).
- **2026-07-16 (ar)** — **Fix : supporters coincés en 403 sur le salon**.
  Symptôme : certains supporters ne pouvaient ni poster ni commenter (403), même
  après avoir « accepté la charte ». Cause racine (3 maillons) : (1) `ensureCanWrite`
  faisait `if (access?.needsCharter)` → quand l'accès n'était pas encore chargé
  (`access === null`), le test était falsy et **le message partait avant vérif de
  la charte** → 403 serveur. (2) `fail()` **ignorait son 4e argument** → la réponse
  403 ne portait ni `needsCharter` ni la sanction : un 403 « aveugle ». (3) Le front
  **n'ouvrait pas la charte sur un 403** → supporter coincé sur une erreur brute.
  Fixes : `ensureCanWrite` bloque tant que `access` est null (+ relance le
  chargement) ; `fail(res,msg,status,extra)` renvoie `extra` dans `data` ;
  `useFanFeed` route les 403 vers `onAccessDenied(data)` → FanClub **rouvre la
  charte** (needsCharter) ou rafraîchit l'accès (sanction). Auto-réparant : toute
  écriture refusée re-propose la charte. Backend `acceptCharter` vérifié OK (le
  bug était uniquement dans l'enchaînement front + réponse 403).
- **2026-07-16 (aq)** — **Modération Fan Club — Lot 6 (blocage AVANT publication)**.
  `services/moderation/prepublish.js` : pipeline du moins cher au plus cher —
  **rate limit** (10/min, compte aussi les contenus bloqués : pas de flood par
  refus) → **heuristique** (0 ms, gratuite, bloque l'explicite sans appeler
  Claude) → **Claude** (rattrape l'implicite type « retourne cueillir des
  bananes »). Appliqué aux **3 surfaces** via `publishGate()`.
  🔓 **FAIL-OPEN** (budget 10 s) : si l'IA est lente ou en panne, on **publie**
  et on repasse en analyse asynchrone — faire taire le salon serait pire (testé).
  Politique : `high`/`critical` → **bloqué** + dossier ; `medium` → **reformuler**
  sans dossier (proportionné) ; `none`/`low` → publié.
  Le contenu refusé est **stocké** (`moderation_status='blocked'`) : audit,
  comptage des récidives, appel (lot 7) — jamais servi (filtre de lecture).
  **Suspension conservatoire** : 3 blocages en 10 min → lecture seule **1 h**,
  🔒 temporaire et révocable, jamais définitive (testé), pas d'empilement.
  Réponse **HTTP 422** portant motif + catégories ; `apiFetch` attache désormais
  `status`/`data` à l'erreur. Front : `BlockedMessageModal` (motif, catégories,
  bouton **Reformuler**), écho optimiste déjà présent dans `useFanFeed`.
  **Charte v2026-07-16** (bump ⇒ ré-acceptation obligatoire) : encart
  « Modération automatique » — informer d'une décision automatisée est requis
  (RGPD art. 22 / DSA). Flag dédié `chat_ai_prepublish_enabled`.
  Tests **78/78** (+10). 🐛 **Fix test** : un test restaurait la vraie clé API,
  si bien que toute la suite appelait le vrai Claude (payant/lent) — 21 s au lieu
  de plusieurs minutes.
- **2026-07-16 (ap)** — **Modération étendue au FIL (posts + commentaires)**.
  🚨 **Trou corrigé** : les lots 1→5 ne couvraient que `fan_messages`. Un post ou
  un commentaire ne pouvait être **ni signalé, ni masqué, ni analysé par l'IA** —
  publier dans le fil contournait charte, sanctions et IA.
  Migration `chat-moderation-content.sql` : colonnes de modération sur
  `fan_posts`/`fan_comments` + **signalements et dossiers POLYMORPHES**
  (`content_type` ∈ message|post|comment + `content_id`, remplace `message_id`).
  Couche métier généralisée : `getContent()`, `createReport({contentType,…})`,
  `upsertCaseForContent()`, `decideCase()` agit sur la bonne table,
  `screenContent()`. ⚠️ **`fan_comments` n'a pas de `tenant_id`** → résolu via le
  post parent, sinon un club_admin pouvait modérer les commentaires d'un AUTRE
  club (testé). **Filtre de lecture** ajouté sur posts ET commentaires dans
  `getFeed` (un post masqué restait servi par l'API). Routes : un handler unique
  `reportHandler(type)` monté sur `/messages|/posts|/comments/:contentId/report`.
  Front : menu de signalement sur les posts, bouton 🚩 sur les commentaires,
  badge **Chat/Post/Commentaire** dans le BO, contexte adapté (commentaires
  frères pour un commentaire). Tests **68/68** (+8 sur le fil).
  🐛 **Fix test** : la suite écrivait dans `feature_flags` (table partagée avec
  la prod) et **laissait la modération IA désactivée** — le flag est désormais
  sauvegardé/restauré.
- **2026-07-15 (ao)** — **Fix chat : auto-modération + signalement tactile**.
  (1) Le menu « … » proposait « Masquer/Bloquer cet utilisateur » **sur son
  propre message** → nouveau prop `isOwn` : sur son message, uniquement
  « Copier ». (2) 🐛 **Le signalement était inaccessible sur mobile** : le
  bouton était en `opacity-0` révélé au `group-hover`, or il n'y a pas de survol
  au doigt → invisible. Désormais `opacity-60 lg:opacity-0 lg:group-hover:100`
  (visible sur tactile, révélé au survol sur desktop). (3) **Bouton 🚩 Signaler
  dédié**, à côté du « … » : action directe, plus enfouie dans un sous-menu.
- **2026-07-15 (an)** — **Modération Fan Club — Lot 5 (IA de pré-classement)**.
  Nouveau service `backend/services/moderation/` : `types.js` (contrat normalisé
  + garde-fous), `mockProvider.js` (heuristique, sans clé), `claudeProvider.js`
  (**`claude-opus-4-8`**, sortie JSON contrainte par `output_config.format`,
  prompt calibré « la passion foot n'est pas de la modération », timeout 25 s),
  `index.js` (flag + repli + orchestration).
  **Benchmark 3 modèles sur cas réels** (cf. `docs/moderation-benchmark.md`) :
  sur 11 cas simples les 3 font 11/11, mais sur **13 cas subtils** Opus fait
  **13/13**, Sonnet 5 **11/13** et Haiku 4.5 **10/13** — Haiku rate un racisme
  explicite (« retourne cueillir des bananes »), et Sonnet+Haiku sanctionnent
  le supporter qui **dénonce** un propos raciste. D'où le choix d'Opus.
  ⚠️ **Pas de `cache_control`** : le prompt (~917 tokens) est sous le minimum
  cachable d'Opus 4.8 (4096) — le marqueur serait ignoré silencieusement.
  Coût réel mesuré : **~$6–9 / 1000 messages**.
  🔒 **Clé `ANTHROPIC_API_KEY` lue côté serveur uniquement**, jamais exposée
  (l'API ne renvoie que le NOM du fournisseur). **L'IA ne sanctionne pas** :
  elle ouvre un dossier `source='ai'` priorisé (`ai_risk_score`/`ai_categories`/
  `ai_summary`), le message **reste publié** (le masquage = lot 6). Garde-fous :
  un « publish » sur risque critique est forcé en `flag_for_review` ; une action
  inconnue est rejetée ; la priorité n'est **jamais rétrogradée** (`worst()`).
  Analyse **après** publication, **sans await** (l'envoi n'attend jamais l'IA),
  repli heuristique si Claude est indisponible. Activation :
  flag `chat_ai_moderation_enabled` (+ coupe-circuit `CHAT_AI_MODERATION_ENABLED=false`).
  Front : badge **IA** dans la file + bandeau « pré-classement automatique »
  dans le dossier. Tests **59/59**.
- **2026-07-15 (am)** — **Modération Fan Club — Lot 4 (historique & audit)** + **UX
  décision**. `getUserModerationHistory` (profil : stats messages/modérés/dossiers/
  sanctions, **borné au salon pour un club_admin**, sanctions globales incluses) et
  `listAuditLogs` (filtres case/tenant/acteur, nom d'acteur résolu, « Système »/« IA »
  si automatique). Routes `GET /admin/moderation/users/:id|/audit` et
  `GET /clubs/:slug/moderation/users/:id|/audit` (bornées). Front :
  `UserHistoryModal` (profil + sanctions révocables), onglet **Journal d'audit**.
  **Fix UX** : la décision est passée d'un choix implicite (3 boutons) à un flux
  clair — *message au supporter* → *action sur le message* → *sanction* →
  **récapitulatif** + **un bouton unique « Appliquer et notifier le supporter »**.
  Fix « Invalid Date » sur message supprimé. Tests **48/48** (+ nettoyage sans
  dossiers orphelins).
- **2026-07-15 (al)** — **Modération Fan Club — Lot 3 (sanctions)**. `issueSanction`
  / `revokeSanction` / `listMySanctions` ; `decideCase` accepte une sanction jointe.
  Types : warning · mute · room_suspension · room_ban · global_chat_ban ·
  account_review. 🔒 **Garde-fous** : `global_chat_ban`/`account_review` réservés au
  **super_admin** (un club_admin ne bannit pas de tous les salons) ; **permanent
  interdit à l'IA** (`NEEDS_HUMAN` + CHECK base) ; permanent limité à room_ban/
  global_chat_ban ; **durée obligatoire** pour toute sanction bloquante non
  définitive (sinon « permanent déguisé »). **Notification** au sanctionné (+ à la
  levée) et **audit** (`sanction:*`, `sanction_revoked`). Routes : décision avec
  `sanction`, `POST /admin/moderation/sanctions/:id/revoke`,
  `POST /clubs/:slug/moderation/sanctions/:id/revoke` (borné au salon),
  `GET /admin|clubs/.../moderation/config`, `GET /me/chat-sanctions`. Front :
  sélecteur de sanction (type + durée 1h/24h/7j/30j + « définitive » si permis),
  liste des sanctions **révocables** dans le dossier, `ActiveSanctionBanner` en
  tête du salon. Tests **43/43**.
- **2026-07-15 (ak)** — **Modération Fan Club — Lot 2 (back-office)**. Signalement
  → **dossier** (`upsertCaseForMessage`, dédup via index unique 1 dossier ouvert/
  message, `reports_count`, priorité `high` dès 3 signalements). **`middleware/
  clubModerator.js`** : `requireClubModerator` — super_admin partout, **club_admin
  borné à son `tenant_id`** (`requireRole` ne suffisait pas : rôle global). Routes
  super_admin `/api/v2/admin/moderation/{cases,cases/:id,cases/:id/decision,stats}`
  et club_admin `/api/v2/clubs/:slug/moderation/*` (double vérif d'appartenance du
  dossier). Décisions : `dismiss` / `hide_message` / `remove_message` (**jamais de
  suppression physique** : `hidden`/`removed` + `deleted_at`), signalements liés →
  `reviewed`, **audit systématique** (`case_opened`, `decision:*`). Détail dossier :
  message, **contexte du salon**, signalements **anonymisés** (`reporter_user_id`
  jamais sélectionné), historique + sanctions du supporter. Front :
  `components/moderation/ModerationQueue` (stats, filtres, file, modale détail)
  réutilisé par **`/admin/moderation`** (tous clubs) et l'onglet **Modération de
  `/mon-club/bo`** (son salon). Tests **31/31**.
- **2026-07-15 (aj)** — **Modération Fan Club — Lot 1 (charte + signalement)**.
  Migration `chat-moderation.sql` : `fan_messages` + `moderation_status`/
  `moderation_case_id`/`deleted_at`/`edited_at` (**jamais de suppression
  physique**) et 5 tables (`chat_room_memberships`, `chat_reports`,
  `chat_moderation_cases`, `chat_sanctions`, `chat_moderation_audit_logs`), RLS
  deny-all. 🔒 **Garde-fous en base** : `CHECK (NOT is_permanent OR issued_by IS
  NOT NULL)` → **l'IA ne peut jamais bannir définitivement** ; `UNIQUE(message_id,
  reporter_user_id)` → 1 signalement/user/message ; index unique 1 dossier ouvert
  par message. **`getFeed` filtre `published` + `deleted_at IS NULL`** (un message
  masqué n'est jamais servi). `db/chatModeration.js` (charte versionnée, sanctions
  actives, reports). Endpoints `GET /clubs/:slug/chat-access`,
  `POST /clubs/:slug/chat-charter/accept`,
  `POST /clubs/:slug/fan-feed/messages/:id/report` ; **`POST messages` durci**
  (sanction → 403, charte → 403 : l'API ne contourne pas la modération). Front :
  `CharterEntryModal` (renforcée si club non favori), `MessageReportMenu`,
  `ReportMessageModal`, saisie contextuelle (connexion/charte/sanction), masquer
  un utilisateur = préférence locale. Tests `chatModeration.test.js` **16/16**.
- **2026-07-15 (ai)** — **Clubs favoris (⭐) + notifications ciblées (Phase B)**.
  Nouvelle table **`fan_favorite_clubs`** (multi-favoris + `is_primary` = club
  principal ; RLS deny-all ; migration `fan-favorite-clubs.sql`). ⚠️ **N'utilise
  PAS `profiles.club_id`** qui sert au rôle club_admin → un favori n'accorde
  **aucun droit**. `db/favorites.js` (list/toggle/setPrimary/followersOfClub) +
  routes `GET /me/favorites`, `POST /me/favorites/:tenantId` (toggle),
  `PUT /me/favorites/:tenantId/primary`. **⭐ sur la fiche club**
  (`FavoriteClubButton`, optimiste, redirige login) ; **card « Mes clubs »** dans
  `/mon-compte` (principal, communauté, retirer, état vide). **Fan-out** : à la
  création d'une tombola de club, notification à tous ses fans (⭐).
- **2026-07-14 (ah)** — **Sport Bingo — Page « Jouer » premium (maquette)**. `BingoPlay`
  refait, thémé par compétition : hero cover (image + titre + chips + rebours),
  panneau **À propos**, **Comment ça marche** (identique à la page Jeux), onglets
  **Grille ↔ Calendrier synchronisés**. **Grille premium** : cards de match
  (drapeaux + **codes FIFA**, 1/N/2 inline, case FREE, états correct/incorrect) +
  **sidebar** (progression, points max, comment remplir, légende, **bonus combo**
  visuel, valider). **Calendrier** groupé (groupe/journée) avec drapeaux/heure.
  « Compléter ma grille » : desktop → défile vers la grille, mobile → sheet guidé.
  BO : champs **logo/drapeau + groupe** par match ; `home_logo`/`away_logo` +
  `group_label` (migration `bingo-match-group.sql`). Édition CAN peuplée (24
  matchs africains + drapeaux flagcdn, cover `can-card.webp`).
- **2026-07-14 (ag)** — **Sport Bingo — Cycle de vie & disponibilité (statut = métier)**.
  Helper serveur unique `services/bingoAvailability.getEditionAvailability(edition, now)`
  (heure SERVEUR ; `starts_at`=ouverture, `locks_at`=clôture) → draft/upcoming/
  playable/locked/live/calculating/completed/cancelled. Garde `canParticipateInEdition`
  (raisons structurées) appliquée à **create/picks/submit** (participation impossible
  après clôture, même en accès URL direct). `GET /` renvoie `availability` et exclut
  draft/completed/cancelled ; nouveau `GET /results`. **Jobs auto** : `bingoSync`
  (scheduled→open, open→locked par dates) + `bingoAutoSettle` (notation auto dès que
  TOUS les résultats officiels sont saisis → completed + scoring + notif ; override BO
  conservé). Front : helper unique `lib/bingoAvailability` (badge/CTA — bouton « Jouer »
  rendu **uniquement** si playable), `EditionCard` piloté par availability, **3 sections**
  (Jouer maintenant / À venir / Mes grilles en cours) + état vide premium, page
  **/tombola/resultats** (avec ton score). Tests `tests/bingoAvailability.test.js` (18/18).
  Migration `migrations/bingo-indexes.sql` (à exécuter). Fix retour → page Sport Bingo.
- **2026-07-14 (af)** — **Sport Bingo — Bloc 2 : remplissage mobile**. Grille
  devenue aperçu tappable ; **bottom-sheet** de saisie (glisse du bas sur mobile,
  centré desktop) : match « Domicile VS Extérieur », **3 grandes options** 1/N/2
  avec libellés (Victoire {équipe}/Nul), **auto-avance** vers la case vide
  suivante, navigation ◀▶ + « Case X/N », **Réinitialiser**, enregistrement auto.
  Barre de progression + bouton **« Compléter ma grille »**. Modal de validation
  irréversible conservée.
- **2026-07-14 (ae)** — **Notifications (Phase A) + harmonisation « Comment jouer »**.
  Fix majeur : `createNotification` insérait `tenant_id` (colonne inexistante) →
  tous les inserts échouaient en silence ; retiré. Routes app `GET /me/notifications`
  (+ `unread-count`, `POST /:id/read`, `read-all`). **Cloche 🔔 branchée**
  (`NotificationBell`) : pastille non-lus (poll 60s), panneau, marque-lu + navigation.
  Émission : **clôture bingo** (score + rang par joueur), **tirage tombola**
  (gagnant). Section « Comment jouer » du hub bingo alignée sur la page Jeux
  (badges circulaires + flèches + card promo).
- **2026-07-14 (ad)** — **Espace compte : onglet « Mes grilles »**. `/mon-compte`
  liste les bulletins Sport Bingo du fan (récap grilles/points/BINGO, statut
  gagnée/en attente/à compléter/sans gain, figures, **date de jeu**, **rang
  obtenu #X/Y** par édition calculé backend, lien vers la grille). `listMyCards`
  enrichi du rang + participants.
- **2026-07-14 (ac)** — **Card bingo premium partagée + navbar « Jeux »**. Card
  refondue (320×520, Bebas Neue, overlay exact, glow/emoji par compétition,
  countdown coloré 2h/6h, barre, hover Netflix + bordure lumineuse animée, pulse
  EN DIRECT) extraite en composant partagé `components/bingo/EditionCard.jsx`,
  réutilisée sur `/tombola/sport-bingo` **et** la section de `/tombola` (3 en
  aperçu + « Voir tout »). Navbar : entrée « Sport Bingo » retirée, **« Tombola »
  → « Jeux »**. Fix : éditions **`live`** jouables (création de grille) tant que
  non verrouillées (`locks_at`).
- **2026-07-14 (ab)** — **6 éditions Sport Bingo seedées (maquette)**. Script
  `scripts/seed-bingo-editions.js` (idempotent) : Champions (live, 500), Premier
  League (open, 300), CAN (open, 400), Copa (à venir, 450), Classicos (à venir,
  3×3, 250), Derbies (à venir, 300) — avec sous-titres, badges, difficultés,
  images webp locales, compte à rebours et 24 matchs (9 en express) pour être
  jouables. Visuel `premier-league.webp` ajouté.
- **2026-07-14 (aa)** — **Fix image des cards Sport Bingo + 6 visuels**. La card
  masquait l'image (`opacity-70` sous dégradé sombre → image de stade invisible).
  Corrigé : image pleine + dégradé bas pour lisibilité + voile haut pour les
  badges. 5 visuels d'édition convertis en webp (ligue-champions, can, copa,
  classicos-weekend, derbies-europeen ; ~2,2 Mo → ~140-230 Ko). Édition de test
  rebranchée sur `/images/gaming/ligue-champions.webp`.
- **2026-07-13 (z)** — **Tombola « Comment ça marche » refaite (maquette)**.
  4 étapes en badges circulaires numérotés reliés par des flèches (Choisis /
  Achète / Tirage / Reçois) + card promo « Plus tu joues, plus tu gagnes » avec
  image cadeau 3D (`cadeau.webp`, 4 Ko) et bouton « Voir les lots » (ancre
  #tombolas). Steps centrés verticalement, card compacte.
- **2026-07-13 (y)** — **Édition des jeux publiés (bingo + tombola)**. BO bingo :
  bouton **Modifier** par édition → panneau d'édition des paramètres (titre,
  sous-titre, badge, description, coût, récompense, **image de fond** avec upload).
  BO tombola (`TombolaManager`) : bouton **Modifier** par campagne → recharge le
  formulaire (mode PUT) pour changer lot, prix, date, **image**, etc. + Annuler.
- **2026-07-13 (x)** — **Sport Bingo — Refonte front + BO complet**.
  **Front** `/tombola/sport-bingo` refait (maquette) : en-tête (crédits, Règles,
  Classement), **cards d'édition** avec image de fond (`cover_url`), badge de
  statut (EN DIRECT/OUVERTE/À VENIR), **nb réel de joueurs**, compte à rebours
  live + barre, gain max, CTA contextuel (Continuer/Jouer/Voir détails), section
  « Comment jouer » (5 étapes) + promo classement. Hero page **Tombola** avec
  image webp + encart « prochain tirage ». **BO** : barre d'actions par édition —
  **Publier**, **Prévisualiser la grille**, **Simuler la validation** (dry-run, 0
  écriture), **Cartes joueurs**. Formulaire édition : **upload image de fond** +
  sous-titre. Endpoints `GET /admin/…/preview`, `POST /admin/…/simulate`,
  `GET /admin/…/cards`, `GET /me/credits`; liste publique enrichie du `players`.
  Image `hero-tombola.png` → **webp** (1,85 Mo → 122 Ko).
- **2026-07-13 (v)** — **Sport Bingo — Admin : saisie unifiée & import en masse**.
  Fusion matchs/événements (1 match crée son événement 1/N/2). Liste unique avec
  coup d'envoi + boutons résultat 1/N/2 (re-clic = efface). **Import en masse par
  collage** (tableau Excel/Markdown, « A ; B ; 1 », « A vs B ») avec colonne
  résultat optionnelle + aperçu du nb détecté. Saisie rapide (Entrée pour ajouter)
  + coup d'envoi optionnel. Endpoints `POST /match-event`, `POST /matches/bulk`,
  `DELETE /events/:id/with-match`.
- **2026-07-13 (u)** — **Sport Bingo — Phase 3 UI (bloc 1)**. Page dédiée
  `/tombola/sport-bingo` : hero, **éditions à jouer** (vedette + grille),
  **Mes cartes** (toutes éditions, statut + score + figures), **Classement**
  (podium, avatars, « Toi »), **Comment jouer**, **Jeu responsable**. Endpoint
  `GET /me/cards`. Section Sport Bingo de la page Tombola → lien « Voir tout ».
  Grille jouable : **modal de confirmation irréversible** avant validation
  (règles + coût + verrouillage + case d'acceptation).
- **2026-07-11 (t)** — **Sport Bingo — Phase 2b : moteur de scoring**.
  `bingoEngine.detectFigures` (lignes/colonnes/diagonales/coins/carré/croix/X/
  double-triple ligne/BINGO). `services/bingoScoring.js` : à la clôture, note les
  cases (correct/incorrect/void), détecte les figures, attribue les points
  **idempotents** (`calculation_version` + `bingo_card_wins`), journalise l'audit,
  reconstruit le **classement** (all-time). Routes `POST /admin/editions/:id/settle`
  + `GET /leaderboard`. Admin : bouton **« Clôturer & calculer »**. Grille jouable :
  affichage **score + figures gagnantes**. Testé (grille full → 4550 pts, idempotent).
- **2026-07-11 (s)** — **Sport Bingo — Phase 2a** (données + fondations). Migration
  `bingo-phase2.sql` : **portefeuille virtuel + ledger immuable** (`virtual_wallets`,
  `virtual_wallet_transactions` avec `idempotency_key`, remplace `bingo_credits`),
  `bingo_patterns`(+seed 10 figures)/`bingo_edition_patterns`, `bingo_card_wins`,
  `bingo_leaderboards`, `bingo_result_audit_logs`, `feature_flags`(+seed),
  `profiles.birth_date` (18+). `db/wallet.js` (ledger idempotent), abstraction
  **`services/footballProvider.js`** (MockFootballDataProvider, clés serveur).
  Débit d'entrée Bingo branché sur le ledger. RLS deny-all (autorisation backend).
- **2026-07-11 (r)** — **PaieCash Sport Bingo — Phase 1 backend** (fondation).
  Migration `backend/migrations/bingo.sql` (éditions/matchs/événements/cartes/
  picks/scoring_log/crédits — à exécuter dans Supabase). Moteur
  `services/bingoEngine.js` : génération de carte **déterministe côté serveur**
  (seed → layout, FREE au centre en 5×5). `db/bingo.js` + routes `/api/v2/bingo`
  (public éditions/détail, joueur créer-carte/picks/soumettre, admin CRUD
  éditions/matchs/événements). MVP : type `MATCH_RESULT`, **crédits virtuels 500**
  (aucun argent réel). Reste : UI admin + grille jouable (front) + moteur de
  scoring/figures (Phase 2). **Front livré** : admin `/admin/bingo` (éditions +
  matchs + événements + saisie résultat 1/N/2), **grille jouable `/bingo/:slug`**
  (sélection 1/N/2 par case, auto-save, soumission verrouillée, états visuels),
  intégrée à la page **Tombola → section « Sport Bingo »** (éditions jouables).
- **2026-07-11 (q)** — **Tombola — backend** (branchement en cours). Tables
  `tombola_campaigns` / `tombola_tickets` (migration `backend/migrations/tombola.sql`
  à exécuter dans Supabase). API `/api/v2/tombola` : liste/détail (public),
  `POST /:id/buy` (achat tickets, **paiement PCC** via PaieCashCoin), création
  plateforme (super_admin) **ou club** (club_admin sur son club), gestion, tirage
  manuel. **Cron de tirage auto** à `ends_at` (`jobs/tombolaDraw.js`, toutes les
  5 min). **Front `Tombola.jsx` réécrit DB-driven** (tirages en cours + achat PCC
  réel + tirages passés avec gagnant ; grille de jeux = showcase « bientôt »).
  **Admin `/admin/tombola`** : créer/gérer les tombolas + tirage manuel.
  Composant réutilisable `TombolaManager` (plateforme vs club) → onglet
  **Tombola dans le BO club** (`MonClubBO`) ; le club_admin peut créer/tirer
  ses propres tombolas (tirage autorisé au propriétaire).
- **2026-07-11 (p)** — Nettoyage statique : la **recherche d'accueil** (HeroSearch)
  ne génère plus de clubs depuis le registry statique (slugs divergents) — les
  clubs viennent uniquement de l'**API `/marketplace/search`** (vrais slugs). Le
  registry statique ne sert plus que de **repli** (useClubDetail, hub billetterie,
  membres de fédération). Plus aucune navigation club ne produit de slug statique.
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
