import { MONSTERS_MODELS_PATH, FAMILIES_ICONS_PATH, STATS_ICONS_PATH, STATS_MAP, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getMonster, getFamily, getRank, getAccessory, getBackpack, getRating, saveRating } from '../lib/provider.js';
import { removeHashParam, getHashParam } from '../lib/utils.js';
import { GenericView } from './genericView.js';


class BaseDetailsView extends GenericView {
    async hide() {
        removeHashParam('monster');
        removeHashParam('accessory');
        removeHashParam('equip');
        document.getElementById('details').innerHTML = '';
    }

    async renderContainer(content) {
        document.getElementById("details").innerHTML = `
            <div>
                <span onclick="removeHashParam('monster'); removeHashParam('accessory'); removeHashParam('equip');" class='close-button material-symbols-rounded'>close</span>
                ${content}
            </div>
        `;
    }
}


class MonsterDetailsView extends BaseDetailsView {
    constructor() {
        super();
        window.rateMonster = async (monsterId, rating) => {
            await saveRating(monsterId, rating);
            this.render(monsterId);
        };
    }

    async setTotalStats(monster, family) {
        Object.keys(monster.stats).forEach(statKey => {
            if (family.bonuses[statKey]) {
                monster.stats[statKey] += family.bonuses[statKey];
            }
        });
    }

    async render(id) {
        removeHashParam('accessory');
        removeHashParam('equip');

        const monster = await getMonster(id);
        const family = await getFamily(monster.familyId);
        const rank = await getRank(monster.rankId);
        this.setTotalStats(monster, family);
        const rating = await getRating(id) || 0;

        this.renderContainer(`
            <img class="monster-img" src="${MONSTERS_MODELS_PATH}/${monster.id}.jpg">
            <section>
                <div class="infos">
                    <h1>No. ${monster.id} ${monster.name}</h1>
                    <p>${monster.japaneseName}</p>
                </div>

                <div class="rating-section">
                    <div class="rating-stars">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="star ${(rating.rating >= star) ? 'filled' : ''}" 
                                data-value="${star}" 
                                onclick="rateMonster(${monster.id}, ${star})">
                                ★
                            </span>
                        `).join('')}
                    </div>
                </div>

                <hr color="#aca899" />
                
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
        removeHashParam('monster');
        removeHashParam('equip');

        const accessory = await getAccessory(id);
        const rank = await getRank(accessory.rankId);

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
                    <p>Rank ${rank.name}</p>
                    <p>Prix de vente : ${accessory.sellPrice} G</p>
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


class AccessoryListView extends BaseDetailsView {
    async render(monsterId) {
        removeHashParam('monster');
        removeHashParam('accessory');

        this.monsterId = monsterId;
        const accessories = await getBackpack();

        this.renderContainer(`
            <hr color="#aca899" />
            <section class="accessory-details">
                ${await this.renderAccessoriesList(accessories)}
            </section>
        `);
    }

    async renderAccessoriesList(accessories) {
        const accessoryCards = await Promise.all(accessories.map(accessory => this.renderAccessoryCard(accessory)));
        return accessoryCards.join('');
    }

    async renderAccessoryCard(item) {
        const accessory = await getAccessory(item.id);
    
        const bonuses = Object.keys(accessory.bonuses)
            .map(key => `<li>+${accessory.bonuses[key]} ${STATS_MAP[key]}</li>`)
            .join('');
    
        return `
            <div id="${accessory.id}" class="monster-card" onclick="addAccessoryTo(${this.monsterId}, ${accessory.id})">
                <div class="monster-card-content">
                    <div class="image-container">
                        <img src="${ACCESSORY_IMG_PATH}" alt="${accessory.name}">
                    </div>
                    <h3>x${item.quantity} ${accessory.name}</h3>
                </div>
                <ul>
                    ${bonuses}
                </ul>
            </div>
        `;
    }
}


export const monsterDetailsView = new MonsterDetailsView();
export const accessoryDetailsView = new AccessoryDetailsView();
export const accessoryListView = new AccessoryListView();
