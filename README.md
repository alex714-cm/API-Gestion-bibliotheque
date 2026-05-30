#  LivreMoi - Application de Gestion de Bibliothèque Modernisée

**LivreMoi** est une application web moderne de gestion de bibliothèque construite avec une architecture découplée : un backend robuste en **Spring Boot (Java)** et un frontend dynamique et interactif en **React (Vite)** avec un design soigné, fluide et responsive.

---

##  Fonctionnalités Clés

###  Espace Lecteur (Utilisateur)
- **Authentification Sécurisée** : Inscription et Connexion avec option moderne de masquage/visibilité du mot de passe (icône œil).
- **Catalogue Dynamique & Emprunts** : Parcours des livres disponibles et emprunts instantanés.
- **Modales Modernes** : Alertes et modales de succès interactives via **SweetAlert2** ("Rendez-vous dans mon espace").
- **Tableau de Bord Personnel ("Mon Espace")** :
  - **Pagination ultra-fluide** et moderne pour la liste des emprunts.
  - **Annulation simplifiée** : Bouton corbeille moderne permettant d'annuler un emprunt par erreur en un clic (remise en stock instantanée).
- **Profil Utilisateur** : Gestion des informations personnelles avec modification sécurisée du mot de passe.

###  Espace Administration
- **Gestion des Livres** : Ajout, modification et suppression de livres.
- **Suivi des Stocks** : Visualisation automatique et temps réel de la quantité disponible.
- **Gestion des Emprunts** : Suivi des emprunts en cours, validation des retours, et historique des annulations avec statuts mis à jour.
- **Design Cohérent** : Interface d'administration épurée avec thème sombre/clair harmonisé.

---

##  Technologies Utilisées

| Composant | Technologie | Version / Détails |
| :--- | :--- | :--- |
| **Backend** | Java / Spring Boot | Spring Boot 3.x, Maven |
| **Base de Données** | Oracle Database | Oracle JDBC, Dialecte Hibernate Oracle |
| **Frontend** | React.js / Vite | React 19, ES6, JSX |
| **Routage Frontend** | React Router | Version 7 |
| **Design / UI** | Bootstrap & CSS Custom | Bootstrap 5.3.8, CSS3 Variables, SweetAlert2 |

---

##  Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :
- [Java Development Kit (JDK 17 ou supérieur)](https://www.oracle.com/java/technologies/downloads/)
- [Node.js (version 18+) & npm](https://nodejs.org/)
- [Oracle Database (XE ou Enterprise Edition)](https://www.oracle.com/database/)

---

##  Guide de Démarrage Rapide

### 1. Configuration de la Base de Données (Oracle)

1. Connectez-vous à votre instance de base de données Oracle.
2. Créez un utilisateur ou schéma nommé `library` avec le mot de passe `sys` (ou modifiez les identifiants dans le fichier de configuration backend) :
   ```sql
   CREATE USER library IDENTIFIED BY sys;
   GRANT CONNECT, RESOURCE, DBA TO library;
   ```

---

### 2. Lancement du Backend (Spring Boot)

1. Naviguez dans le dossier du backend :
   ```bash
   cd backend
   ```
2. Configurez les accès à votre base de données dans le fichier `backend/src/main/resources/application.properties` (si nécessaire) :
   ```properties
   spring.datasource.url=jdbc:oracle:thin:@localhost:1521:xe
   spring.datasource.username=library
   spring.datasource.password=sys
   ```
3. Compilez et démarrez l'application à l'aide du wrapper Maven inclus :
   - **Sur Windows (PowerShell / CMD) :**
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   - **Sur macOS / Linux :**
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
4. Le backend démarrera et sera accessible sur [http://localhost:8080](http://localhost:8080).

---

### 3. Lancement du Frontend (React / Vite)

1. Naviguez dans le dossier du frontend :
   ```bash
   cd frontend
   ```
2. Installez les dépendances nécessaires :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement local :
   ```bash
   npm run dev
   ```
4. Ouvrez votre navigateur et accédez à l'adresse indiquée (généralement [http://localhost:5173](http://localhost:5173)).

---

##  Guide de Démarrage et Déploiement avec Docker

Pour vous faciliter le déploiement et l'exécution de l'application, nous avons entièrement dockerisé l'architecture (Frontend React + Backend Spring Boot + Base de données Oracle XE).

###  Prérequis Docker
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et en cours d'exécution.

---

### 1. Lancement Local de la Stack Complète
L'ensemble des services est orchestré à l'aide de **Docker Compose**. Pour lancer toute l'application (base de données incluse) en local en une seule ligne de commande :

1.  Ouvrez un terminal à la racine du projet (`Projet_Bibliotheque/`).
2.  Exécutez la commande suivante :
    ```bash
    docker compose up -d
    ```
    *Note : Lors du tout premier lancement, Docker téléchargera l'image d'Oracle XE 21c (faststart) et construira les images de l'application. Cela peut prendre quelques minutes.*
3.  Une fois démarrée, l'application est accessible sur :
    *   **Portail Frontend** : [http://localhost](http://localhost) (Port `80` standard)
    *   **API Backend** : [http://localhost:8080](http://localhost:8080)
    *   **Base de Données Oracle XE** : `localhost:1522` (Redirection du port interne `1521` pour éviter tout conflit avec un autre service ou une DB Oracle existante sur le port `1521` de votre machine hôte).

Pour arrêter la stack complète de services :
```bash
docker compose down
```

---

### 2. Publication des Images sur Docker Hub

Les images de production de l'application sont prêtes à être hébergées et déployées depuis votre compte Docker Hub `3alae008`.

#### Étape de compilation et d'étiquetage (Tagging)
Si vous devez reconstruire et étiqueter les images de production :
```bash
# Compiler & Tagger le Backend
docker build -t 3alae008/api-gestion-bibliotheque-backend:latest ./backend

# Compiler & Tagger le Frontend
docker build -t 3alae008/api-gestion-bibliotheque-frontend:latest ./frontend
```

#### Étape d'envoi sur Docker Hub (Push)
Une fois connectés sur votre terminal à votre compte Docker Hub, vous pouvez pousser les images en ligne :
```bash
# 1. Se connecter à Docker Hub via le terminal
docker login

# 2. Pousser l'image du Backend
docker push 3alae008/api-gestion-bibliotheque-backend:latest

# 3. Pousser l'image du Frontend
docker push 3alae008/api-gestion-bibliotheque-frontend:latest
```

---

##  Structure du Projet

```text
Projet_Bibliotheque/
├── backend/                  # API REST Spring Boot (Java)
│   ├── src/                  # Code source Java & ressources
│   ├── pom.xml               # Fichier de dépendances Maven
│   └── mvnw/mvnw.cmd         # Maven Wrapper
├── frontend/                 # Client Single Page Application React
│   ├── src/                  # Composants, Pages, Services API, Contexte
│   ├── package.json          # Fichier de dépendances npm
│   └── vite.config.js        # Configuration de Vite
└── README.md                 # Documentation du projet
```

---

##  Configuration de Sécurité & API
- L'application utilise un **Context d'authentification React** (`AuthContext`) pour maintenir la session utilisateur.
- Les requêtes HTTP entre le Frontend et le Backend passent par un service centralisé `apiService` configuré pour communiquer de façon fluide avec l'URL de base `http://localhost:8080`.
