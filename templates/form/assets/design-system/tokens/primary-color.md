# Guide de la Couleur Primaire

## 🎨 Système de Couleur Primaire Centralisé

Le Design System utilise un système de couleur primaire centralisé qui garantit la cohérence visuelle dans toute l'application.

## 📋 Structure

### Couleur de Base

La couleur primaire de base est définie dans `tokens/colors.css` :

```css
--ds-color-primary-base: #b71c1c;
```

**Pour changer la couleur primaire**, modifiez uniquement cette variable. Toutes les variantes seront automatiquement utilisées.

### Échelle Complète (50-900)

Le système fournit une échelle complète de variantes :

```css
--ds-color-primary-50:   /* Très clair - pour fonds subtils */
--ds-color-primary-100:  /* Clair - pour containers */
--ds-color-primary-200:  /* Légèrement clair */
--ds-color-primary-300:  /* Clair - pour états disabled */
--ds-color-primary-400:  /* Moyen-clair */
--ds-color-primary-500:  /* COULEUR PRINCIPALE */
--ds-color-primary-600:  /* Moyen-foncé - pour hover */
--ds-color-primary-700:  /* Foncé - pour active */
--ds-color-primary-800:  /* Très foncé */
--ds-color-primary-900:  /* Maximum foncé - pour texte */
```

### Variables Sémantiques

Pour un usage plus simple, utilisez les variables sémantiques :

```css
--ds-color-primary          /* Couleur principale */
--ds-color-primary-light    /* Version claire */
--ds-color-primary-dark     /* Version foncée */
--ds-color-on-primary       /* Texte sur fond primaire (blanc) */
--ds-color-primary-container /* Fond clair avec texte primaire */
```

### États Interactifs

Variables pré-définies pour les états :

```css
--ds-color-primary-hover    /* État hover */
--ds-color-primary-active   /* État actif/pressé */
--ds-color-primary-focus    /* État focus */
--ds-color-primary-disabled /* État désactivé */
```

## 🎯 Utilisation dans les Composants

### Boutons

```css
/* Bouton primaire */
.ds-button--primary {
  background: var(--ds-gradient-primary);
  color: var(--ds-color-on-primary);
}

.ds-button--primary:hover {
  background-color: var(--ds-color-primary-hover);
}
```

### Inputs

```css
/* Input avec focus primaire */
.ds-input:focus {
  border-color: var(--ds-color-primary);
  box-shadow: 0 0 0 3px var(--ds-color-primary-shadow-light);
}
```

### Badges

```css
/* Badge primaire */
.ds-badge--primary {
  background-color: var(--ds-color-primary-container);
  color: var(--ds-color-on-primary-container);
}
```

### Cards

```css
/* Card avec accent primaire */
.ds-card--primary {
  border-left: 4px solid var(--ds-color-primary);
}
```

## 🔄 Changer la Couleur Primaire

### Méthode 1 : Modifier la Variable de Base

Dans `tokens/colors.css`, changez :

```css
--ds-color-primary-base: #2563eb; /* Nouvelle couleur bleue */
```

Toutes les variantes seront automatiquement mises à jour.

### Méthode 2 : Redéfinir Toutes les Variantes

Si vous avez besoin d'un contrôle total, redéfinissez toutes les variantes :

```css
:root {
  --ds-color-primary-base: #2563eb;
  --ds-color-primary-50: #eff6ff;
  --ds-color-primary-100: #dbeafe;
  --ds-color-primary-200: #bfdbfe;
  --ds-color-primary-300: #93c5fd;
  --ds-color-primary-400: #60a5fa;
  --ds-color-primary-500: #2563eb; /* Base */
  --ds-color-primary-600: #1d4ed8;
  --ds-color-primary-700: #1e40af;
  --ds-color-primary-800: #1e3a8a;
  --ds-color-primary-900: #1e293b;
}
```

## 📊 Exemples de Couleurs Primaires

### Rouge (actuel)
```css
--ds-color-primary-base: #b71c1c;
```

### Bleu
```css
--ds-color-primary-base: #2563eb;
```

### Vert
```css
--ds-color-primary-base: #22c55e;
```

### Violet
```css
--ds-color-primary-base: #7c3aed;
```

### Orange
```css
--ds-color-primary-base: #f59e0b;
```

## ✅ Bonnes Pratiques

1. **Utilisez toujours les variables** : Ne codez jamais les couleurs en dur
2. **Utilisez les variables sémantiques** : Préférez `--ds-color-primary-hover` à `--ds-color-primary-600`
3. **Respectez la hiérarchie** : Utilisez les bonnes variantes pour chaque contexte
4. **Testez le contraste** : Assurez-vous que le texte est lisible sur les fonds

## 🔗 Références

- [Material Design 3 - Color System](https://m3.material.io/styles/color/the-color-system/overview)
- [Documentation des Composants](../docs/COMPONENTS.md)

