# Configuration de la prévisualisation PDF

## Vue d'ensemble

Le système de prévisualisation a été modifié pour afficher des PDFs au lieu de documents Word HTML. Pour que cela fonctionne, vous devez configurer la conversion Word vers PDF.

## Options de configuration

### Option 1 : Génération PDF directe depuis le serveur (Recommandé)

La meilleure solution pour garder la mise en page exacte est de modifier votre workflow n8n pour qu'il génère directement un PDF au lieu d'un Word, ou qu'il génère les deux formats.

**Avantages :**
- Mise en page exacte garantie
- Pas de dépendance externe
- Performance optimale

**Comment faire :**
1. Modifiez votre workflow n8n pour ajouter une étape de conversion Word → PDF
2. Utilisez un nœud comme "Convert File" ou un script qui utilise LibreOffice ou un autre outil de conversion
3. Retournez le PDF en base64 dans la réponse JSON avec `format: 'pdf'`

### Option 2 : Utilisation d'une API de conversion externe

Si vous ne pouvez pas modifier le serveur, vous pouvez utiliser une API de conversion externe.

#### ConvertAPI (Recommandé)

1. Créez un compte sur [ConvertAPI](https://www.convertapi.com/)
2. Obtenez votre clé API gratuite
3. Modifiez le fichier `assets/js/core/api.js` :
   - Trouvez la ligne `const CONVERT_API_KEY = '';`
   - Remplacez par votre clé API : `const CONVERT_API_KEY = 'votre_cle_api';`

**Limitations :**
- Plan gratuit : 25 conversions par jour
- Plan payant : conversions illimitées

#### CloudConvert

1. Créez un compte sur [CloudConvert](https://cloudconvert.com/)
2. Obtenez votre clé API
3. Modifiez la fonction `convertWordToPdf` dans `assets/js/core/api.js` pour utiliser l'API CloudConvert

## Fonctionnement actuel

Le système essaie dans cet ordre :

1. **Génération PDF directe** : Demande au serveur de générer un PDF (si `format: 'pdf'` est supporté)
2. **Conversion via API** : Si disponible, utilise une API de conversion externe
3. **Fallback HTML** : Si aucune des options précédentes n'est disponible, affiche une prévisualisation HTML (ancienne méthode)

## Test

Pour tester la prévisualisation PDF :

1. Remplissez le formulaire
2. Cliquez sur "Prévisualiser"
3. Le PDF devrait s'afficher avec des contrôles de navigation (précédent/suivant, zoom)

Si le PDF ne s'affiche pas, vérifiez :
- Que PDF.js est chargé (vérifiez la console du navigateur)
- Que le serveur génère des PDFs ou qu'une API de conversion est configurée
- Les messages d'erreur dans la console

## Notes techniques

- PDF.js est chargé via CDN (Mozilla)
- Le worker PDF.js est configuré automatiquement
- La navigation dans le PDF (pages, zoom) est disponible
- Le PDF conserve la mise en page exacte du document Word original

