import { ITEMS_PER_PAGE, MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getMonsters, getMonster, getAccessories, addMonsterToParty, getMonstersbyFamily, getMonstersbyRank, getRanks, getFamilies, getFavorites, addToFavorites, removeFromFavorites, isFavorite } from '../lib/provider.js';
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

    async handleRouting(hash, params) {
        const pageChanged = params.get('page') !== GenericView.previousParams.get('page');
        const filtersChanged = 
            params.get('family') !== GenericView.previousParams.get('family') ||
            params.get('rank') !== GenericView.previousParams.get('rank');

        if (pageChanged || filtersChanged || hash !== GenericView.previousHash) {
            await this.loadData();
            await this.render();
        }

        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async loadData() {
        throw new Error('loadData() must be implemented by subclass');
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
        await this.setupLazyLoading();
    }

    async setupLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          });
        });
      
        document.querySelectorAll('#item-list img[data-src]').forEach(img => {
          observer.observe(img);
        });
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

        window.addToFavorites = async (monsterId) => {
            await addToFavorites(monsterId);
            this.loadData();
            this.render();
        };

        window.removeFromFavorites = async (monsterId) => {
            await removeFromFavorites(monsterId);
            this.loadData();
            this.render();
        };
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else {
            monsterDetailsView.hide();
        }
    
        await super.handleRouting(hash, params);
    }

    async loadData() {
        this.items = await getMonsters();
        const familyId = getHashParam('family');
        const rankId = getHashParam('rank');
        
        if (familyId || rankId) {
            this.items = this.items.filter(monster => 
                (!familyId || monster.familyId == familyId) && 
                (!rankId || monster.rankId == rankId)
            );
        }
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
        let favButton = null;
        console.log(isFavorite(monster.id));
        if (!(await isFavorite(monster.id))) {
            favButton = `
                <div class='add-button' onclick="event.stopPropagation(); addToFavorites(${monster.id});">
                    <span class="material-symbols-rounded">favorite</span>
                </div>
            `
        } else {
            favButton = `
                <div class='add-button' onclick="event.stopPropagation(); removeFromFavorites(${monster.id});">
                    <span class="material-symbols-rounded">heart_minus</span>
                </div>
            `
        }
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="placeholder.jpg" data-src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" loading="lazy" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class="card-buttons">
                    <div class='add-button' onclick="event.stopPropagation(); addMonsterToParty(${monster.id})">
                        <span class="material-symbols-rounded">add</span>
                    </div>
                    ${favButton? favButton : ''}
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
        params.set('page', '1');
        await this.handleRouting('monsters', params);
    }
}


class AccessoryListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des accessoires';
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

    async loadData() {
        this.items = await getAccessories();
    }

    async handleRouting(hash, params) {
        const accessoryDetail = params.get('accessory');
        if (accessoryDetail) {
            accessoryDetailsView.render(accessoryDetail);
        } else {
            accessoryDetailsView.hide();
        }

        await super.handleRouting(hash, params);
    }

    async renderItemCard(item) {
        return `
            <div id=${item.id} class="monster-card" onclick="setHashParam('accessory', ${item.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="placeholder.jpg" data-src="${ACCESSORY_IMG_PATH}" loading="lazy" alt="${item.name}">
                    </div>
                    <h2>${item.name}</h2>
                </div>
            </div>
        `;
    }
}

class FavoriteListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Mes Favoris';
        
        window.removeFromFavoritesFav = async (monsterId) => {
            await removeFromFavorites(monsterId);
            await this.loadData();
            this.render();
        };
    }

    async loadData() {
        const favorites = await getFavorites();
        this.items = await Promise.all(favorites.map(async fav => {
            const monster = await getMonster(fav.id);
            return { ...monster, favoriteId: fav.id };
        }));
    }

    async renderItemCard(monster) {
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="placeholder.jpg" data-src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" loading="lazy" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class='card-buttons'>
                    <div class='remove-button' onclick="event.stopPropagation(); removeFromFavoritesFav(${monster.favoriteId})">
                        <span class="material-symbols-rounded">heart_minus</span>
                    </div>
                </div>
            </div>
        `;
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else {
            monsterDetailsView.hide();
        }

        await super.handleRouting(hash, params);
    }
}

export const monsterListingView = new MonsterListingView();
export const accessoryListingView = new AccessoryListingView();
export const favoriteListingView = new FavoriteListingView();
