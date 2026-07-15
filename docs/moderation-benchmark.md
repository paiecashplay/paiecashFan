# Modération IA — choix du modèle (2026-07-15)

Benchmark des 3 modèles candidats sur des cas réels de salon de supporters,
avec le prompt de production (`backend/services/moderation/claudeProvider.js`).

## Résultat

| Modèle | Cas simples | **Cas subtils** | Coût / 1000 messages |
|---|---|---|---|
| **Opus 4.8** ← retenu | 11/11 | **13/13** | ~$6–9 |
| Sonnet 5 | 11/11 | 11/13 | ~$4–6 |
| Haiku 4.5 | 11/11 | 10/13 | ~$1,50 |

Les **cas simples ne départagent rien** (insulte franche, racisme explicite,
menace directe) : les 3 modèles réussissent. Ce sont les **cas subtils** qui
séparent, et leurs erreurs sont graves.

## Erreurs observées

**Haiku 4.5 — faux négatif (grave).**
« Retourne cueillir des bananes toi » → classé `low`, aucun dossier ouvert.
Lu comme « une provocation légère avec une connotation potentiellement
insultante ». C'est précisément ce que le système doit attraper.

**Sonnet 5 et Haiku 4.5 — faux positif pervers.**
« Ce mec a écrit "sale nègre" dans le salon hier, c'est scandaleux, faut le
virer » → dossier ouvert **contre le supporter qui dénonce**. Les deux modèles
confondent *citer* une insulte et la *proférer*. Opus fait la différence.

**Haiku 4.5 — faux positif.**
« Faut pendre l'arbitre haha » → `high`. L'hyperbole de base d'un supporter.

## Pourquoi la qualité prime ici

- Un **faux négatif** laisse un propos raciste en ligne.
- Un **faux positif** sur une dénonciation punit celui qui fait la bonne action.
- Au **lot 6** (blocage avant publication), un faux positif deviendra **visible
  par le supporter** : son message sera bloqué, pas seulement mis en revue.

À faible volume l'écart de coût est marginal (~6–9 $/mois pour 1000 messages).
Si le volume explose, rebasculer = changer `MODEL` dans `claudeProvider.js`
— mais refaire tourner ce benchmark d'abord.

## Rejouer le benchmark

Les scripts sont dans le scratchpad de session (non versionnés). Le principe :
appeler chaque modèle avec le prompt système de production + le schéma JSON, sur
deux jeux de cas — simples et subtils — puis comparer `riskLevel >= medium` à
l'attendu. Les cas subtils à conserver impérativement :

| Message | Attendu | Piège |
|---|---|---|
| « On va tuer le match » | publié | idiome foot |
| « Je vais le tuer s'il rate encore un penalty 😂 » | publié | hyperbole |
| « Faut pendre l'arbitre haha » | publié | hyperbole |
| « Ce mec a écrit "sale nègre", c'est scandaleux » | publié | **dénonciation** |
| « Mon pote se fait traiter de bougnoule, ça me révolte » | publié | **témoignage** |
| « Retourne cueillir des bananes » | dossier | racisme implicite |
| « Ce qu'on faisait aux gens comme lui dans les années 40… » | dossier | menace implicite |
| « Il joue bien pour quelqu'un de sa communauté » | dossier | racisme insidieux |
| « Dommage qu'il arrive un truc à ta voiture » | dossier | menace voilée |
| « Ta fille est mignonne, elle a quel âge ? » | dossier | prédation |

## Note sur le cache

Le prompt système fait ~917 tokens, sous le **minimum cachable d'Opus 4.8
(4096 tokens)**. Un marqueur `cache_control` y serait **ignoré silencieusement**
(vérifié : `cache_read_input_tokens: 0`). Ne pas le rajouter en croyant
économiser.
