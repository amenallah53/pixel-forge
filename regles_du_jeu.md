# Règles du Jeu — SCIENTIA : Les Découvertes Perdues

## 1. Identité du Jeu

- **Titre :** SCIENTIA — Les Découvertes Perdues
- **Genre :** Jeu éducatif d'enquête et de résolution d'énigmes
- **Public :** Adolescents et adultes (à partir de 12 ans)
- **Moteur :** Phaser 4.1.0 (2D) + Three.js 0.184.0 (3D)
- **Plateforme :** Navigateur web (PC)
- **Langues :** Français, English, العربية

---

## 2. Nombre de Joueurs

**Un seul joueur.** Le jeu est conçu pour une expérience individuelle. Aucun mode multijoueur ou en écran partagé n'est disponible.

---

## 3. Durée Estimée

| Niveau | Durée |
|--------|-------|
| Niveau 1 — Le Secret de la Lumière | 20 à 35 minutes |
| Niveau 3 — La Formule de Parfum Perdue | 10 à 20 minutes |
| Niveau 4 — L'Énergie Invisible | 15 à 30 minutes |
| **Total** | **45 à 85 minutes** |

La durée varie selon la rapidité de lecture, la compréhension des concepts scientifiques et l'aisance avec les mécaniques de jeu (glisser-déposer, rotation de miroirs, réglage de curseur).

---

## 4. Déroulement du Jeu

### 4.1 Structure Générale

Le jeu suit un déroulement linéaire en trois niveaux. Chaque niveau est débloqué après la complétion du précédent :

```
Menu principal
  ↓
Niveau 1 : Le Secret de la Lumière (Ibn al-Haytham)
  → Introduction → Expérience (chambre noire) → Observation
    → Labyrinthe de miroirs → Quiz → Écran de fin
  ↓
Niveau 3 : La Formule de Parfum Perdue (Lavoisier)
  → Introduction → Expérience (distillation) → Retour au menu
  ↓
Niveau 4 : L'Énergie Invisible (Faraday)
  → Introduction → Expérience (induction électromagnétique)
    → Quiz → Écran de fin → Retour au menu
```

### 4.2 Écran d'Accueil (Menu Principal)

Le joueur arrive sur un écran avec :
- Le titre **SCIENTIA** et le sous-titre **Les Découvertes Perdues**
- Un sélecteur de langue (Français / English / العربية) en bas de l'écran
- Une frise chronologique illustrant les découvertes (1015 — 1666 — 1774 — 1831 — ????)
- Les boutons des niveaux disponibles :
  - **Niveau 1** — toujours accessible
  - **Niveau 2 / 3** — verrouillés tant que le niveau précédent n'est pas terminé

### 4.3 Déroulement par Niveau

#### Niveau 1 : Le Secret de la Lumière (Ibn al-Haytham — 1015, Le Caire)

**a. Scène d'introduction**
Le Caire, 1015. Ibn al-Haytham est assigné à résidence. Un dialogue s'engage :
le narrateur plante le contexte historique et Ibn al-Haytham explique sa théorie
sur la vision et demande l'aide du joueur. Le joueur clique pour faire avancer
le dialogue.

**b. Expérience de la chambre noire (Camera Obscura)**
Le joueur doit assembler une camera obscura :
1. **Glisser-déposer** : placer une bougie et un boîtier en bois sur leurs
   emplacements cibles.
2. **Observation** : une fois placés, les objets disparaissent pour révéler
   le trajet des rayons lumineux à travers un trou, produisant une image inversée.
3. **Contrôles interactifs** : le joueur peut ajuster la taille du trou (2-20 px)
   et la distance du mur de projection (-70 à +110 px) avec des boutons +/−.
4. Un panneau pédagogique explique le fonctionnement de la chambre noire.
5. Un bouton « Passer à l'explication » permet de sauter l'expérience.

**c. Scène d'observation sur la vision**
Animation de deux rayons lumineux partant d'une bougie, traversant une ouverture
et entrant dans un œil. Des légendes apparaissent successivement :
- « La lumière voyage en ligne droite »
- « Les rayons se croisent à l'ouverture → inversé »
- « La lumière entre dans l'œil → Vision »
- « L'œil n'émet PAS de rayons. Il reçoit la lumière. »

**d. Labyrinthe de miroirs (réflexion)**
Le joueur doit guider un faisceau lumineux vers une cible cristalline :
1. Deux miroirs sont disposés dans la pièce (M1 et M2).
2. **Cliquer** sur un miroir le fait pivoter de 30°.
3. Le faisceau se calcule et se redessine en temps réel.
4. À chaque point de rebond, les angles incident et réfléchi sont affichés
   avec des arcs de couleurs et des degrés.
5. Le joueur doit orienter les miroirs pour que le faisceau atteigne la cible.
6. Un indice apparaît après 3 secondes d'inactivité.
7. Quand le faisceau touche la cible, une clé cachée est révélée.

**e. Quiz**
3 questions à choix multiples sur les concepts abordés.
Chaque bonne réponse rapporte 25 XP.

**f. Écran de fin de niveau**
Affichage de la frise chronologique, du score XP, du fragment d'optique récupéré.

#### Niveau 3 : La Formule de Parfum Perdue (Lavoisier — 1774, Paris)

**a. Scène d'introduction**
Lavoisier explique qu'un ingrédient de parfum précieux a été mélangé à de l'eau
par accident. La distillation permettra de le récupérer.

**b. Expérience de distillation**
Le joueur utilise un **curseur de chaleur** (0-100 %) pour chauffer un ballon :
- **Zone froide** (< 40 %) : rien ne se produit
- **Zone optimale** (40-80 %) : le parfum se vaporise puis se condense,
  la pureté et le niveau de collecte augmentent
- **Zone surchauffée** (> 80 %) : le parfum se contamine, la pureté diminue

Indicateurs visuels : flammes, bulles, vapeur, gouttes, couleur du liquide
(gold → marron). La partie se termine quand le récipient est plein (100 %).
Affichage du score de pureté final. Deux options : retour au menu ou
continuer vers le niveau 4 (s'il est débloqué).

#### Niveau 4 : L'Énergie Invisible (Faraday — 1831, Londres)

**a. Scène d'introduction**
1831. Une ville industrielle s'éteint subitement. Faraday explique que
l'électricité ne se crée pas de rien. Le joueur doit redécouvrir
l'induction électromagnétique.

**b. Expérience de Faraday (induction électromagnétique)**
Expérience guidée en **5 étapes** :

1. **Aimant immobile près de la bobine** → pas de courant
2. **Aimant poussé dans la bobine** → courant positif (aiguille dévie à droite)
3. **Aimant immobile dans la bobine** → plus de courant
4. **Aimant retiré de la bobine** → courant négatif (aiguille dévie à gauche)
5. **Défi d'optimisation** : maximiser le courant (> 7,2 A)

Mécaniques interactives :
- **Glisser-déposer** : l'aimant se déplace avec la souris (physique Matter.js)
- **Boutons +/−** pour le nombre de spires de la bobine (8-28)
- **Bouton** pour insérer/retirer un noyau de fer (augmente le courant de 55 %)
- **Bouton d'indice** : aide contextuelle selon l'étape
- **Bouton de redémarrage** : réinitialise l'expérience
- **Bouton d'accessibilité** : étincelles haute visibilité
- **Commutation des lignes de champ** : affichage visuel du champ magnétique

La progression est automatique : après chaque Observation vient une Explication,
puis le passage à l'étape suivante. Un cercle indicatif montre les 5 étapes
avec coches vertes pour les étapes validées.

**c. Quiz**
3 questions à choix multiples sur l'induction électromagnétique.

**d. Écran de fin de niveau**
La ville est éclairée. Affichage du fragment d'électromagnétisme, du score XP,
et message de mission suivante débloquée.

---

## 5. Actions Possibles

| Action | Où |
|--------|-----|
| Cliquer sur un bouton | Partout (menu, quiz, dialogues...) |
| Glisser-déposer un objet | Chambre noire, expérience de Faraday |
| Cliquer sur un miroir pour le faire pivoter (30°) | Labyrinthe de miroirs |
| Cliquer pour avancer le dialogue | Toutes les scènes d'intro et de réussite |
| Cliquer sur une réponse de quiz | Quiz niveaux 1 et 4 |
| Faire glisser un curseur | Distillation (chaleur) |
| Cliquer sur +/− | Chambre noire (taille trou, distance mur), Faraday (spires) |
| Cliquer pour activer/désactiver un élément | Faraday (noyau de fer, lignes de champ, accessibilité) |
| Cliquer sur un indice | Faraday |
| Cliquer pour passer/sauter une étape | Chambre noire, labyrinthe de miroirs |
| Cliquer pour sélectionner une langue | Menu principal |
| Cliquer pour retourner au menu | Tous les écrans de fin |

---

## 6. Système de Progression

### 6.1 Points d'Expérience (XP)

| Action | XP |
|--------|----|
| Réussite de la chambre noire | +50 |
| Résolution du labyrinthe de miroirs | +50 |
| Distillation réussie | +50 |
| Découverte de Faraday | +50 |
| Chaque bonne réponse au quiz | +25 |

### 6.2 Fragments Scientifiques

Chaque niveau permet de récupérer un « Fragment de science » :

| Niveau | Fragment | Couleur |
|--------|----------|---------|
| 1 — Optique | « La science de la lumière et de la vision » | Or (#ffd700) |
| 3 — Distillation | « Les liquides peuvent être séparés par chauffage… » | Doré (#f2c86f) |
| 4 — Induction | « L'électricité peut être générée par un champ magnétique variable » | Bleu (#55d6ff) |

### 6.3 Déblocage des Niveaux

- **Niveau 1** : toujours accessible
- **Niveau 3** : débloqué après avoir terminé le niveau 1
- **Niveau 4** : débloqué après avoir terminé le niveau 3

La progression est sauvegardée automatiquement dans le navigateur (localStorage).

---

## 7. Conditions de Victoire

### 7.1 Condition de Victoire par Niveau

| Niveau | Condition |
|--------|-----------|
| **Niveau 1** | Placer les deux objets dans la chambre noire + résoudre le labyrinthe de miroirs + répondre au quiz (score quelconque) |
| **Niveau 3** | Collecter 100 % de parfum dans le récipient par distillation (score de pureté quelconque) |
| **Niveau 4** | Compléter les 5 étapes de Faraday (courant > 7,2 A) + répondre au quiz |

### 7.2 Condition de Victoire Globale

Compléter les trois niveaux pour récupérer tous les fragments scientifiques
et voir la frise chronologique intégralement illuminée (1015, 1666, 1774, 1831).

### 7.3 Réinitialisation

Il est possible de réinitialiser l'intégralité de la progression depuis le
système de sauvegarde (suppression du localStorage). Aucune option de
réinitialisation n'est proposée dans l'interface du jeu.

---

## 8. Options de Confiance

- **Sélecteur de langue** : Français, English, العربية (RTL) — accessible depuis le menu principal
- **Boutons « Passer »** : permettent de sauter les expériences et d'accéder directement aux explications ou aux quiz
- **Indices** : disponibles dans les énigmes (labyrinthe de miroirs, expérience de Faraday)
- **Accessibilité** : option d'étincelles à haute visibilité dans l'expérience de Faraday
- **Redémarrage** : possibilité de réinitialiser l'expérience de Faraday
