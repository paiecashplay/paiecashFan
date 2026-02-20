# 🎥 Guide Complet : Streamer sur PaieCashFan avec OBS Studio

## 📌 Vue d'ensemble

Ce guide explique comment streamer en direct sur PaieCashFan en utilisant **OBS Studio** et **Cloudflare Stream**.

Vous avez **3 Live Inputs** créés et configurés :
1. **Match** - PSG vs Olympique Marseille
2. **Shopping** - Live Shopping Maillots Signés
3. **Creator** - Analyse Tactique

---

## 🚀 Étape 1 : Installation d'OBS Studio

### Téléchargement
- **Site officiel** : https://obsproject.com/
- **Version recommandée** : OBS Studio 30.0+ (dernière version stable)

### Plateformes supportées
- ✅ Windows 10/11
- ✅ macOS 11+ (Big Sur ou ultérieur)
- ✅ Linux (Ubuntu 20.04+, Fedora, Arch)

### Installation
1. Téléchargez l'installateur pour votre système
2. Exécutez l'installateur
3. Suivez les instructions à l'écran
4. Lancez OBS Studio

---

## ⚙️ Étape 2 : Configuration OBS pour Cloudflare Stream

### 2.1 Ouvrir les Paramètres de Stream

1. Ouvrez **OBS Studio**
2. Cliquez sur **Fichier** → **Paramètres** (ou **Settings**)
3. Sélectionnez l'onglet **Stream** dans le menu de gauche

### 2.2 Configuration du Service

- **Service** : Sélectionnez **"Custom..."** (Service personnalisé)

### 2.3 Choisir votre Live Input

Vous avez 3 Live Inputs disponibles. **Choisissez celui qui correspond à votre contenu** :

---

### 🎮 Option A : MATCH (PSG vs Olympique Marseille)

**Utilisation** : Matchs de football en direct, événements sportifs

**Configuration OBS** :
```
Service    : Custom...
Serveur    : rtmps://live.cloudflare.com:443/live/
Clé Stream : 15b3d7301e593a79109aea6634db5737kf892de4999878e88dedfd85d060814e9
```

**URL de visualisation** :
```
https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/f892de4999878e88dedfd85d060814e9/iframe
```

**Accessible via PaieCashFan** :
```
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-match.html?id=f892de4999878e88dedfd85d060814e9&type=live
```

---

### 🛍️ Option B : SHOPPING (Live Shopping Maillots)

**Utilisation** : Ventes en direct, présentations produits, live shopping

**Configuration OBS** :
```
Service    : Custom...
Serveur    : rtmps://live.cloudflare.com:443/live/
Clé Stream : 9d1eace690be45b4c47fcc0abd658c70k8d85f9dbd83c6f4f2173a293cdc02a19
```

**URL de visualisation** :
```
https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/8d85f9dbd83c6f4f2173a293cdc02a19/iframe
```

**Accessible via PaieCashFan** :
```
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-shopping.html?id=8d85f9dbd83c6f4f2173a293cdc02a19&type=live
```

---

### 🎤 Option C : CREATOR (Analyse Tactique)

**Utilisation** : Analyses tactiques, Q&A, créateurs de contenu, interviews

**Configuration OBS** :
```
Service    : Custom...
Serveur    : rtmps://live.cloudflare.com:443/live/
Clé Stream : 824cb4417b1ce46bc0995aedbfa4840bk798fcdc79165565c17c67e7ff1a0a991
```

**URL de visualisation** :
```
https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/798fcdc79165565c17c67e7ff1a0a991/iframe
```

**Accessible via PaieCashFan** :
```
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-creator.html?id=798fcdc79165565c17c67e7ff1a0a991&type=live
```

---

## 🎬 Étape 3 : Configuration Vidéo et Audio

### 3.1 Paramètres de Sortie (Output)

**Onglet Output** → **Mode Avancé** → **Streaming**

#### Encodeur Vidéo recommandé
- **Encodeur** : `x264` (CPU) ou `NVENC H.264` (GPU NVIDIA)
- **Rate Control** : `CBR` (Constant Bitrate)
- **Bitrate Vidéo** : 
  - 📊 **1080p 60fps** : `6000 Kbps`
  - 📊 **1080p 30fps** : `4500 Kbps`
  - 📊 **720p 60fps** : `4500 Kbps`
  - 📊 **720p 30fps** : `3000 Kbps`
- **Keyframe Interval** : `2 secondes`
- **Preset** : `veryfast` (CPU) ou `Quality` (NVENC)
- **Profile** : `high`
- **Tune** : `zerolatency` (pour live streaming)

#### Encodeur Audio recommandé
- **Audio Bitrate** : `160 Kbps` (recommandé) ou `128 Kbps`
- **Codec** : `AAC`
- **Sample Rate** : `44.1 kHz` ou `48 kHz`

### 3.2 Paramètres Vidéo (Video)

**Onglet Video**

- **Résolution de Base (Canvas)** : `1920x1080` (Full HD)
- **Résolution de Sortie (Output)** : `1920x1080` (ou `1280x720` si bandwidth limité)
- **FPS** :
  - 🎮 **60 FPS** : Pour contenu dynamique (matchs, gaming)
  - 🎤 **30 FPS** : Pour interviews, analyses, live shopping

### 3.3 Paramètres Audio (Audio)

**Onglet Audio**

- **Sample Rate** : `48 kHz` (recommandé pour streaming)
- **Channels** : `Stereo`

---

## 🎨 Étape 4 : Créer vos Scènes et Sources

### 4.1 Scène de Base

1. Dans la section **Scenes**, cliquez sur **+** pour créer une nouvelle scène
2. Nommez-la (ex: "Match PSG", "Live Shopping", "Analyse Tactique")

### 4.2 Ajouter des Sources

#### Source Vidéo (Webcam ou Caméra)
1. Dans **Sources**, cliquez sur **+**
2. Sélectionnez **Video Capture Device** (Périphérique de capture vidéo)
3. Nommez-la (ex: "Webcam HD")
4. Sélectionnez votre caméra
5. Ajustez la résolution (1920x1080 recommandé)

#### Source Affichage/Fenêtre (Capture d'écran)
1. **Display Capture** : Capture tout l'écran
2. **Window Capture** : Capture une fenêtre spécifique (ex: navigateur, jeu)

#### Source Audio (Microphone)
1. Dans **Sources**, cliquez sur **+**
2. Sélectionnez **Audio Input Capture** (Capture d'entrée audio)
3. Nommez-la (ex: "Micro")
4. Sélectionnez votre microphone

#### Ajouter du Texte, Images, Overlays
- **Text** : Ajouter score, nom, timer, etc.
- **Image** : Logo, branding, sponsors
- **Browser Source** : Chat en direct, widgets web

### 4.3 Positionner et Redimensionner

- **Cliquez et glissez** pour déplacer les sources
- **Maintenez Shift** pour conserver les proportions lors du redimensionnement
- **Clic droit** → **Transform** pour rotation, crop, etc.

---

## ▶️ Étape 5 : Lancer votre Stream

### 5.1 Test de Connexion

1. Cliquez sur **Settings** → **Stream**
2. Vérifiez que le **Serveur RTMPS** et la **Clé Stream** sont corrects
3. Cliquez sur **Apply** puis **OK**

### 5.2 Démarrer le Stream

1. Dans l'interface principale d'OBS, cliquez sur **Start Streaming**
2. OBS va se connecter à Cloudflare Stream via RTMPS
3. Attendez 5-10 secondes pour que le stream démarre

### 5.3 Vérifier que le Stream est en direct

**Méthode 1 : Via le Dashboard Cloudflare**
- Ouvrez : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream/inputs
- Vous verrez votre Live Input avec le statut **"Connected"** et le nombre de viewers

**Méthode 2 : Via l'URL de visualisation PaieCashFan**
- Ouvrez l'URL correspondant à votre Live Input (voir section 2.3)
- Exemple pour Match : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-match.html?id=f892de4999878e88dedfd85d060814e9&type=live

**Méthode 3 : Via l'iframe Cloudflare directement**
- Match : https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/f892de4999878e88dedfd85d060814e9/iframe
- Shopping : https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/8d85f9dbd83c6f4f2173a293cdc02a19/iframe
- Creator : https://customer-4a0b3e35f24b28cd17c247aef02dc728.cloudflarestream.com/798fcdc79165565c17c67e7ff1a0a991/iframe

### 5.4 Arrêter le Stream

1. Cliquez sur **Stop Streaming** dans OBS
2. Cloudflare Stream arrêtera automatiquement le Live Input après **10 secondes** d'inactivité
3. Un enregistrement VOD sera créé automatiquement (si `recording.mode = automatic`)

---

## 📊 Étape 6 : Surveiller les Performances

### 6.1 Dans OBS Studio

**Indicateurs en bas à droite de l'interface** :
- 🟢 **CPU Usage** : Doit rester < 80 %
- 🟢 **FPS** : Doit être stable (60 ou 30 selon config)
- 🟢 **Dropped Frames** : Doit rester < 1 %
- 🟢 **Bitrate** : Doit être stable autour de la valeur configurée

### 6.2 Dans Cloudflare Dashboard

**URL** : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream/inputs

**Métriques disponibles** :
- ✅ **Status** : Connected / Disconnected
- 👥 **Concurrent Viewers** : Nombre de viewers en temps réel
- 📈 **Total Views** : Nombre de vues cumulées
- ⏱️ **Stream Duration** : Durée du stream en cours
- 📹 **Recording Status** : Si VOD en cours d'enregistrement

---

## 🔧 Résolution de Problèmes (Troubleshooting)

### ❌ Problème : "Failed to connect to server"

**Causes possibles** :
- Clé Stream incorrecte
- URL serveur incorrecte
- Firewall/Antivirus bloque le port 443
- Connexion Internet instable

**Solutions** :
1. Vérifiez que l'URL serveur est bien : `rtmps://live.cloudflare.com:443/live/`
2. Vérifiez que la clé Stream est correcte (copiez-collez depuis la configuration)
3. Désactivez temporairement votre firewall/antivirus
4. Testez votre connexion Internet (minimum 5 Mbps upload recommandé)
5. Essayez de réduire le bitrate (de 6000 à 3000 Kbps)

### ❌ Problème : Stream lag/buffering pour les viewers

**Causes possibles** :
- Bitrate trop élevé pour votre connexion upload
- CPU surchargé (> 80 %)
- Dropped frames élevé (> 5 %)

**Solutions** :
1. Réduisez le bitrate :
   - De 6000 Kbps → 4500 Kbps
   - De 4500 Kbps → 3000 Kbps
2. Réduisez la résolution :
   - De 1080p → 720p
3. Réduisez les FPS :
   - De 60 FPS → 30 FPS
4. Changez le preset encoder :
   - De `medium` → `veryfast`
   - Ou utilisez NVENC (GPU) au lieu de x264 (CPU)
5. Fermez les autres applications gourmandes (navigateurs, jeux, etc.)

### ❌ Problème : Le stream ne s'affiche pas sur PaieCashFan

**Causes possibles** :
- Le stream n'est pas encore démarré dans OBS
- Délai de propagation (latence 5-15 secondes)
- Mauvais UID dans l'URL

**Solutions** :
1. Vérifiez que le bouton **"Start Streaming"** est bien activé dans OBS
2. Attendez 10-15 secondes après avoir cliqué sur "Start Streaming"
3. Rafraîchissez la page du player (F5)
4. Vérifiez l'UID dans l'URL du player :
   - Match : `f892de4999878e88dedfd85d060814e9`
   - Shopping : `8d85f9dbd83c6f4f2173a293cdc02a19`
   - Creator : `798fcdc79165565c17c67e7ff1a0a991`

### ❌ Problème : Qualité vidéo dégradée

**Causes possibles** :
- Bitrate trop faible
- Résolution trop basse
- Preset encoder trop rapide

**Solutions** :
1. Augmentez le bitrate (si votre connexion le permet) :
   - De 3000 Kbps → 4500 Kbps
   - De 4500 Kbps → 6000 Kbps
2. Augmentez la résolution :
   - De 720p → 1080p
3. Changez le preset encoder (si CPU le permet) :
   - De `veryfast` → `fast` → `medium`
4. Utilisez NVENC (GPU) pour une meilleure qualité à performance égale

---

## 📈 Recommandations de Bitrate selon Connexion

| Connexion Upload | Résolution   | FPS | Bitrate Recommandé |
|------------------|--------------|-----|--------------------|
| 3-5 Mbps         | 720p         | 30  | 2500-3000 Kbps     |
| 5-8 Mbps         | 720p         | 60  | 3500-4500 Kbps     |
| 8-12 Mbps        | 1080p        | 30  | 4500-5000 Kbps     |
| 12+ Mbps         | 1080p        | 60  | 6000-8000 Kbps     |

**Pour tester votre connexion upload** : https://www.speedtest.net/

---

## 🎯 Checklist Avant de Streamer

- ✅ OBS Studio installé et configuré
- ✅ Serveur RTMPS : `rtmps://live.cloudflare.com:443/live/`
- ✅ Clé Stream copiée et collée correctement
- ✅ Résolution et FPS configurés (720p ou 1080p, 30 ou 60 FPS)
- ✅ Bitrate adapté à votre connexion Internet
- ✅ Sources ajoutées (caméra, micro, écran)
- ✅ Test audio (vérifiez que le micro fonctionne)
- ✅ Scène configurée avec overlays, texte, logo
- ✅ Connexion Internet stable (minimum 5 Mbps upload)
- ✅ Pare-feu/antivirus configuré pour autoriser OBS
- ✅ URL de visualisation prête à partager

---

## 🔗 Liens Utiles

### 📚 Documentation
- **OBS Studio** : https://obsproject.com/wiki/
- **Cloudflare Stream** : https://developers.cloudflare.com/stream/

### 🎥 URLs de Visualisation PaieCashFan
- **Match** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-match.html?id=f892de4999878e88dedfd85d060814e9&type=live
- **Shopping** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-shopping.html?id=8d85f9dbd83c6f4f2173a293cdc02a19&type=live
- **Creator** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-creator.html?id=798fcdc79165565c17c67e7ff1a0a991&type=live

### 🌐 Dashboard Cloudflare
- **Live Inputs** : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream/inputs
- **Videos (VOD)** : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream/videos

---

## 💡 Conseils Pro

1. **Testez toujours avant un stream important** : Faites un stream test 30 minutes avant pour vérifier la qualité et la stabilité
2. **Préparez plusieurs scènes** : Créez des scènes "Intro", "Principal", "Pause", "Fin" pour des transitions professionnelles
3. **Utilisez un micro de qualité** : L'audio est plus important que la vidéo. Investissez dans un bon micro USB
4. **Éclairage** : Un bon éclairage améliore considérablement la qualité vidéo (ring light, softbox)
5. **Internet filaire** : Préférez Ethernet à WiFi pour une connexion stable
6. **Dual PC Setup** (avancé) : Utilisez un PC pour le jeu/contenu et un autre pour OBS/streaming
7. **Monitoring** : Gardez un œil sur les métriques OBS et Cloudflare pendant le stream

---

## 🎊 Conclusion

Vous êtes maintenant prêt à streamer sur PaieCashFan avec Cloudflare Stream et OBS Studio !

**En cas de questions ou problèmes** :
- 📧 Email : etot@paiecash.com
- 🌐 Dashboard Cloudflare : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream

**Bon stream ! 🎥🚀**
