import { MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH, BOXES_IMG_PATH } from '../lib/config.js';
import { getMonster, getRank, getAccessory, getBoxes, getBox, getAccessoriesByRank, getParty, getMonsterFromParty, 
    removeMonsterFromParty, addAccessoryToMonster, getBackpack, addAccessoryToBackpack, removeAccessoryFromBackpack, 
    addMoney, getMoney, removeMoney} from '../lib/provider.js';
import { setHashParam } from '../lib/utils.js';
import { GenericView } from './genericView.js';
import { monsterDetailsView, accessoryDetailsView, accessoryListView } from './detailsViews.js';


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
        window.openBox = async (boxName) => {
            const money = await getMoney();
            const box = await getBox(boxName.toLowerCase());

            if (money >= box.price) {
                await removeMoney(box.price);
                const accessoryId = await this.getRandomAccessoryId(boxName);
                await addAccessoryToBackpack(accessoryId);
                await this.loadData();
                this.render();
            } else {
                alert("Vous n'avez pas assez de G !")
            }
        };
        window.showAccessoryList = (monsterId) => {
            setHashParam('equip', monsterId);
            accessoryListView.render(monsterId);
        };
        window.addAccessoryTo = async (monsterId, accessoryId) => {
            await addAccessoryToMonster(monsterId, accessoryId);
            removeHashParam('equip');
            await this.loadData();
            this.render();
        };
        window.sellItem = async (accessoryId) => {
            const accessory = await getAccessory(accessoryId);
            await addMoney(accessory.sellPrice);
            await removeAccessoryFromBackpack(accessoryId);
            await this.loadData();
            this.render();
        };
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        const accessoryDetail = params.get('accessory');
        const equip = params.get('equip');
    
        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else if (accessoryDetail) {
            accessoryDetailsView.render(accessoryDetail);
        } else if (equip) {
            accessoryListView.render(equip); 
        } else {
            monsterDetailsView.hide();
        }
    
        await this.loadData();
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async loadData() {
        this.party = await getParty();
    }

    async renderPartyCard(monster) {
        const monsterParty = await getMonsterFromParty(monster.id);

        let accessory = null;
        let buttonToAccessory = null;
        if (monsterParty.accessory) {
            accessory = await getAccessory(monsterParty.accessory);
            buttonToAccessory = `
                <div class='remove-button' onclick="event.stopPropagation(); setHashParam('accessory', ${accessory.id})">
                    <span class="material-symbols-rounded">motion_photos_on</span>
                </div>
            `;
        }

        return `
            <div id="${monster.id}" class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class='card-buttons'>
                    ${buttonToAccessory ? buttonToAccessory : ''}
                    <div class='accessory-button' onclick="event.stopPropagation(); showAccessoryList(${monster.id})">
                        <span class="material-symbols-rounded">add_link</span>
                    </div>
                    <div class='remove-button' onclick="event.stopPropagation(); removeMonsterFromParty(${monster.id})">
                        <span class="material-symbols-rounded">delete</span>
                    </div>
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
                <div class='remove-button' onclick="event.stopPropagation(); sellItem(${accessory.id})">
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
    
        const boxes = await getBoxes();
        let boxesHTML = '';
    
        for (const [boxKey, boxData] of Object.entries(boxes)) {
            const rankNames = await getRankNames(boxData.ranks);
            
            boxesHTML += `
                <div class="box-card" onclick="openBox('${boxKey}')">
                    <div class="box-image-container">
                        <img src="${BOXES_IMG_PATH}/${boxData.img}" alt="${boxData.name}">
                    </div>
                    <h3>${boxData.name}</h3>
                    <p>Raretés contenues : ${rankNames}</p>
                    <p>${boxData.price} G</p>
                </div>
            `;
        }
    
        return `
            <div class="game-section">
                <h2>Boîtes à accessoires</h2>
                <div class="boxes-container">
                    ${boxesHTML}
                </div>
            </div>
        `;
    }

    async renderMenu() {
        const money = await getMoney();
        return `
            <div class="party-menu">
                <p>Votre argent : ${money} G</p>
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
        const box = await getBox(boxName.toLowerCase());
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
        const randomIndex = Math.floor(Math.random() * accessories.length);
        return accessories[randomIndex].id;
    }
}

export const gameView = new GameView();