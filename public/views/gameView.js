import { MONSTERS_THUMB_PATH } from '../lib/config.js';
import { getMonster, getRank, getParty } from '../lib/provider.js';
import { GenericView } from './genericView.js';


class GameView extends GenericView {
    constructor() {
        super();
        this.party = [];
    }

    async handleRouting(hash, params) {
        super.handleRouting(hash, params);
        await this.loadData();
        this.render();
    }

    async loadData() {
        this.party = await getParty();
        console.log(this.party);
    }

    async renderPartyCard(monster) {
        const rank = await getRank(monster.rankId);
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('detail', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${MONSTERS_THUMB_PATH + monster.identifier}-thumb.png" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class="monster-info">
                    <p>Lv. ${monster.level}</p>
                    <p>Rank ${rank.name}</p>
                    <p>HP ${monster.stats.hp}/${monster.stats.hp}</p>
                    <p>MP ${monster.stats.mp}/${monster.stats.mp}</p>
                </div>
            </div>
        `;
    }

    async renderMenu() {
        return `
            <div class="party-menu">
                <ul class="menu-options">
                    <li>Items</li>
                    <li>Accessoires</li>
                </ul>
            </div>
        `;
    }

    async renderParty() {
        let partyCards = '';
        for (const m of this.party) {
            const monster = await getMonster(m.id);
            partyCards += await this.renderPartyCard(monster);
        }
        
        return `
            <div class="party-section">
                <h2>Équipe principale</h2>
                ${partyCards}
            </div>
        `;
    }
    
    async render() {
        this.details.innerHTML = '';
        this.app.innerHTML = `
            <h1 class="title">Jeu</h1>
            <div class="game">
                ${await this.renderMenu()}
                ${await this.renderParty()}
            </div>
        `;
    }
}

export const gameView = new GameView();