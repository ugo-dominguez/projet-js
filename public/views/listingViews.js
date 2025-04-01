import { ITEMS_PER_PAGE, MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getMonsters, getAccessories, addMonsterToParty, getMonstersbyFamily, getMonstersbyRank, getRanks, getFamilies } from '../lib/provider.js';
import { getHashParam, setHashParam } from '../lib/utils.js';
import { monsterDetailsView, accessoryDetailsView } from './detailsViews.js';
import { GenericView } from './genericView.js';


class BaseListingView extends GenericView {
    constructor() {
        super();
        this.title = '';
        this.items = [];
    }

    get renderedItems() {
        let selectedPage = parseInt(getHashParam('page')) || 1;
        const itemsPerPage = this.itemsPerPage || ITEMS_PER_PAGE;

        if (selectedPage > Math.ceil(this.items.length / itemsPerPage)) {
            selectedPage = Math.ceil(this.items.length / itemsPerPage);
        }

        return this.items.slice((selectedPage - 1) * itemsPerPage, selectedPage * itemsPerPage);
    }

    async renderPagination() {
        const totalPages = Math.ceil(this.items.length / (this.itemsPerPage || ITEMS_PER_PAGE));
        const currentPage = parseInt(getHashParam('page')) || 1;
        
        if (totalPages <= 1) {
            return '';
        }
    
        let paginationHTML = '<div class="page-numbers">';
    
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="pagination-btn page-btn active">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-btn page-btn" onclick="setHashParam('page', ${i})">${i}</button>`;
            }
        }
        
        return paginationHTML + '</div>';
    }

    async render() {
        this.details.innerHTML = '';
        let displayedItems = this.renderedItems;
    
        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${this instanceof MonsterListingView ? await this.renderDropDown() : ''}
            ${await this.renderPagination()}
            <div class="item-list" id="item-list"></div>
        `;
        
        // Configure les event listeners après le rendu
        if (this instanceof MonsterListingView) {
            document.getElementById('familyFilter').addEventListener('change', () => {
                this.updateFilters();
            });
            document.getElementById('rankFilter').addEventListener('change', () => {
                this.updateFilters();
            });
        }
        
        const itemListElement = document.getElementById('item-list');
        itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
    }

    async renderItemCard(item) {
        throw new Error('renderItemCard() must be implemented by subclass');
    }
}


class MonsterListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des monstres';
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.currentFilter = null;
        window.filterByFamily = this.filterByFamily.bind(this);
        window.filterByRank = this.filterByRank.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
    
        window.monsterListingInstance = this; 
        window.addMonsterToParty = addMonsterToParty.bind(this);
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else {
            monsterDetailsView.hide();
        }
    
        // Force toujours le rendu quand les filtres changent
        const familyChanged = params.get('family') !== GenericView.previousParams.get('family');
        const rankChanged = params.get('rank') !== GenericView.previousParams.get('rank');
        
        if (familyChanged || rankChanged || hash !== GenericView.previousHash) {
            this.items = await getMonsters();
            let familyId = params.get('family');
            let rankId = params.get('rank');
            
            if (familyId || rankId) {
                this.items = this.items.filter(monster => 
                    (!familyId || monster.familyId == familyId) && 
                    (!rankId || monster.rankId == rankId)
                );
                this.currentFilter = `Filtre actif: ${familyId ? 'Famille ' + familyId : ''} ${rankId ? 'Rang ' + rankId : ''}`.trim();
            } else {
                this.currentFilter = null;
            }
            
            await this.render();
        }
        
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async renderDropDown() {
        const families = await getFamilies();
        const ranks = await getRanks();
        const currentFamily = getHashParam('family');
        const currentRank = getHashParam('rank');
    
        return `
            <div class="filters-container">
                <select id="familyFilter" class="filter-dropdown">
                    <option value="">Toutes les familles</option>
                    ${families.map(family => `
                        <option value="${family.id}" ${currentFamily === family.id.toString() ? 'selected' : ''}>
                            ${family.name}
                        </option>
                    `).join('')}
                </select>
                
                <select id="rankFilter" class="filter-dropdown">
                    <option value="">Tous les rangs</option>
                    ${ranks.map(rank => `
                        <option value="${rank.id}" ${currentRank === rank.id.toString() ? 'selected' : ''}>
                            ${rank.name}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    async filterByFamily(familyId) {
        this.items = await getMonstersbyFamily(familyId);
        this.currentFilter = `Famille: ${familyId}`;
        super.render();
    }

    async filterByRank(rankId) {
        this.items = await getMonstersbyRank(rankId);
        this.currentFilter = `Rang: ${rankId}`;
        super.render();
    }

    async renderItemCard(monster) {
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class='add-button' onclick="event.stopPropagation(); addMonsterToParty(${monster.id})">
                    <span class="material-symbols-rounded">add</span>
                </div>
            </div>
        `;
    }
    
    async updateFilters() {
        const familyFilter = document.getElementById('familyFilter');
        const rankFilter = document.getElementById('rankFilter');
        
        let params = new URLSearchParams();
        
        if (familyFilter.value) params.set('family', familyFilter.value);
        if (rankFilter.value) params.set('rank', rankFilter.value);
        
        // Réinitialise la page à 1 quand on change de filtre
        params.set('page', '1');
        
        window.location.hash = `monsters?${params.toString()}`;
    }
}


class AccessoryListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des accessoires';
        this.itemsPerPage = ITEMS_PER_PAGE;
    }

    async handleRouting(hash, params) {
        const accessoryDetail = params.get('accessory');

        if (accessoryDetail) {
            accessoryDetailsView.render(accessoryDetail);
        } else {
            accessoryDetailsView.hide();
        }

        if (hash != "" && hash === GenericView.previousHash) {
            let page = params.get('page');
            if (page !== GenericView.previousParams.get('page')) {
                GenericView.previousParams = params;
                this.render();
                return;
            } else {
                return;
            }
        }

        this.items = await getAccessories();
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async renderItemCard(item) {
        return `
            <div id=${item.id} class="monster-card" onclick="setHashParam('accessory', ${item.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${ACCESSORY_IMG_PATH}" alt="${item.name}">
                    </div>
                    <h2>${item.name}</h2>
                </div>
            </div>
        `;
    }
}

export const monsterListingView = new MonsterListingView();
export const accessoryListingView = new AccessoryListingView();
