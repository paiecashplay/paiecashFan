# 🪪 PaieCashFan — Fiche technique (carte d'identité de l'application)

> Document vivant : **mis à jour à chaque commit** (section « Journal des évolutions »).
> Dernière mise à jour : 2026-07-08.

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
- **Billetterie** : offres éditables en BO (`metadata.ticketing`), panier localStorage,
  **checkout PCC → EN COURS**.

## 7. Intégrations externes
- **API-Football** (v3, clé `apisports`) : import clubs, effectifs, championnats.
- **Foot Mercato** (scraping) : import palmarès.
- **Circle** : mint PCC on-chain.
- **Resend** (à activer en prod) : emails transactionnels (notifications, reset password).

## 8. Déploiement
- Branche déployée : **`main`** (Vercel front + Railway back, auto-deploy).
- Branches de travail : `feature/integration-marketplace` (principale), branches stagiaires
  mergées après revue.

## 9. TODO
Voir **`TODO.md`** (sécurité pré-vérif documents, infra email prod, checkout PCC,
persistance DB panier billetterie, page Fan Club à brancher au back…).

## 10. Journal des évolutions
> Le plus récent en haut. Mis à jour à chaque commit.

- **2026-07-08** — Merge branche stagiaire : déconnexion auto (IdleLogout), page Fan Club
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
