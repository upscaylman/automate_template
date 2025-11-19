# Documentation des Composants

## 📚 Guide Complet des Composants

### Table des Matières

1. [Button](#button)
2. [Input](#input)
3. [Badge](#badge)
4. [Loader](#loader)
5. [Card](#card)
6. [Modal](#modal)
7. [Tooltip](#tooltip)

---

## Button

### Description

Composant bouton avec plusieurs variantes, tailles et états.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-button` | Classe de base (requise) | - |
| `ds-button--primary` | Variante primaire (gradient rouge) | - |
| `ds-button--primary-blue` | Variante primaire bleue | - |
| `ds-button--secondary` | Variante secondaire | - |
| `ds-button--outlined` | Bouton avec bordure | - |
| `ds-button--text` | Bouton texte | - |
| `ds-button--ghost` | Bouton sans fond | - |
| `ds-button--success` | Bouton succès | - |
| `ds-button--error` | Bouton erreur | - |
| `ds-button--small` | Taille petite (36px) | - |
| `ds-button--medium` | Taille moyenne (44px) | - |
| `ds-button--large` | Taille grande (52px) | - |
| `ds-button--state-layer` | Active le state layer MD3 | - |
| `ds-button--press-effect` | Active l'effet de pression | - |
| `ds-button--icon-only` | Bouton avec icône uniquement | - |

### Exemples d'Utilisation

#### Bouton Principal

```html
<button class="ds-button ds-button--primary ds-button--medium">
  Cliquer
</button>
```

#### Bouton avec Icône

```html
<button class="ds-button ds-button--primary ds-button--medium">
  <span class="ds-button__icon material-icons">add</span>
  Ajouter
</button>
```

#### Bouton Outlined

```html
<button class="ds-button ds-button--outlined ds-button--medium">
  Annuler
</button>
```

#### Bouton Disabled

```html
<button class="ds-button ds-button--primary ds-button--medium" disabled>
  Désactivé
</button>
```

### États

- **Hover** : Ombre augmentée, légère translation
- **Active** : Scale réduit, ombre normale
- **Disabled** : Opacité 50%, curseur not-allowed
- **Focus** : Outline pour l'accessibilité

---

## Input

### Description

Composant input avec variantes, tailles et support des icônes.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-input` | Classe de base (requise) | - |
| `ds-input--outlined` | Variante avec bordure (défaut) | - |
| `ds-input--filled` | Variante avec fond | - |
| `ds-input--underlined` | Variante avec ligne | - |
| `ds-input--small` | Taille petite (36px) | - |
| `ds-input--medium` | Taille moyenne (44px) | - |
| `ds-input--large` | Taille grande (52px) | - |

### Composants Associés

- `ds-input-label` : Label pour l'input
- `ds-input-label--required` : Label avec astérisque
- `ds-input-help` : Texte d'aide
- `ds-input-error` : Message d'erreur
- `ds-input-wrapper` : Conteneur pour input avec icône
- `ds-input__icon` : Icône dans l'input
- `ds-textarea` : Textarea (même classes que input)
- `ds-select` : Select (même classes que input)

### Exemples d'Utilisation

#### Input Simple

```html
<input type="text" class="ds-input ds-input--outlined ds-input--medium" placeholder="Nom">
```

#### Input avec Label

```html
<label class="ds-input-label">Email</label>
<input type="email" class="ds-input ds-input--outlined ds-input--medium">
```

#### Input avec Icône

```html
<div class="ds-input-wrapper">
  <input type="text" class="ds-input ds-input--outlined ds-input--medium" placeholder="Rechercher">
  <span class="ds-input__icon material-icons">search</span>
</div>
```

#### Input avec Validation

```html
<label class="ds-input-label ds-input-label--required">Email</label>
<input type="email" class="ds-input ds-input--outlined ds-input--medium" required>
<span class="ds-input-error">Email invalide</span>
```

### États

- **Hover** : Bordure plus foncée
- **Focus** : Bordure primaire, ombre légère
- **Invalid** : Bordure rouge
- **Disabled** : Fond gris, texte désactivé

---

## Badge

### Description

Composant badge pour afficher des étiquettes, compteurs ou statuts.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-badge` | Classe de base (requise) | - |
| `ds-badge--primary` | Variante primaire | - |
| `ds-badge--secondary` | Variante secondaire | - |
| `ds-badge--success` | Variante succès | - |
| `ds-badge--error` | Variante erreur | - |
| `ds-badge--warning` | Variante avertissement | - |
| `ds-badge--info` | Variante info | - |
| `ds-badge--outlined` | Badge avec bordure | - |
| `ds-badge--solid` | Badge avec fond solide | - |
| `ds-badge--small` | Taille petite (18px) | - |
| `ds-badge--medium` | Taille moyenne (20px) | - |
| `ds-badge--large` | Taille grande (24px) | - |
| `ds-badge--dot` | Badge avec point | - |
| `ds-badge--pulse` | Animation pulse | - |
| `ds-badge--icon-only` | Badge avec icône uniquement | - |

### Exemples d'Utilisation

#### Badge Simple

```html
<span class="ds-badge ds-badge--primary ds-badge--medium">Nouveau</span>
```

#### Badge avec Icône

```html
<span class="ds-badge ds-badge--success ds-badge--medium">
  <span class="ds-badge__icon material-icons">check</span>
  Validé
</span>
```

#### Badge Compteur

```html
<span class="ds-badge ds-badge--error ds-badge--dot ds-badge--medium">3</span>
```

---

## Loader

### Description

Composant loader pour afficher des états de chargement.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-loader` | Classe de base (requise) | - |
| `ds-loader--spinner` | Variante spinner (défaut) | - |
| `ds-loader--dots` | Variante points | - |
| `ds-loader--pulse` | Variante pulse | - |
| `ds-loader--skeleton` | Variante skeleton | - |
| `ds-loader--small` | Taille petite (16px) | - |
| `ds-loader--medium` | Taille moyenne (24px) | - |
| `ds-loader--large` | Taille grande (40px) | - |
| `ds-loader--xlarge` | Taille extra grande (64px) | - |
| `ds-loader--primary` | Couleur primaire | - |
| `ds-loader--primary-blue` | Couleur bleue | - |
| `ds-loader--white` | Couleur blanche | - |
| `ds-loader-container` | Conteneur avec texte | - |
| `ds-loader-overlay` | Overlay plein écran | - |

### Exemples d'Utilisation

#### Spinner Simple

```html
<div class="ds-loader ds-loader--medium ds-loader--primary"></div>
```

#### Loader avec Texte

```html
<div class="ds-loader-container">
  <div class="ds-loader ds-loader--large ds-loader--primary"></div>
  <p class="ds-loader__text">Chargement en cours...</p>
</div>
```

#### Skeleton Loader

```html
<div class="ds-loader ds-loader--skeleton ds-loader--text"></div>
```

---

## Card

### Description

Composant card pour afficher du contenu structuré.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-card` | Classe de base (requise) | - |
| `ds-card--elevated` | Variante avec ombre (défaut) | - |
| `ds-card--outlined` | Variante avec bordure | - |
| `ds-card--filled` | Variante avec fond | - |
| `ds-card--interactive` | Card cliquable | - |
| `ds-card--compact` | Padding réduit | - |
| `ds-card--comfortable` | Padding augmenté | - |
| `ds-card__header` | En-tête de la card | - |
| `ds-card__header-icon` | Icône dans l'en-tête | - |
| `ds-card__header-content` | Contenu de l'en-tête | - |
| `ds-card__header-title` | Titre de l'en-tête | - |
| `ds-card__header-subtitle` | Sous-titre de l'en-tête | - |
| `ds-card__body` | Corps de la card | - |
| `ds-card__footer` | Pied de la card | - |
| `ds-card__footer--actions` | Actions dans le pied | - |
| `ds-card__media` | Image/média de la card | - |

### Exemples d'Utilisation

#### Card Simple

```html
<div class="ds-card ds-card--elevated">
  <div class="ds-card__body">
    <p>Contenu de la card</p>
  </div>
</div>
```

#### Card Complète

```html
<div class="ds-card ds-card--elevated">
  <div class="ds-card__header">
    <div class="ds-card__header-icon">
      <span class="material-icons">person</span>
    </div>
    <div class="ds-card__header-content">
      <h3 class="ds-card__header-title">Titre</h3>
      <p class="ds-card__header-subtitle">Sous-titre</p>
    </div>
  </div>
  <div class="ds-card__body">
    <p>Contenu</p>
  </div>
  <div class="ds-card__footer">
    <div class="ds-card__footer--actions">
      <button class="ds-button ds-button--text">Annuler</button>
      <button class="ds-button ds-button--primary">Valider</button>
    </div>
  </div>
</div>
```

---

## Modal

### Description

Composant modal pour afficher des dialogues.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-modal-overlay` | Overlay du modal (requis) | - |
| `ds-modal` | Conteneur du modal (requis) | - |
| `ds-modal--small` | Taille petite (400px) | - |
| `ds-modal--medium` | Taille moyenne (600px) | - |
| `ds-modal--large` | Taille grande (800px) | - |
| `ds-modal--xlarge` | Taille extra grande (1200px) | - |
| `ds-modal--fullscreen` | Plein écran | - |
| `ds-modal__header` | En-tête du modal | - |
| `ds-modal__header-content` | Contenu de l'en-tête | - |
| `ds-modal__header-icon` | Icône dans l'en-tête | - |
| `ds-modal__header-text` | Texte de l'en-tête | - |
| `ds-modal__header-title` | Titre de l'en-tête | - |
| `ds-modal__header-subtitle` | Sous-titre de l'en-tête | - |
| `ds-modal__header-close` | Bouton de fermeture | - |
| `ds-modal__body` | Corps du modal | - |
| `ds-modal__body--scrollable` | Corps scrollable | - |
| `ds-modal__body--no-padding` | Corps sans padding | - |
| `ds-modal__footer` | Pied du modal | - |
| `ds-modal__footer--actions` | Actions dans le pied | - |

### Exemples d'Utilisation

#### Modal Simple

```html
<div class="ds-modal-overlay">
  <div class="ds-modal ds-modal--medium">
    <div class="ds-modal__header">
      <div class="ds-modal__header-content">
        <div class="ds-modal__header-icon">
          <span class="material-icons">info</span>
        </div>
        <div class="ds-modal__header-text">
          <h2 class="ds-modal__header-title">Titre</h2>
        </div>
      </div>
      <button class="ds-modal__header-close">
        <span class="material-icons">close</span>
      </button>
    </div>
    <div class="ds-modal__body">
      <p>Contenu</p>
    </div>
    <div class="ds-modal__footer">
      <button class="ds-button ds-button--text">Annuler</button>
      <div class="ds-modal__footer--actions">
        <button class="ds-button ds-button--primary">Valider</button>
      </div>
    </div>
  </div>
</div>
```

### JavaScript

Pour gérer l'ouverture/fermeture :

```javascript
// Ouvrir
document.querySelector('.ds-modal-overlay').classList.remove('ds-modal-overlay--hidden');

// Fermer
document.querySelector('.ds-modal-overlay').classList.add('ds-modal-overlay--hidden');
```

---

## Tooltip

### Description

Composant tooltip pour afficher des informations contextuelles.

### Props / Classes CSS

| Classe | Description | Valeurs possibles |
|--------|------------|-------------------|
| `ds-tooltip` | Classe de base (requise) | - |
| `ds-tooltip__trigger` | Élément déclencheur | - |
| `ds-tooltip__content` | Contenu du tooltip (requis) | - |
| `ds-tooltip__content--top` | Position en haut | - |
| `ds-tooltip__content--bottom` | Position en bas (défaut) | - |
| `ds-tooltip__content--left` | Position à gauche | - |
| `ds-tooltip__content--right` | Position à droite | - |
| `ds-tooltip__content--light` | Variante claire | - |
| `ds-tooltip__content--primary` | Variante primaire | - |
| `ds-tooltip__content--multiline` | Texte multiligne | - |
| `ds-tooltip__content--small` | Taille petite | - |
| `ds-tooltip__content--medium` | Taille moyenne | - |
| `ds-tooltip__content--large` | Taille grande | - |

### Exemples d'Utilisation

#### Tooltip Simple

```html
<div class="ds-tooltip">
  <button class="ds-tooltip__trigger">Hover me</button>
  <div class="ds-tooltip__content ds-tooltip__content--bottom">
    Texte du tooltip
  </div>
</div>
```

#### Tooltip avec Position

```html
<div class="ds-tooltip">
  <button class="ds-tooltip__trigger">Top</button>
  <div class="ds-tooltip__content ds-tooltip__content--top">
    Tooltip en haut
  </div>
</div>
```

#### Tooltip Multiligne

```html
<div class="ds-tooltip">
  <button class="ds-tooltip__trigger">Info</button>
  <div class="ds-tooltip__content ds-tooltip__content--bottom ds-tooltip__content--multiline">
    Texte plus long qui peut s'étendre sur plusieurs lignes
  </div>
</div>
```

### JavaScript

Pour afficher/masquer programmatiquement :

```javascript
// Afficher
document.querySelector('.ds-tooltip').classList.add('ds-tooltip--visible');

// Masquer
document.querySelector('.ds-tooltip').classList.remove('ds-tooltip--visible');
```

---

## 🎨 Bonnes Pratiques

1. **Toujours utiliser la classe de base** : Commencez toujours par la classe de base (ex: `ds-button`)
2. **Combiner les classes** : Ajoutez les variantes et tailles selon vos besoins
3. **Respecter la hiérarchie** : Utilisez les composants dans l'ordre logique (atoms → molecules)
4. **Accessibilité** : Assurez-vous d'avoir des labels, des états focus, etc.
5. **Performance** : Évitez d'ajouter trop de classes inutiles

## 🔗 Ressources

- [README Principal](../README.md)
- [Tokens de Design](../tokens/)
- [Exemples d'Intégration](./EXAMPLES.md)

