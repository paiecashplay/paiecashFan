# LIRE EN PREMIER - ARCHITECTURE MICROSERVICES

## TU AS DEMANDE UNE ARCHITECTURE MICROSERVICES

Tu veux que **chaque module soit autonome** et puisse être utilisé :
- **En iframe** : `<iframe src="https://wallet.paiecashfan.com"></iframe>`
- **En SDK JavaScript** : `PaieCashFan.Wallet.init({ container: '#wallet' })`
- **En API REST** : `GET https://api.paiecashfan.com/wallet/balance/123`

---

## CE QUI A ETE CREE AUJOURD'HUI

### 1. Architecture Microservices
**Fichier** : [`ARCHITECTURE_MICROSERVICES_2026.md`](./ARCHITECTURE_MICROSERVICES_2026.md)

**Contenu** :
- 9 microservices autonomes (Wallet, eSIM, Shop, Tickets, Feed, Gamif, Auth, Payment, Legends)
- Chaque microservice a son propre domaine et database
- Chaque microservice expose : iframe + SDK + API REST

---

### 2. Widget Wallet (AUTONOME)
**Fichier** : [`widgets/wallet-widget.html`](./widgets/wallet-widget.html)

**Fonctionnalités** :
- Affichage solde total
- Liste assets (PaieCash, Stablecoins clubs, Cryptos)
- Historique transactions
- Actions : Dépôt, Envoi, Réception
- Communication parent-enfant via postMessage

**Utilisation iframe** :
```html
<iframe 
  src="https://widgets.paiecashfan.com/wallet-widget.html?userId=123"
  width="100%"
  height="600px">
</iframe>
```

---

### 3. SDK JavaScript
**Fichier** : [`sdk/paiecashfan-sdk.js`](./sdk/paiecashfan-sdk.js)

**Utilisation** :
```html
<!-- Charger SDK -->
<script src="https://sdk.paiecashfan.com/paiecashfan-sdk.js"></script>

<!-- Initialiser Wallet -->
<div id="wallet"></div>
<script>
  PaieCashFan.Wallet.init({
    container: '#wallet',
    userId: '123',
    onTransaction: (tx) => console.log(tx)
  });
</script>
```

---

## EXEMPLE : INTEGRER SUR UN SITE CLUB

```html
<!DOCTYPE html>
<html>
<head>
    <title>AS Monaco - Mon Wallet</title>
    <script src="https://sdk.paiecashfan.com/paiecashfan-sdk.js"></script>
</head>
<body>
    <h1>Bienvenue sur AS Monaco</h1>
    <div id="my-wallet"></div>

    <script>
        PaieCashFan.Wallet.init({
            container: '#my-wallet',
            userId: '123',
            theme: 'red'
        });
    </script>
</body>
</html>
```

---

## FICHIERS CREES

- [`ARCHITECTURE_MICROSERVICES_2026.md`](./ARCHITECTURE_MICROSERVICES_2026.md) - Architecture complète
- [`widgets/wallet-widget.html`](./widgets/wallet-widget.html) - Widget Wallet autonome
- [`sdk/paiecashfan-sdk.js`](./sdk/paiecashfan-sdk.js) - SDK JavaScript
- [`examples/integration-complete.html`](./examples/integration-complete.html) - Exemple intégration

---

**Version** : 1.0  
**Date** : 28 Décembre 2025  

**Prochaine étape** : Créer les widgets manquants (eSIM, Shop, Tickets) !
