# Démarrage Automatique en Administrateur

Ce guide explique comment configurer le système pour démarrer automatiquement en mode administrateur **sans avoir à entrer le mot de passe à chaque fois**.

## 🎯 Objectif

Lancer `start.bat` en mode administrateur d'un simple double-clic, sans UAC (User Account Control).

## ⚙️ Configuration Initiale (À faire UNE SEULE FOIS)

### Étape 1 : Exécuter la configuration

1. **Clic droit** sur `SETUP-ADMIN.bat`
2. Sélectionnez **"Exécuter en tant qu'administrateur"**
3. Entrez votre mot de passe Windows quand demandé : `joubert`
4. Appuyez sur Entrée

### Étape 2 : Vérification

Le script va créer une tâche planifiée nommée `N8N-Automate-Start` qui :
- ✅ S'exécute avec les privilèges administrateur
- ✅ Ne demande pas le mot de passe UAC
- ✅ Lance automatiquement `start.bat`

Vous devriez voir :
```
========================================
CONFIGURATION TERMINEE !
========================================

Une tache planifiee a ete creee: N8N-Automate-Start
```

## 🚀 Utilisation Quotidienne

### Méthode 1 : Double-clic (Recommandé)

**Double-cliquez simplement sur `START-ADMIN.bat`**

Le système va :
1. ✅ Vérifier que la tâche planifiée existe
2. ✅ Lancer la tâche (qui démarre `start.bat` en admin)
3. ✅ Démarrer tous les services automatiquement

**Aucun mot de passe demandé !** 🎉

### Méthode 2 : Ligne de commande

```powershell
schtasks /run /tn "N8N-Automate-Start"
```

### Méthode 3 : Démarrage classique (avec UAC)

Si vous préférez voir l'UAC à chaque fois :

```powershell
.\start.bat
```

Windows demandera l'élévation en administrateur.

## 📋 Ce qui est démarré

Quand vous lancez `START-ADMIN.bat`, le système démarre automatiquement :

1. **Docker** (PostgreSQL, n8n, Ollama) - 10 secondes
2. **Serveur PowerShell** (port 8080) - 3 secondes
3. **ngrok** (tunnel public) - 5 secondes
4. **Monitoring ngrok** (notifications) - immédiat
5. **Affichage URL ngrok** - 3 secondes

**Total : ~21 secondes** ⚡

## 🔧 Gestion de la Tâche Planifiée

### Voir la tâche

```powershell
schtasks /query /tn "N8N-Automate-Start"
```

### Supprimer la tâche

Si vous voulez désactiver le démarrage automatique en admin :

```powershell
schtasks /delete /tn "N8N-Automate-Start" /f
```

### Reconfigurer

Si vous changez de mot de passe Windows :

1. Supprimez l'ancienne tâche (commande ci-dessus)
2. Relancez `SETUP-ADMIN.bat` en tant qu'administrateur
3. Entrez votre nouveau mot de passe

## 🛡️ Sécurité

### ⚠️ Important

- La tâche planifiée stocke votre mot de passe de manière sécurisée dans Windows
- Seul votre compte utilisateur peut exécuter cette tâche
- **À utiliser uniquement sur votre machine de développement locale**
- **Ne PAS utiliser en production ou sur un serveur partagé**

### Recommandations

- ✅ Utilisez cette méthode uniquement sur votre PC personnel
- ✅ Assurez-vous que votre session Windows est protégée par mot de passe
- ✅ Ne partagez pas votre machine avec d'autres utilisateurs
- ❌ Ne commitez JAMAIS les mots de passe dans Git

## 🔍 Dépannage

### La tâche n'existe pas

**Erreur** : `ERREUR: La tache planifiee n'est pas configuree`

**Solution** : Exécutez `SETUP-ADMIN.bat` en tant qu'administrateur

### Mot de passe incorrect

**Erreur** : La tâche ne démarre pas

**Solution** :
1. Supprimez la tâche : `schtasks /delete /tn "N8N-Automate-Start" /f`
2. Relancez `SETUP-ADMIN.bat`
3. Entrez le bon mot de passe

### Vérifier les logs de la tâche

Ouvrez le **Planificateur de tâches Windows** :
1. Appuyez sur `Win + R`
2. Tapez `taskschd.msc`
3. Cherchez `N8N-Automate-Start` dans la liste
4. Onglet "Historique" pour voir les exécutions

## 📝 Fichiers Créés

- `START-ADMIN.bat` - Lance le système en admin sans UAC
- `SETUP-ADMIN.bat` - Configuration initiale (à exécuter une fois)
- `scripts/setup-auto-admin.ps1` - Script PowerShell de configuration
- Tâche planifiée Windows : `N8N-Automate-Start`

## 🎯 Résumé

**Configuration (une fois)** :
```
Clic droit sur SETUP-ADMIN.bat > Exécuter en tant qu'administrateur
```

**Utilisation quotidienne** :
```
Double-clic sur START-ADMIN.bat
```

**C'est tout !** 🚀

