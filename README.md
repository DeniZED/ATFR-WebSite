## Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)

2. Créez un nouveau projet :
   - Cliquez sur "Ajouter un projet"
   - Nommez-le (ex: "atfr-dashboard")
   - Désactivez Google Analytics si vous n'en avez pas besoin
   - Cliquez sur "Créer le projet"

3. Configurez Realtime Database :
   - Dans le menu latéral, cliquez sur "Realtime Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez la région "europe-west1"
   - Commencez en mode test
   - Une fois la base de données créée, allez dans l'onglet "Règles"
   - Copiez-collez les règles du fichier `database.rules.json`
   - Cliquez sur "Publier"

4. Obtenez les informations de configuration :
   - Cliquez sur l'icône ⚙️ (Paramètres) à côté de "Vue d'ensemble du projet"
   - Sélectionnez "Paramètres du projet"
   - Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"
   - Cliquez sur l'icône Web (</>) pour ajouter une application web
   - Enregistrez votre application avec un nom
   - Copiez la configuration Firebase qui ressemble à :
   ```javascript
   const firebaseConfig = {
     apiKey: "votre-api-key",
     authDomain: "votre-projet.firebaseapp.com",
     databaseURL: "https://votre-projet-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "votre-projet",
     storageBucket: "votre-projet.appspot.com",
     messagingSenderId: "votre-messaging-sender-id",
     appId: "votre-app-id"
   };
   ```

5. Mettez à jour les constantes Firebase dans votre projet :
   - Copiez la configuration dans `src/constants/index.ts`
   - Remplacez la section `FIREBASE_CONFIG` avec vos informations

6. Activez l'authentification par email/mot de passe :
   - Dans le menu latéral, cliquez sur "Authentication"
   - Cliquez sur "Get Started"
   - Activez le provider "Email/Password"

La base de données est maintenant configurée et prête à être utilisée !

### Structure des règles

Les règles de sécurité définissent :

- **Applications** : Lecture et écriture publiques pour permettre les candidatures sans authentification
  - Validation des champs requis
  - Validation du timestamp
  - Validation du statut

- **Events** : Lecture publique, écriture uniquement pour les utilisateurs authentifiés
  - Validation des champs requis pour les événements

- **Members** : Lecture publique, écriture uniquement pour les utilisateurs authentifiés
  - Validation des champs requis pour les membres