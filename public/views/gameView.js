import { MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH, BOXES_IMG_PATH, BOXES } from '../lib/config.js';
import { getMonster, getRank, getAccessory, getAccessoriesByRank, getParty, removeMonsterFromParty, getBackpack, addAccessoryToBackpack } from '../lib/provider.js';
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
        window.addRandomAccessoryToBackpack = async (boxName) => {
            const accessoryId = await this.getRandomAccessoryId(boxName);
            await addAccessoryToBackpack(accessoryId);
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
                        <img src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" alt="${monster.name}">
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

    async renderAccessoryCard(backpackAccess) {
        const accessory = await getAccessory(backpackAccess.id);
        return `
            <div id=${accessory.id} class="monster-card" onclick="setHashParam('accessory', ${accessory.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${ACCESSORY_IMG_PATH}" alt="${accessory.name}">
                    </div>
                    <h2>x${backpackAccess.quantity}</h2>
                    <h2>${accessory.name}</h2>
                </div>
                <div class='remove-button' onclick="event.stopPropagation();">
                    <span class="material-symbols-rounded">money_bag</span>
                </div>
            </div>
        `;
    }

    async renderAccessories() {
        let accessoryCards = '';
        for (const accessory of await getBackpack()) {
            accessoryCards += await this.renderAccessoryCard(accessory);
        }
        
        return `
            <div class="game-section">
                <h2>Accessoires</h2>
                ${accessoryCards}
            </div>
        `;
    }

    async renderBoxes() {
        const getRankNames = async (rankIds) => {
            const names = [];
            for (const id of rankIds) {
                const rank = await getRank(id);
                names.push(rank.name);
            }
            return names.join(', ');
        };
    
        const mimicRanks = await getRankNames(BOXES.mimic.ranks);
        const canniRanks = await getRankNames(BOXES.canni.ranks);
        const pandoraRanks = await getRankNames(BOXES.pandora.ranks);
    
        return `
            <div class="game-section">
                <h2>Boîtes à accessoires</h2>
                <div class="boxes-container">
                    <div class="box-card" onclick="addRandomAccessoryToBackpack('mimic')">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}/mimic.png" alt="Mimic Box">
                        </div>
                        <h3>Mimic</h3>
                        <p>Raretés contenues : ${mimicRanks}</p>
                        <p>1000 gold</p>
                    </div>
                    
                    <div class="box-card" onclick="addRandomAccessoryToBackpack('canni')">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}/canni.png" alt="Canni Box">
                        </div>
                        <h3>Canniboîte</h3>
                        <p>Raretés contenues : ${canniRanks}</p>
                        <p>2500 gold</p>
                    </div>
                    
                    <div class="box-card" onclick="addRandomAccessoryToBackpack('pandora')">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}/pandora.png" alt="Pandora Box">
                        </div>
                        <h3>Boîte de Pandore</h3>
                        <p>Raretés contenues : ${pandoraRanks}</p>
                        <p>5000 gold</p>
                    </div>
                </div>
            </div>
        `;
    }

    async renderBoxes() {
        const getRankNames = async (rankIds) => {
            const names = [];
            for (const id of rankIds) {
                const rank = await getRank(id);
                names.push(rank.name);
            }
            return names.join(', ');
        };
    
        const mimicRanks = await getRankNames(BOXES.mimic);
        const canniRanks = await getRankNames(BOXES.canni);
        const pandoraRanks = await getRankNames(BOXES.pandora);
    
        return `
            <div class="game-section">
                <h2>Boîtes à accessoires</h2>
                <div class="boxes-container">
                    <div class="box-card">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}mimic.png" alt="Mimic Box">
                        </div>
                        <h3>Mimic</h3>
                        <p>Raretés contenues : ${mimicRanks}</p>
                        <p>1000 gold</p>
                    </div>
                    
                    <div class="box-card">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}canni.png" alt="Canni Box">
                        </div>
                        <h3>Canniboîte</h3>
                        <p>Raretés contenues : ${canniRanks}</p>
                        <p>2500 gold</p>
                    </div>
                    
                    <div class="box-card">
                        <div class="box-image-container">
                            <img src="${BOXES_IMG_PATH}pandora.png" alt="Pandora Box">
                        </div>
                        <h3>Boîte de Pandore</h3>
                        <p>Raretés contenues : ${pandoraRanks}</p>
                        <p>5000 gold</p>
                    </div>
                </div>
            </div>
        `;
    }

    async renderMenu() {
        return `
            <div class="party-menu">
                <ul class="menu-options">
                    <li id="party-menu-item">Équipe</li>
                    <li id="accessories-menu-item">Accessoires</li>
                    <li id="boxes-menu-item">Boites</li>
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

            case 'boxes':
                view = await this.renderBoxes();
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
        document.getElementById('boxes-menu-item').addEventListener('click', () => this.switchView('boxes'));
    }

    async getRandomAccessoryId(boxName) {
        const box = BOXES[boxName];
        const rand = Math.random();
        let cumulative = 0;
        let selectedRank;
      
        for (let i = 0; i < box.ranks.length; i++) {
          cumulative += box.probabilities[i];
          if (rand <= cumulative) {
            selectedRank = box.ranks[i];
            break;
          }
        }
      
        const accessories = await getAccessoriesByRank(selectedRank);
        const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)];
        return randomAccessory.id;
      }
}

export const gameView = new GameView();