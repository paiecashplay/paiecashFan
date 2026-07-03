# PaieCashFan — TODO / Chantiers

## 🔐 Sécurité & conformité
- [ ] **Pré-vérification des documents à l'upload (clubs européens)** : au dépôt,
      vérifier automatiquement qu'il s'agit bien :
        - d'une **pièce administrative du club** (Kbis ou équivalent),
        - et d'une **pièce d'identité (CNI/passeport)** du représentant.
      → n'accepter **que des PDF** pour ces clubs. (OCR / classification de document,
      ex : détection de mots-clés « Kbis / SIREN / RCS », ou service tiers de KYB.)
- [ ] Sécuriser rétroactivement les routes `/api/v2/admin/*` avec le middleware
      d'auth (aujourd'hui elles ne vérifient pas le rôle côté serveur — le BO
      super_admin s'appuie sur le front). *(à faire en même temps que le BO club)*
- [ ] RGPD : politique de conservation/suppression des pièces d'identité
      (bucket privé `club-documents`).

## 🏟️ Inscription & BO club (flux représentant de club)
- [x] Phase 1 — Fondation backend (auth, candidature, upload docs bucket privé)
- [x] Phase 2 — Espace `/mon-club` (wizard : club → docs → soumission)
- [ ] Phase 3 — Vérification super_admin (liste candidatures + aperçu docs +
      valider/refuser/demander infos) + **notification email au super_admin**
- [ ] Phase 4 — BO club scopé (`/mon-club/bo`) verrouillé sur `club_id`
- [ ] Phase 5 — Gating (redirections selon statut) & finitions

## ✉️ Infra email (prérequis notifications + confirmations)
- [ ] Brancher un fournisseur SMTP/API (Resend / Brevo / SendGrid) :
        - `RESEND_API_KEY` (+ `RESEND_FROM`) côté backend pour les notifications,
        - SMTP custom dans Supabase Auth pour les emails de confirmation.
- [ ] Réactiver « Confirm email » dans Supabase avant la mise en prod publique.

## 💳 Paiement
- [ ] Checkout PCC (boutique + billetterie) — Crossmint/Stripe + webhooks.
- [ ] Persistance DB du panier billetterie (aujourd'hui localStorage).
