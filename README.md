# Projet JS

## Installation  

Assurez-vous d’installer `json-server` avec la version correcte :  

```bash
npm install -g json-server@0.17.0
```

## Lancement de l'application  

Pour démarrer le serveur JSON :  

```bash
npx json-server --watch ./server/data/monsters.json
```

## Fonctionnalités  
- Listing des monstres  
- Listing des accessoires  
- Détails d'un monstre  
- Détails d'un accessoire  
- Mise en favoris de monstres  
- Listing des favoris  
- Pagination  
- JSON relationnel (1-n et n-n)  
- Filtres de recherche sur les monstres  
- Filtres de recherche sur les accessoires  
- Système de notation (stocké dans le JSON)  
- Système de favoris (local data storage)  
- Lazy loading pour les images des listings  

## Fonctionnalités depuis soutenance
- Mise en favoris de monstres  
- Listing des favoris  
- Filtres de recherche sur les monstres  
- Filtres de recherche sur les accessoires  
- Système de notation (stocké dans le JSON)  
- Système de favoris (local data storage)  

## Contraintes respéctées  
- SPA  
- Organisation en modules  
- Utilisation de classes d'objets (sans modèles)  