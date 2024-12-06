# Gestion de Locations et Stockages

Une application simple et intuitive pour gérer les équipements en location, le stock, et l'historique des transactions.

## Fonctionnalités

- **Équipements Loués** :
  - Affiche la liste des équipements actuellement loués.
  - Permet de retourner un équipement, ce qui met à jour le stock automatiquement.

- **Ajouter une Location** :
  - Formulaire pour ajouter une nouvelle location avec :
    - Le choix d'un équipement disponible.
    - Le nom du locataire.
    - Les dates de prise et de retour.
    - La quantité à louer.

- **Historique** :
  - Affiche l'historique des locations retournées avec tous les détails.
  - Bouton pour vider l'historique.

- **Stock** :
  - Gestion complète des équipements disponibles :
    - Ajouter de nouveaux équipements avec une quantité initiale.
    - Modifier les équipements existants (nom et stock).
    - Supprimer des équipements obsolètes.

## Installation

1. Clonez le dépôt GitHub :
   ```bash
   git clone https://github.com/KoriiiS/loc_stockage.git
   cd loc_stockage
2. Installez les dépendances :
   ```bash
    npm install
3. Lancez l'application en mode développement :
   ```bash
    npm start

## Technologies Utilisées
- Electron : Pour créer une application de bureau multiplateforme.
- Better-SQLite3 : Pour la gestion de la base de données SQLite.
- HTML/CSS/JavaScript : Pour le rendu et l'interactivité.

## Contribution

Les contributions sont les bienvenues ! Si vous souhaitez apporter des améliorations ou corriger des bugs, suivez ces étapes :
1- Forkez le projet.
2- Créez une nouvelle branche 
```bash
  git checkout -b feature-nouvelle-fonctionnalite
3- 
