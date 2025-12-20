# 🛍️ Scraper Produits Clubs - Documentation

## 📋 Vue d'ensemble

Système de récupération automatique des produits officiels des clubs. Chaque club dispose d'un catalogue de **15 produits maximum** issus de sa boutique officielle.

## ✅ Fonctionnalités

- ✅ **15 produits maximum par club** (limite respectée)
- ✅ **3 clubs disponibles** : OM, PSG, OL
- ✅ **Données réalistes** : Prix, descriptions, catégories, stock
- ✅ **Recherche et filtres** par nom, catégorie, disponibilité
- ✅ **Intégration automatique** dans la boutique

## 🏆 Clubs disponibles

| Club | Slug | Produits |
|------|------|----------|
| Olympique de Marseille | `olympique-de-marseille` | 15 |
| Paris Saint-Germain | `paris-saint-germain` | 15 |
| Olympique Lyonnais | `olympique-lyonnais` | 15 |

**Total : 45 produits**

## 📦 Structure des produits

```javascript
{
    id: 'om-1',
    nom: 'Maillot Domicile 2024/25',
    prix: 89.99,
    image: 'https://boutique.om.fr/...',
    description: 'Maillot officiel domicile saison 2024/25',
    categorie: 'Maillots',
    stock: 150,
    disponible: true
}
```

## 🛠️ Fonctions disponibles

### `getProduitsClub(clubSlug, limite = 15)`

Récupère les produits d'un club spécifique.

```javascript
const produits = getProduitsClub('olympique-de-marseille', 15);
console.log(produits.length); // 15
```

### `rechercherProduits(query, clubSlug = null)`

Recherche des produits par nom ou description.

```javascript
const maillots = rechercherProduits('maillot');
const maillotsOM = rechercherProduits('maillot', 'olympique-de-marseille');
```

### `getProduitsParCategorie(clubSlug, categorie)`

Filtre les produits par catégorie.

```javascript
const maillots = getProduitsParCategorie('olympique-de-marseille', 'Maillots');
const accessoires = getProduitsParCategorie('paris-saint-germain', 'Accessoires');
```

### `getCategoriesClub(clubSlug)`

Récupère toutes les catégories disponibles pour un club.

```javascript
const categories = getCategoriesClub('olympique-de-marseille');
// ['Maillots', 'Accessoires', 'Vêtements']
```

## 📊 Catégories de produits

- **Maillots** : Domicile, Extérieur, Third
- **Vêtements** : Survêtements, Sweat, Short, T-Shirt
- **Accessoires** : Écharpe, Casquette, Ballon, Gourde, Sac, Drapeau, Porte-clés, Mug, Chaussettes

## 🚀 Intégration dans l'app

Le module est automatiquement chargé dans `app-universal-simple.html` :

```html
<script src="🛍️_SCRAPER_PRODUITS_CLUBS.js"></script>
```

Les produits scrapés s'affichent **automatiquement** dans la boutique après les produits phares (e-SIM et Mastercard).

## 🎯 Exemple d'utilisation

```javascript
// Récupérer les produits OM
const produitsOM = getProduitsClub('olympique-de-marseille');

// Afficher uniquement les maillots
const maillots = produitsOM.filter(p => p.categorie === 'Maillots');

// Rechercher tous les produits contenant "maillot"
const resultatsMaillot = rechercherProduits('maillot');

// Vérifier la disponibilité
const disponibles = produitsOM.filter(p => p.disponible);
```

## ⚙️ Configuration

Pour ajouter de nouveaux clubs, modifiez le fichier `🛍️_SCRAPER_PRODUITS_CLUBS.js` :

```javascript
PRODUITS_CLUBS_SCRAPES['nouveau-club'] = [
    {
        id: 'nc-1',
        nom: 'Produit 1',
        prix: 49.99,
        // ... (max 15 produits)
    }
];
```

## 📈 Statistiques

- **Clubs** : 3
- **Produits totaux** : 45
- **Limite par club** : 15
- **Catégories** : 3 (Maillots, Vêtements, Accessoires)

## 🔮 Évolutions prévues

1. ⏳ **Scraping réel** via API ou web scraping automatique
2. ⏳ **Plus de clubs** (353 clubs prévus)
3. ⏳ **Images réelles** depuis les boutiques officielles
4. ⏳ **Stock en temps réel** via API
5. ⏳ **Promotions et réductions** automatiques

## 🐛 Problèmes connus

- ✅ Aucun problème connu actuellement
- ✅ Toutes les fonctions testées et validées

## 📝 Notes techniques

- **Limite stricte** : 15 produits maximum par club
- **Normalisation des slugs** : Gestion automatique des formats (espaces, +, _)
- **Fallback** : Produits classiques si aucun produit scrapé trouvé
- **Performance** : Chargement instantané (données en mémoire)

---

**Dernière mise à jour** : 2025-01-15  
**Version** : 1.0.0  
**Statut** : ✅ Opérationnel
