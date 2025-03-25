import { MONSTERS_MODELS_PATH, FAMILIES_ICONS_PATH, STATS_ICONS_PATH, STATS } from '../lib/config.js';
import { getMonster, getFamily, getRank } from '../lib/provider.js';
import { removeHashParam } from '../lib/utils.js';
import { GenericView } from './genericView.js';


class DetailsView extends GenericView {
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

        document.getElementById("details").innerHTML = `
            <div>
                <span onclick="removeHashParam('detail');" class='close-button material-symbols-rounded'>close</span>
                <img class="monster-img" src="${MONSTERS_MODELS_PATH + monster.id}.jpg">
                
                <section>
                    <div class="infos">
                        <h1>No. ${monster.id} ${monster.name}</h1>
                        <p>${monster.japaneseName}</p>
                    </div>
                    
                    <div class="infos">
                        <p>
                            <span class="clickable-family" onclick="location.hash='family?id=${monster.familyId}'; window.scrollTo({top: 0, behavior: 'smooth'});">
                                <img src="${FAMILIES_ICONS_PATH + family.identifier}.png">
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
            </div>
        `;

        STATS.forEach(stat => {
            const statValue = monster.stats[stat];
            const starsContainer = document.querySelector(`.stars[data-stat="${stat}"]`);
        
            starsContainer.innerHTML = '';
        
            for (let i = 0; i < statValue; i++) {
                const star = document.createElement('span');
                star.className = 'material-symbols-rounded';
                star.textContent = 'star_rate'; 
                starsContainer.appendChild(star);
            }
        });
    }

    async hide() {
        removeHashParam('detail');
        document.getElementById('details').innerHTML = '';
    }
}

export const detailsView = new DetailsView();
window.showDetails = detailsView.render;
window.hideDetails = detailsView.hide;