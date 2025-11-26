# Monitoring ngrok avec Notifications

Ce système permet de surveiller le tunnel ngrok et d'envoyer des alertes en cas de déconnexion.

## 🚀 Démarrage rapide

### Lancement simple (notifications Windows uniquement)

```powershell
.\start-ngrok-monitored.bat
```

Cela va :
- ✅ Lancer ngrok en arrière-plan sur le port 8080
- ✅ Démarrer le monitoring dans une fenêtre minimisée
- ✅ Envoyer des notifications Windows en cas de déconnexion/reconnexion

## ⚙️ Configuration des alertes email

### 1. Éditer le fichier de configuration

Ouvrez `config\ngrok-monitor.json` et modifiez :

```json
{
  "email": {
    "enabled": true,
    "to": "votre-email@exemple.com",
    "smtp": {
      "server": "smtp.office365.com",
      "port": 587,
      "user": "votre-email@outlook.com",
      "password": "votre-mot-de-passe-application"
    }
  },
  "monitoring": {
    "checkIntervalSeconds": 30,
    "port": 8080
  },
  "notifications": {
    "windows": true,
    "email": true
  }
}
```

### 2. Configuration Outlook/Office365

Pour utiliser les alertes email avec Outlook :

1. **Créer un mot de passe d'application** :
   - Allez sur https://account.microsoft.com/security
   - Cliquez sur "Options de sécurité avancées"
   - Sous "Mots de passe d'application", cliquez sur "Créer un mot de passe d'application"
   - Copiez le mot de passe généré

2. **Utiliser ce mot de passe** dans `config\ngrok-monitor.json` au lieu de votre mot de passe habituel

### 3. Configuration Gmail

Si vous utilisez Gmail :

```json
{
  "email": {
    "smtp": {
      "server": "smtp.gmail.com",
      "port": 587,
      "user": "votre-email@gmail.com",
      "password": "mot-de-passe-application"
    }
  }
}
```

**Note** : Vous devez activer l'authentification à 2 facteurs et créer un mot de passe d'application sur https://myaccount.google.com/apppasswords

## 📊 Fonctionnalités

### Notifications Windows

- ✅ Alerte lors de la connexion initiale
- ✅ Alerte lors d'une déconnexion
- ✅ Alerte lors d'une reconnexion
- ✅ Affichage de l'URL du tunnel

### Alertes Email

- ✅ Email lors d'une déconnexion avec :
  - Ancienne URL du tunnel
  - Heure de déconnexion
  - Nombre total de déconnexions
- ✅ Email lors d'une reconnexion avec :
  - Nouvelle URL du tunnel
  - Heure de reconnexion

### Monitoring en temps réel

- ✅ Vérification toutes les 30 secondes (configurable)
- ✅ Affichage du nombre de connexions actives
- ✅ Logs horodatés dans la console

## 🛠️ Commandes

### Démarrer ngrok avec monitoring

```powershell
.\start-ngrok-monitored.bat
```

### Arrêter ngrok

```powershell
.\stop-ngrok.bat
```

### Lancer uniquement le monitoring (si ngrok est déjà lancé)

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\monitor-ngrok.ps1"
```

### Personnaliser les paramètres

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\monitor-ngrok.ps1" -ConfigPath "config\ngrok-monitor.json"
```

## 📝 Logs

Le monitoring affiche dans la console :

```
[14:30:15] ngrok CONNECTE: https://dee-wakeful-succulently.ngrok-free.dev
[14:30:45] ngrok OK - 3 connexions
[14:31:15] ngrok OK - 5 connexions
[14:31:45] ngrok DECONNECTE !
[14:32:15] ngrok hors ligne...
[14:32:45] ngrok CONNECTE: https://new-url.ngrok-free.dev
```

## 🔧 Dépannage

### Les notifications Windows ne s'affichent pas

Vérifiez que les notifications sont activées dans Windows :
- Paramètres → Système → Notifications et actions
- Activez "Obtenir des notifications des applications et autres expéditeurs"

### Les emails ne sont pas envoyés

1. Vérifiez que `"enabled": true` et `"email": true` dans la config
2. Vérifiez vos identifiants SMTP
3. Utilisez un mot de passe d'application (pas votre mot de passe habituel)
4. Vérifiez les logs dans la console du monitoring

### Le monitoring ne détecte pas ngrok

Vérifiez que :
- ngrok est bien lancé (`ngrok http 8080`)
- L'interface ngrok est accessible sur http://localhost:4040
- Le port dans la config correspond au port ngrok

## 🎯 Intégration avec start.bat

Pour lancer automatiquement le monitoring avec tous les services, modifiez `start.bat` pour utiliser `start-ngrok-monitored.bat` au lieu de `start-ngrok.bat`.

