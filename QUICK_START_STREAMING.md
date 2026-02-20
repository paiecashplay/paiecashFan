# 🚀 Quick Start - Streamer sur PaieCashFan en 5 Minutes

## ⚡ Configuration Express

### 1️⃣ Installer OBS Studio (2 min)
- Télécharger : https://obsproject.com/
- Installer et lancer

### 2️⃣ Configurer OBS (1 min)

**Paramètres → Stream** :
- Service : `Custom...`
- Serveur : `rtmps://live.cloudflare.com:443/live/`
- Clé Stream : **Choisir selon votre contenu** ↓

#### 🎮 Pour MATCH (Football, Sports)
```
Clé : 15b3d7301e593a79109aea6634db5737kf892de4999878e88dedfd85d060814e9
```

#### 🛍️ Pour SHOPPING (Vente en Direct)
```
Clé : 9d1eace690be45b4c47fcc0abd658c70k8d85f9dbd83c6f4f2173a293cdc02a19
```

#### 🎤 Pour CREATOR (Analyse, Q&A)
```
Clé : 824cb4417b1ce46bc0995aedbfa4840bk798fcdc79165565c17c67e7ff1a0a991
```

### 3️⃣ Configurer Vidéo (30 sec)

**Paramètres → Output → Streaming** :
- Encoder : `x264` ou `NVENC H.264`
- Bitrate : `4500 Kbps` (1080p 30fps)
- Keyframe Interval : `2`

**Paramètres → Video** :
- Résolution : `1920x1080`
- FPS : `30` (ou 60 pour matchs)

### 4️⃣ Ajouter Sources (1 min)
- Sources → `+` → **Video Capture Device** (Webcam)
- Sources → `+` → **Audio Input Capture** (Micro)
- Sources → `+` → **Display Capture** (Écran) si besoin

### 5️⃣ Streamer ! (30 sec)
1. Cliquez sur **Start Streaming**
2. Attendez 5-10 secondes
3. Ouvrez votre URL de visualisation ↓

---

## 🔗 URLs de Visualisation

### 🎮 Match
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-match.html?id=f892de4999878e88dedfd85d060814e9&type=live

### 🛍️ Shopping
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-shopping.html?id=8d85f9dbd83c6f4f2173a293cdc02a19&type=live

### 🎤 Creator
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/stream-player-creator.html?id=798fcdc79165565c17c67e7ff1a0a991&type=live

### 📺 Page Live Streams
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/live-streams.html

---

## 🎯 Résolution Rapide de Problèmes

### ❌ "Failed to connect"
→ Vérifiez que la clé Stream est correcte (copier-coller)
→ Vérifiez que le serveur est : `rtmps://live.cloudflare.com:443/live/`

### ❌ Stream lag/buffering
→ Réduisez le bitrate : de 4500 → 3000 Kbps
→ Réduisez la résolution : de 1080p → 720p

### ❌ Stream ne s'affiche pas
→ Attendez 10-15 secondes après "Start Streaming"
→ Rafraîchissez la page (F5)
→ Vérifiez que OBS affiche "LIVE" en bas à droite

---

## 📊 Recommandations selon Connexion

| Connexion Upload | Résolution | FPS | Bitrate |
|------------------|------------|-----|---------|
| 3-5 Mbps         | 720p       | 30  | 2500    |
| 5-8 Mbps         | 720p       | 60  | 4000    |
| 8-12 Mbps        | 1080p      | 30  | 4500    |
| 12+ Mbps         | 1080p      | 60  | 6000    |

**Tester votre connexion** : https://www.speedtest.net/

---

## 🆘 Besoin d'aide ?

📖 **Guide complet** : `OBS_STREAMING_GUIDE.md` (dans le projet)
🌐 **Dashboard Cloudflare** : https://dash.cloudflare.com/4a0b3e35f24b28cd17c247aef02dc728/stream
📧 **Email** : etot@paiecash.com

---

**Bon stream ! 🎥🚀**
