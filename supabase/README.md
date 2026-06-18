# Schéma Supabase PaieCashFan

Migration unifiée pour le projet Supabase **PaieCashFan** (production).

## Fichiers

```
supabase/
├── README.md                                  ← ce fichier
└── migrations/
    └── 20260615_000_init_paiecashfan.sql      ← schéma initial complet
```

## Contenu du schéma

| Section | Tables | Rôle |
|---|---|---|
| Identity | `profiles`, `subscriptions` | Liées à `auth.users` (Supabase Auth natif) |
| Football | `federations`, `tenants` | CAF/UEFA/… + Tanzanie/FFF/… + Simba/OM/… |
| Squad | `players`, `trophies` | Joueurs + palmarès (par club ou par fédération) |
| Boutique | `product_categories`, `products` | Catalogue avec images JSONB + tailles TEXT[] |
| Wallet | `wallets` | **Crossmint** (smart wallets + adresse on-chain) |
| Transactionnel | `transactions`, `orders`, `order_items`, `withdrawal_requests` | Panier, commandes, retraits |
| Système | `audit_logs`, `notifications` | Traçabilité + UX |

## Comment exécuter la migration

### Option 1 — SQL Editor de Supabase (le plus simple)

1. Ouvre **app.supabase.com → ton projet PaieCashFan → SQL Editor**
2. Copie-colle tout le contenu de `migrations/20260615_000_init_paiecashfan.sql`
3. Clique **Run**
4. Vérifie dans **Table Editor** que les nouvelles tables apparaissent

⚠️ **Pas de risque pour `profiles` / `subscriptions` existantes** : le script
utilise `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS`
pour enrichir sans casser.

### Option 2 — Supabase CLI (plus propre, versionné)

```bash
# Installer la CLI si pas encore fait
npm install -g supabase

# Se connecter
supabase login

# Lier le projet local au projet distant PaieCashFan
supabase link --project-ref npmenstkeahngrzemmna

# Pousser la migration
supabase db push
```

## Conventions du schéma

### Identifiants
- Tous les `id` sont des `UUID` générés par `gen_random_uuid()`
- Tous les liens vers les comptes utilisateurs passent par `auth.users.id`
  (Supabase Auth, jamais une table custom)

### Slugs
- Chaque entité publique (federations, tenants) a un `slug` unique
- Format : `kebab-case`, ASCII ASCII, sans accents
- Exemples : `tanzanie`, `simba-sc`, `paris-saint-germain`

### Rôles (RLS)
- `fan` : utilisateur lambda (défaut)
- `club_admin` : admin d'un club (référencé par `tenants.admin_user_id`)
- `super_admin` : toi / l'équipe Frostrek

Les politiques Row Level Security sont :
- Catalogue (federations, tenants, products) → **lecture publique**
- Tables sensibles (profiles, wallets, orders) → **owner-only**
- Toute écriture → **super_admin** OU **club_admin scoped à son club**

### Wallet Crossmint
- Un wallet par user (UNIQUE sur `wallets.user_id`)
- Champs : `crossmint_wallet_id`, `crossmint_linked_user`, `wallet_address`
- Provisionnement auto recommandé via webhook Crossmint ou trigger custom
  (pas inclus ici — à ajouter en P2.A)

### Panier
- Stocké comme une `orders.status = 'cart'`
- Index UNIQUE partiel garantit **un seul panier ouvert par user**
- Au checkout, le panier devient `status = 'pending'`, puis machine à
  états : `confirmed → processing → shipped → completed`

### Champs JSONB libres
- `tenants.metadata` : social_links, secondary_colors, video_url, etc.
- `players.stats` : `{ goals, assists, appearances, … }`
- `products.images` : `[ "url1", "url2", "url3", … ]`
- `products.metadata` : color_options, material, fit, …
- `transactions.metadata` : `{ stripe_session, crossmint_tx, … }`

### Triggers automatiques
- `updated_at` mis à jour sur toutes les tables qui ont la colonne
- À l'inscription Supabase Auth, un `profiles` est créé automatiquement
  via le trigger `handle_new_user()` (mappe display_name depuis le
  raw_user_meta_data)

## Prochaines étapes

1. ✅ **Exécuter la migration** sur Supabase prod
2. 🔜 **P1.B** : script de seed des données en dur (clubProfiles.js,
   tanzania-clubs.js, leagues.js) → SQL INSERT massif
3. 🔜 **P1.C** : routes API REST dans `backend/` qui lisent Supabase
   avec le `service_role` key
4. 🔜 **P1.D** : remplacer `findClubBySlug()` dans `paiecashfan-app`
   par un fetch vers l'API

## Rollback

Si tu veux tout effacer pour recommencer :

```sql
-- ⚠️ DESTRUCTIF — efface toutes les tables du schéma public
-- (auth.users et auth.* ne sont PAS touchés)
DROP TABLE IF EXISTS public.audit_logs           CASCADE;
DROP TABLE IF EXISTS public.notifications        CASCADE;
DROP TABLE IF EXISTS public.withdrawal_requests  CASCADE;
DROP TABLE IF EXISTS public.order_items          CASCADE;
DROP TABLE IF EXISTS public.orders               CASCADE;
DROP TABLE IF EXISTS public.transactions         CASCADE;
DROP TABLE IF EXISTS public.wallets              CASCADE;
DROP TABLE IF EXISTS public.products             CASCADE;
DROP TABLE IF EXISTS public.product_categories   CASCADE;
DROP TABLE IF EXISTS public.trophies             CASCADE;
DROP TABLE IF EXISTS public.players              CASCADE;
DROP TABLE IF EXISTS public.tenants              CASCADE;
DROP TABLE IF EXISTS public.federations          CASCADE;
DROP TABLE IF EXISTS public.subscriptions        CASCADE;
DROP TABLE IF EXISTS public.profiles             CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at()  CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()    CASCADE;
DROP FUNCTION IF EXISTS public.current_role()       CASCADE;
DROP FUNCTION IF EXISTS public.current_club_id()    CASCADE;
DROP TRIGGER  IF EXISTS trg_auth_user_created ON auth.users;
```

Puis ré-exécute la migration.
