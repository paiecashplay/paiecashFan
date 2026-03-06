# 🚀 PLAN DE MIGRATION TENCENT CLOUD

## Architecture Finale

```
┌─────────────────────────────────────────────────────┐
│           Tencent Cloud Infrastructure              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐     ┌──────────────┐             │
│  │  Tencent CDN │────▶│   COS Bucket │             │
│  │   (Global)   │     │   (Static)   │             │
│  └──────────────┘     └──────────────┘             │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐     ┌──────────────┐             │
│  │     SCF      │────▶│  TencentDB   │             │
│  │  (API Hono)  │     │   (MySQL)    │             │
│  └──────────────┘     └──────────────┘             │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                  │
│  │     TRTC     │                                  │
│  │  (Streaming) │                                  │
│  └──────────────┘                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Étapes de Déploiement

### Phase 1 : Préparation (10 min)
- [x] Credentials Tencent Cloud (SecretId, SecretKey)
- [ ] Installer Tencent Cloud CLI
- [ ] Configurer les credentials
- [ ] Créer COS Bucket

### Phase 2 : Déploiement Static (20 min)
- [ ] Upload fichiers HTML/CSS/JS vers COS
- [ ] Configurer CDN
- [ ] Tester URL CDN

### Phase 3 : Déploiement Backend (30 min)
- [ ] Créer Serverless Cloud Function
- [ ] Déployer API Hono
- [ ] Configurer TencentDB (ou garder D1 temporairement)
- [ ] Tester API endpoints

### Phase 4 : Configuration TRTC (10 min)
- [ ] Vérifier intégration TRTC
- [ ] Tester streaming end-to-end

### Phase 5 : DNS & Domain (10 min)
- [ ] Pointer paiecashfan.paiecashplay.com vers Tencent CDN
- [ ] Configurer SSL

## Commandes de Déploiement

```bash
# 1. Installer Tencent Cloud CLI
npm install -g @tencent/cloudbase-cli

# 2. Login
tcb login

# 3. Déployer
tcb hosting deploy dist/ -e paiecashfan-prod

# 4. Déployer fonctions
tcb fn deploy --name api --path dist/_worker.js
```

## Coût Estimé

- COS Storage (10GB): ~$0.02/mois
- CDN Traffic (100GB): ~$8/mois
- SCF (1M requests): ~$0.20/mois
- TencentDB (MySQL Mini): ~$15/mois
- TRTC (1000 min/mois): GRATUIT

**TOTAL: ~$23/mois** (vs Cloudflare $25/mois)

