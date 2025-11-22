# 🚀 Configurer n8n sur une nouvelle machine

## 🎯 Situation

Vous avez n8n configuré sur un autre ordinateur, et vous voulez le configurer sur cette machine.

## ✅ Solution rapide

### Option 1 : Setup rapide + Import des workflows (Recommandé)

#### Étape 1 : Faire le setup initial dans n8n

1. **Ouvrez n8n** : http://localhost:5678
2. **Remplissez le formulaire de setup** :
   - **Email** : Utilisez le même email que sur l'autre machine (ou un autre)
   - **Mot de passe** : Créez un mot de passe (peut être différent)
   - **Prénom** : Votre prénom
   - **Nom** : Votre nom
3. **Cliquez sur "Create account"**

#### Étape 2 : Importer les workflows depuis l'autre machine

**Sur l'autre ordinateur (celui qui fonctionne) :**

1. **Ouvrez n8n** : http://localhost:5678
2. **Allez dans "Workflows"**
3. **Pour chaque workflow** :
   - Cliquez sur les **3 points (...)** à droite du workflow
   - Sélectionnez **"Download"** ou **"Export"**
   - Sauvegardez le fichier JSON

**Sur cette machine :**

1. **Transférez les fichiers JSON** sur cette machine (USB, email, cloud, etc.)
2. **Dans n8n** (sur cette machine) :
   - Allez dans **"Workflows"**
   - Cliquez sur **"Import from File"**
   - Sélectionnez chaque fichier JSON exporté
   - Cliquez sur **"Import"**

#### Étape 3 : Réactiver les workflows

1. **Ouvrez chaque workflow importé**
2. **Cliquez sur le toggle** en haut à droite pour l'activer (VERT)
3. **Vérifiez les webhooks** :
   - Cliquez sur le nœud Webhook
   - Notez l'ID du webhook (ex: `7f72ac69-35b7-4771-a5c6-7acb18947254`)
   - Si l'ID est différent, mettez à jour `templates/form/index.html`

#### Étape 4 : Reconfigurer les credentials

1. **Pour chaque nœud avec un cadenas 🔒** :
   - Cliquez sur le nœud
   - Cliquez sur **"Credential to connect"**
   - Sélectionnez ou créez le credential :
     - **Microsoft Outlook** : Pour l'envoi d'emails
     - **SMTP** : Pour les emails de validation (si utilisé)

### Option 2 : Utiliser les workflows du projet (Plus simple)

Si les workflows sont déjà dans le projet :

1. **Faites le setup** dans n8n (voir Étape 1 ci-dessus)
2. **Importez les workflows depuis les fichiers** :
   ```powershell
   # Les workflows sont dans workflows/dev/
   # Ouvrez n8n et importez depuis :
   # workflows/dev/gpt_generator.json
   ```
3. **Activez les workflows** (toggle vert)
4. **Reconfigurez les credentials** (voir Étape 4 ci-dessus)

## 🔍 Vérifier que tout fonctionne

1. **Vérifiez que les workflows sont actifs** :
   - Tous les workflows doivent avoir le toggle VERT
2. **Testez un webhook** :
   ```powershell
   .\scripts\fix-webhook-404.ps1
   ```
3. **Testez le formulaire** :
   - Ouvrez http://localhost:3000
   - Remplissez le formulaire
   - Cliquez sur "Générer"

## 📝 Notes importantes

- **Les credentials ne sont pas partagés** : Vous devrez les reconfigurer sur chaque machine
- **Les IDs de webhook peuvent changer** : Vérifiez-les après l'import
- **Les workflows sont indépendants** : Les modifications sur une machine n'affectent pas l'autre

## 🆘 Si vous avez des problèmes

1. **Vérifiez que Docker fonctionne** :
   ```powershell
   cd docker
   docker-compose ps
   ```

2. **Vérifiez les logs n8n** :
   ```powershell
   cd docker
   docker-compose logs n8n | tail -20
   ```

3. **Redémarrez n8n** :
   ```powershell
   cd docker
   docker-compose restart n8n
   ```

