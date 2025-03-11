import { Provider } from "./js/provider.js";


const dataProvider = new Provider();

async function loadAndDisplayMonsters() {
    await dataProvider.loadMonstersData('./api/monsters.json');
    const monsters = dataProvider.getMonsters();
    console.log(monsters);

    const monsterListElement = document.getElementById('monster-list');

    monsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';

        const image = document.createElement('img');
        image.src = monster.getImageUrl();
        image.alt = monster.name;

        const name = document.createElement('h2');
        name.textContent = monster.name;

        const stats = document.createElement('p');
        stats.textContent = `HP: ${monster.stats.hp}, ATT: ${monster.stats.att}, DEF: ${monster.stats.def}`;

        const favorite = document.createElement('p');
        favorite.textContent = monster.favorite ? '⭐ Favorite' : 'Not Favorite';
        favorite.className = monster.favorite ? 'favorite' : '';

        const toggleFavoriteButton = document.createElement('button');
        toggleFavoriteButton.textContent = 'Toggle Favorite';
        toggleFavoriteButton.onclick = () => {
            monster.toggleFavorite();
            favorite.textContent = monster.favorite ? '⭐ Favorite' : 'Not Favorite';
            favorite.className = monster.favorite ? 'favorite' : '';
        };

        monsterCard.appendChild(image);
        monsterCard.appendChild(name);
        monsterCard.appendChild(stats);
        monsterCard.appendChild(favorite);
        monsterCard.appendChild(toggleFavoriteButton);

        monsterListElement.appendChild(monsterCard);
    });
}

loadAndDisplayMonsters();