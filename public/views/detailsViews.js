import { MONSTERS_MODELS_PATH, FAMILIES_ICONS_PATH, STATS_ICONS_PATH, STATS_MAP, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getMonster, getFamily, getRank, getAccessory } from '../lib/provider.js';
import { removeHashParam, getHashParam } from '../lib/utils.js';
import { GenericView } from './genericView.js';


class BaseDetailsView extends GenericView {
    async hide() {
        removeHashParam('monster');
        removeHashParam('accessory');
        document.getElementById('details').innerHTML = '';
    }

    async renderContainer(content) {
        document.getElementById("details").innerHTML = `
            <div>
                <span onclick="removeHashParam('monster'); removeHashParam('accessory');" class='close-button material-symbols-rounded'>close</span>
                ${content}
            </div>
        `;
    }
}


class MonsterDetailsView extends BaseDetailsView {
    async setTotalStats(monster, family) {
        Object.keys(monster.stats).forEach(statKey => {
            if (family.bonuses[statKey]) {
                monster.stats[statKey] += family.bonuses[statKey];
            }
        });
    }

    async render(id) {
        const monster = await getMonster(id);
        const family = await getFamily(monster.familyId);
        const rank = await getRank(monster.rankId);
        this.setTotalStats(monster, family);

        this.renderContainer(`
            <img class="monster-img" src="${MONSTERS_MODELS_PATH}/${monster.id}.jpg">
            <section>
                <div class="infos">
                    <h1>No. ${monster.id} ${monster.name}</h1>
                    <p>${monster.japaneseName}</p>
                </div>
                
                <div class="infos">
                    <p>
                        <span class="family" window.scrollTo({top: 0, behavior: 'smooth'});">
                            <img src="${FAMILIES_ICONS_PATH}/${family.identifier}.png">
                            ${family.name}
                        </span>
                    </p>
                    <p>Rank ${rank.name}</p>
                </div>

                <hr color="#aca899" />

                <div class="infos">
                    <ul class="stats">
                        <li><strong>HP</strong><span class="stars" data-stat="hp"></span></li>
                        <li><strong>MP</strong><span class="stars" data-stat="mp"></span></li>
                        <li><img src="${STATS_ICONS_PATH}/attack.png"><strong>Attaque</strong><span class="stars" data-stat="att"></span></li>
                        <li><img src="${STATS_ICONS_PATH}/defence.png"><strong>Défense</strong><span class="stars" data-stat="def"></span></li>
                        <li><img src="${STATS_ICONS_PATH}/agility.png"><strong>Agilité</strong><span class="stars" data-stat="agi"></span></li>
                        <li><img src="${STATS_ICONS_PATH}/wisdom.png"><strong>Sagesse</strong><span class="stars" data-stat="wis"></span></li>
                    </ul>
                </div>
            </section>
        `);

        Object.keys(STATS_MAP).forEach(stat => {
            const statValue = monster.stats[stat];
            const starsContainer = document.querySelector(`.stars[data-stat="${stat}"]`);

            if (starsContainer) {
                starsContainer.innerHTML = '';
                for (let i = 0; i < statValue; i++) {
                    const star = document.createElement('span');
                    star.className = 'material-symbols-rounded';
                    star.textContent = 'star_rate';
                    starsContainer.appendChild(star);
                }
            }
        });
    }
}


class AccessoryDetailsView extends BaseDetailsView {
    async render(id) {
        const accessory = await getAccessory(id);

        const bonuses = Object.keys(accessory.bonuses)
            .map(key => `<li><strong>+${accessory.bonuses[key]} ${STATS_MAP[key]}</strong></li>`)
            .join('');

        this.renderContainer(`
            <hr color="#aca899" />
            <section class="accessory-details">
                <div class="name-container">
                    <img src="${ACCESSORY_IMG_PATH}">
                    <h1>${accessory.name}</h1>
                </div>

                <hr color="#aca899" />

                <div class="infos">
                    <p>${accessory.description}</p>
                </div>
                
                <hr color="#aca899" />

                <div class="infos">
                    <ul class="stats">
                        ${bonuses}
                    </ul>
                </div>
            </section>
        `);
    }
}


export const monsterDetailsView = new MonsterDetailsView();
export const accessoryDetailsView = new AccessoryDetailsView();