import { MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH, STATS_MAP } from '../lib/config.js';
import { getMonster, getRank, getItems, getParty, removeMonsterFromParty } from '../lib/provider.js';
import { setHashParam } from '../lib/utils.js';
import { GenericView } from './genericView.js';
import { monsterDetailsView, accessoryDetailsView } from './detailsViews.js';


class GameView extends GenericView {
    constructor() {
        super();
        this.party = [];
        this.currentView = 'party';
        
        window.removeMonsterFromParty = async (monsterId) => {
            await removeMonsterFromParty(monsterId);
            await this.loadData();
            this.render();
        };
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        const accessoryDetail = params.get('accessory');

        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else if (accessoryDetail) {
            accessoryDetailsView.render(accessoryDetail);
        } else {
            monsterDetailsView.hide();
        }

        await this.loadData();
        this.render();
    }

    async loadData() {
        this.party = await getParty();
    }

    async renderPartyCard(monster) {
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${MONSTERS_THUMB_PATH + monster.identifier}-thumb.png" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class='remove-button' onclick="event.stopPropagation(); removeMonsterFromParty(${monster.id})">
                    <span class="material-symbols-rounded">delete</span>
                </div>
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
            <div class="game-section">
                <h2>Équipe principale</h2>
                ${partyCards}
            </div>
        `;
    }

    async renderAccessoryCard(item) {
        return `
            <div id=${item.id} class="monster-card" onclick="setHashParam('accessory', ${item.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${ACCESSORY_IMG_PATH}" alt="${item.name}">
                    </div>
                    <h2>${item.name}</h2>
                </div>
                <div class='remove-button' onclick="event.stopPropagation();">
                    <span class="material-symbols-rounded">money_bag</span>
                </div>
            </div>
        `;
    }

    async renderAccessories() {
        let itemCards = '';
        for (const item of await getItems()) {
            itemCards += await this.renderAccessoryCard(item);
        }
        
        return `
            <div class="game-section">
                <h2>Accessoires</h2>
                ${itemCards}
            </div>
        `;
    }

    async renderMenu() {
        return `
            <div class="party-menu">
                <ul class="menu-options">
                    <li id="party-menu-item">Équipe</li>
                    <li id="accessories-menu-item">Accessoires</li>
                </ul>
            </div>
        `;
    }
    
    async switchView(view) {
        this.currentView = view;
        this.render();
    }

    async render() {
        const menu = await this.renderMenu();
        let view = '';

        switch (this.currentView) {
            case 'party':
                view = await this.renderParty();
                break;

            case 'accessories':
                view = await this.renderAccessories();
                break;
            
            default:
                view = await this.renderParty();
                break;
        }

        this.app.innerHTML = `
            <h1 class="title">Jeu</h1>
            <div class="game">
                ${menu}
                ${view}
            </div>
        `;

        document.getElementById('party-menu-item').addEventListener('click', () => this.switchView('party'));
        document.getElementById('accessories-menu-item').addEventListener('click', () => this.switchView('accessories'));
    }
}

export const gameView = new GameView();