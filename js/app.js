import { Provider } from "./provider.js";

const dataProvider = new Provider();

async function loadAndDisplayMonsters() {
    await dataProvider.loadMonstersData('./api/monsters.json');
    const monsters = dataProvider.getMonsters();

    const monsterListElement = document.getElementById('monster-list');

    monsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        monsterCard.dataset.monsterId = monster.monster_id;

        const image = document.createElement('img');
        image.src = monster.getImageUrl();
        image.alt = monster.name;

        const name = document.createElement('h2');
        name.textContent = monster.name;

        monsterCard.appendChild(image);
        monsterCard.appendChild(name);

        monsterCard.addEventListener('click', () => {
            displayMonsterDetails(monster);
            document.getElementById('monster-details').style.display = 'flex';
            document.getElementById('monster-list').style.display = 'none';
        });

        monsterListElement.appendChild(monsterCard);
    });
}

function displayMonsterDetails(monster) {
    const detailsContent = document.getElementById('details-content');
    detailsContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'details-container';

    const image = document.createElement('img');
    image.src = monster.getImageUrl();
    image.alt = monster.name;
    image.className = 'monster-details-image';

    const textContainer = document.createElement('div');
    textContainer.className = 'details-text';

    const name = document.createElement('h2');
    name.textContent = monster.name;

    const japaneseName = document.createElement('p');
    japaneseName.innerHTML = `<strong>Nom Japonais:</strong> ${monster.japanese_name}`;

    const stats = document.createElement('p');
    stats.innerHTML = `<strong>Stats:</strong> ${JSON.stringify(monster.stats)}`;

    const trivia = document.createElement('p');
    trivia.innerHTML = `<strong>Description:</strong> ${monster.trivia}`;

    textContainer.appendChild(name);
    textContainer.appendChild(japaneseName);
    textContainer.appendChild(stats);
    textContainer.appendChild(trivia);

    container.appendChild(image);
    container.appendChild(textContainer);
    detailsContent.appendChild(container);
}

document.getElementById('back-button').addEventListener('click', () => {
    document.getElementById('monster-details').style.display = 'none';
    document.getElementById('monster-list').style.display = 'grid';
});

window.addEventListener('popstate', (event) => {
    const monsterId = event.state?.monsterId;
    if (monsterId) {
        const monster = dataProvider.getMonsterById(monsterId);
        displayMonsterDetails(monster);
        document.getElementById('monster-details').style.display = 'flex';
        document.getElementById('monster-list').style.display = 'none';
    }
});

loadAndDisplayMonsters();