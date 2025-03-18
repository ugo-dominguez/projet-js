import { dataProvider, router, appContainer } from '../init.js';


export async function showMonsterList() {
    await dataProvider.loadMonstersData('./api/monsters.json');
    const monsters = dataProvider.getMonsters();
    
    appContainer.innerHTML = `
        <h1 class="title">Liste des Monstres</h1>
        <div class="monster-list" id="monster-list"></div>
    `;
    
    const monsterListElement = document.getElementById('monster-list');
    monsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        monsterCard.onclick = () => router.navigate(`/monster/${monster.monster_id}`);

        const image = document.createElement('img');
        image.src = monster.getThumbUrl();
        image.alt = monster.name;

        const name = document.createElement('h2');
        name.textContent = monster.name;

        monsterCard.appendChild(image);
        monsterCard.appendChild(name);
        monsterListElement.appendChild(monsterCard);
    });
}


export function showMonsterDetail(id) {
    const monster = dataProvider.getMonsterById(parseInt(id));
    
    if (!monster) {
        show404();
        return;
    }
    
    appContainer.innerHTML = `
        <div class="monster-detail">
            <button id="back-btn">Retour</button>
            
            <h1 class="monster-title">${monster.monster_id} ${monster.name}</h1>

            <div class="monster-content">
                <img class="monster-image" src="${monster.getImageUrl()}" alt="${monster.name}">

                <div class="monster-stats">

                </div>
            </div>
        </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => router.navigate('/'));
}
