import { Provider } from "./provider.js";

const dataProvider = new Provider();

async function loadAndDisplayMonsters() {
    await dataProvider.loadMonstersData('./api/monsters.json');
    const monsters = dataProvider.getMonsters();

    const monsterListElement = document.getElementById('monster-list');

    monsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';

        const image = document.createElement('img');
        image.src = monster.getImageUrl();
        image.alt = monster.name;

        const name = document.createElement('h2');
        name.textContent = monster.name;

        monsterCard.appendChild(image);
        monsterCard.appendChild(name);

        monsterListElement.appendChild(monsterCard);
    });
}

loadAndDisplayMonsters();