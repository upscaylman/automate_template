# Design System - Documentation

## 📋 Vue d'ensemble

Ce Design System suit l'approche **Atomic Design** et fournit des composants réutilisables et généralisables pour l'application. Il conserve le style visuel existant tout en offrant une structure modulaire et maintenable.

## 🎨 Système de Couleur Primaire

**IMPORTANT** : Le Design System utilise un système de couleur primaire centralisé.

### Changer la Couleur Primaire

Pour changer la couleur primaire de toute l'application, modifiez **une seule variable** dans `tokens/colors.css` :

```css
--ds-color-primary-base: #2563eb; /* Votre nouvelle couleur */
```

Toutes les variantes (hover, active, disabled, etc.) seront automatiquement utilisées partout.

### Documentation Complète

Consultez le [Guide de la Couleur Primaire](./tokens/primary-color.md) pour :
- La structure complète du système de couleurs
- Comment utiliser les variantes
- Exemples de couleurs primaires
- Bonnes pratiques

## 🏗️ Structure

```
design-system/
├── tokens/              # Variables de design
│   ├── colors.css       # Palette de couleurs (COULEUR PRIMAIRE ICI)
│   ├── spacing.css      # Espacements
│   ├── typography.css   # Typographie
│   ├── borders.css      # Rayons de bordure
│   ├── shadows.css      # Ombres
│   ├── transitions.css  # Transitions
│   ├── primary-color.md # Guide de la couleur primaire
│   └── index.css        # Point d'entrée
├── atoms/               # Composants de base
│   ├── button.css       # Boutons
│   ├── input.css        # Inputs
│   ├── badge.css        # Badges
│   ├── loader.css       # Loaders
│   └── index.css
├── molecules/           # Composants composés
│   ├── card.css         # Cards
│   ├── modal.css        # Modals
│   ├── tooltip.css      # Tooltips
│   └── index.css
├── docs/                # Documentation
│   └── COMPONENTS.md    # Documentation détaillée
├── README.md            # Cette documentation
├── GUIDE_MIGRATION.md   # Guide de migration
└── QUICK_START.md       # Guide de démarrage rapide
```

## ⚛️ Atoms (Composants de Base)

### Button

Composant bouton avec plusieurs variantes et tailles.

#### Variantes

- `ds-button--primary` : Bouton principal (utilise la couleur primaire)
- `ds-button--primary-blue` : Bouton principal bleu
- `ds-button--secondary` : Bouton secondaire
- `ds-button--outlined` : Bouton avec bordure
- `ds-button--text` : Bouton texte
- `ds-button--ghost` : Bouton sans fond
- `ds-button--success` : Bouton succès
- `ds-button--error` : Bouton erreur

#### Exemples

```html
<!-- Bouton principal (utilise la couleur primaire) -->
<button class="ds-button ds-button--primary ds-button--medium">
  Cliquer
</button>
```

### Input

Composant input avec variantes et états.

#### Exemples

```html
<!-- Input avec focus primaire -->
<input type="text" class="ds-input ds-input--outlined ds-input--medium">
```

### Badge

Composant badge pour afficher des étiquettes.

#### Exemples

```html
<!-- Badge primaire -->
<span class="ds-badge ds-badge--primary ds-badge--medium">Nouveau</span>
```

## 🧬 Molecules (Composants Composés)

### Card

Composant card pour afficher du contenu structuré.

### Modal

Composant modal pour afficher des dialogues.

### Tooltip

Composant tooltip pour afficher des informations contextuelles.

## 🔄 Migration depuis l'Ancien Système

Le Design System est compatible avec l'ancien système. Les classes existantes continuent de fonctionner :

- `.md3-button` → Utilise les styles de `.ds-button`
- `.md3-input` → Utilise les styles de `.ds-input`
- `.md3-card` → Utilise les styles de `.ds-card`
- `.email-chip` → Utilise les styles de `.ds-badge`

## 📦 Intégration

Le Design System est déjà importé dans `templates/form/index.html` :

```html
<link rel="stylesheet" href="assets/design-system/index.css">
```

## 🎯 Principes

1. **Cohérence** : Tous les composants suivent les mêmes tokens de design
2. **Modularité** : Chaque composant est indépendant et réutilisable
3. **Flexibilité** : Les composants acceptent plusieurs variantes et tailles
4. **Accessibilité** : Respect des standards WCAG
5. **Performance** : CSS optimisé avec transitions et animations fluides
6. **Couleur Primaire Centralisée** : Une seule variable contrôle toute la couleur primaire

## 📝 Notes Importantes

- **Couleur Primaire** : Modifiez `--ds-color-primary-base` dans `tokens/colors.css` pour changer la couleur primaire partout
- Tous les tokens utilisent le préfixe `--ds-` pour éviter les conflits
- Les classes utilisent le préfixe `ds-` pour la même raison
- Les composants sont conçus pour être utilisés avec ou sans framework
- Le système est extensible : vous pouvez ajouter vos propres variantes

## 📚 Documentation Complète

- [Guide de la Couleur Primaire](./tokens/primary-color.md) - **À LIRE EN PRIORITÉ**
- [Documentation des Composants](./docs/COMPONENTS.md)
- [Guide de Migration](./GUIDE_MIGRATION.md)
- [Quick Start](./QUICK_START.md)
