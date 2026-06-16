# PaieCashFan — Supabase Seeder

Script Node.js qui injecte les données catalogue (fédérations, clubs, joueurs, palmarès, produits) dans Supabase de façon **idempotente** (peut être rejoué sans casse).

## Contenu

```
supabase/seed/
├── package.json        ← deps : @supabase/supabase-js + dotenv
├── .env.example        ← template credentials
├── .env                ← (à créer, NON commité) credentials réels
├── .gitignore
├── data.js             ← données à seed (clubs, joueurs, …)
├── seed.js             ← orchestrateur principal
├── lib/
│   ├── client.js       ← init du client Supabase (service_role)
│   └── upsert.js       ← helpers upsert idempotent
└── README.md
```

## Comment utiliser

### 1. Setup (une seule fois)

```bash
cd supabase/seed
npm install
cp .env.example .env
```

Édite `.env` et remplis :

```bash
SUPABASE_URL=https://npmenstkeahngrzemmna.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ← Dashboard Supabase → Settings → API → service_role
```

⚠️ **Ne commit jamais le `.env`**. Le `.gitignore` est déjà en place.

### 2. Test à blanc (recommandé d'abord)

```bash
npm run seed:dry
```

Affiche ce qui serait inséré sans toucher à la DB. Aucune écriture.

### 3. Seed pour de vrai

```bash
npm run seed
```

Mode incrémental par défaut :
- **federations** / **tenants** : `upsert` par `slug` (peut être rejoué)
- **players** / **trophies** / **products** : insert seulement les rows pas encore présents (clé naturelle = nom + parent)

### 4. Reset complet (avancé)

```bash
npm run seed:reset
```

⚠️ **Destructif** : supprime tous les players, trophies et products avant
de tout recréer. Utile quand la data en dur dans `data.js` a changé
(prix modifiés, joueurs ajoutés/retirés). **Garde les tenants et
federations** intacts (ils ont des FK depuis orders/wallets/etc.).

## Ce qui est seedé (état actuel)

| Catégorie | Compte | Notes |
|---|---|---|
| Fédérations | 2 | Tanzanie (TFF) + Zanzibar (ZFF) |
| Tenants | 12 | Hub Tanzanie + 8 NBC + ZFF + OM + PSG |
| Players | 62 | Tanzanie hub Samatta (1) + ZFF (3) + Star players NBC (8) + Squad OM (26) + Squad PSG (24) |
| Trophies | 22 | OM (6) + PSG (8) + Simba (2) + Yanga (2) + Azam (3) + Namungo (1) |
| Products | 42 | 8 × 4 produits NBC (32) + 1 ZFF + 9 OM |

## Ajouter un club

1. Édite `data.js`
2. Ajoute une entrée dans `tenants` (slug unique, `federationSlug` si rattaché)
3. Optionnel : ajoute joueurs (`players`) et trophées (`trophies`) avec
   le `tenantSlug` correspondant
4. Optionnel : ajoute des produits (`products`)
5. `npm run seed` (incrémental) ou `npm run seed:reset` (replace all)

## Erreurs courantes

| Erreur | Cause | Fix |
|---|---|---|
| `Missing SUPABASE_URL` | `.env` pas créé | `cp .env.example .env` |
| `Invalid API key` | Mauvaise key | Vérifier que tu utilises bien le **service_role**, pas l'anon |
| `relation "federations" does not exist` | Migration 000 pas exécutée | Run `supabase/migrations/20260615_000_init_paiecashfan.sql` dans SQL Editor |
| `null value in column "name" of relation "tenants"` | Champ obligatoire manquant dans `data.js` | Vérifier la row qui manque un champ NOT NULL |
| `duplicate key value violates unique constraint` | Slug déjà utilisé | Renommer le slug dans `data.js` |

## Long terme (Phase 2)

Quand le **BO Super Admin** sera prêt, la duplication entre `paiecashfan-app/src/data/*.js` et `supabase/seed/data.js` disparaîtra : tout sera saisi via le BO. Ce script servira uniquement à provisionner les bases de dev/staging.
