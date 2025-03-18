import { Provider } from "./provider.js";
import { Router } from "./router.js";

const dataProvider = new Provider();
const router = new Router();
const appContainer = document.getElementById('app-container');

const routes = {
  '/': showMonsterList,
  '/favorites': showFavorites,
  '/monster/:id': showMonsterDetail,
  '404': show404
};

for (const path in routes) {
  if (path.includes(':id')) {
    const basePath = path.split('/:')[0];
    router.addRoute(basePath, () => {
      const id = window.location.hash.split(`${basePath}/`)[1];
      routes[path](id);
    });
  } else {
    router.addRoute(path, routes[path]);
  }
}

router.init();


async function showMonsterList() {
    await dataProvider.loadMonstersData('./api/monsters.json');
    const monsters = dataProvider.getMonsters();
    
    appContainer.innerHTML = `
        <h1>Liste des Monstres</h1>
        <div class="monster-list" id="monster-list"></div>
    `;
    
    const monsterListElement = document.getElementById('monster-list');
    monsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        monsterCard.onclick = () => router.navigate(`/monster/${monster.monster_id}`);
        
        monsterListElement.appendChild(monsterCard);
    });
}


function showFavorites() {
    const favorites = dataProvider.getMonsters().filter(monster => monster.favorite);
    
    appContainer.innerHTML = `
        <h1>Monstres Favoris</h1>
        <div class="monster-list" id="favorites-list"></div>
        <button id="back-btn">Retour</button>
    `;
    
    document.getElementById('back-btn').addEventListener('click', () => router.navigate('/'));
    
    const favoritesList = document.getElementById('favorites-list');
}


function showMonsterDetail(id) {
    const monster = dataProvider.getMonsterById(parseInt(id));
    
    if (!monster) {
        show404();
        return;
    }
    
    appContainer.innerHTML = `
        <div class="monster-detail">
        <h1>${monster.name}</h1>
        <img src="${monster.getImageUrl()}" alt="${monster.name}">

        <button id="back-btn">Retour</button>
        </div>
    `;
    
    document.getElementById('back-btn').addEventListener('click', () => router.navigate('/'));
}


function show404() {
    appContainer.innerHTML = `
        <div class="error-page">
        <h1>404 - Monstre non trouvé</h1>
        <button id="back-btn">Retour</button>
        </div>
    `;
    
    document.getElementById('back-btn').addEventListener('click', () => router.navigate('/'));
}