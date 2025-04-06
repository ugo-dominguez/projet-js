import { ITEMS_PER_PAGE, MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getAccessoriesByRank, addMonsterToParty, getRanks, getFamilies, getMonstersByFamilyAndRank, addToFavorites, removeFromFavorites, isFavorite, getFavorites, getMonster } from '../lib/provider.js';
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
            ${await this.renderPagination()}
            <div class="item-list" id="item-list"></div>
        `;
        
        const itemListElement = document.getElementById('item-list');
        if (displayedItems.length === 0) {
            itemListElement.innerHTML = `
                <div class="title" id="not-found">
                    <h3>Aucun monstres trouvés !</h3>
                </div>
            `;
        } else {
            itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
        }
      
        this.setupLazyLoading();
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
}


class MonsterListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des monstres';
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.currentRankFilter = getHashParam('rank');
        this.currentFamilyFilter = getHashParam('family');
        window.addMonsterToParty = addMonsterToParty.bind(this);
        window.monsterListingView = this;
        window.addToFavorites = async (monsterId) => {
            await addToFavorites(monsterId);
            this.render();
        };
        window.removeFromFavorites = async (monsterId) => {
            await removeFromFavorites(monsterId);
            this.render();
        };
    }

    async handleRouting(hash, params) {
        const monsterDetail = params.get('monster');
        this.currentRankFilter = params.get('rank') || null;
        this.currentFamilyFilter = params.get('family') || null;
    
        if (monsterDetail) {
            monsterDetailsView.render(monsterDetail);
        } else {
            monsterDetailsView.hide();
        }
    
        if (hash != "" && hash === GenericView.previousHash) {
            let page = params.get('page');
            if (page !== GenericView.previousParams.get('page') || 
                this.currentRankFilter !== GenericView.previousParams.get('rank') ||
                this.currentFamilyFilter !== GenericView.previousParams.get('family')) {
                GenericView.previousParams = params;
                this.render();
                return;
            } else {
                return;
            }
        }
    
        this.items = await getMonstersByFamilyAndRank(this.currentFamilyFilter, this.currentRankFilter);
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async handleRankFilter(value) {
        this.currentRankFilter = value;
        setHashParam('rank', value);
        await this.applyFilters();
    }

    async handleFamilyFilter(value) {
        this.currentFamilyFilter = value;
        setHashParam('family', value);
        await this.applyFilters();
    }

    async applyFilters() {
        this.items = await getMonstersByFamilyAndRank(this.currentFamilyFilter || null, this.currentRankFilter || null);
        removeHashParam('page');
        this.render();
    }

    async renderFiltersControls() {
        const ranks = await getRanks();
        const families = await getFamilies();
    
        const rankOptions = ranks.map(rank => 
            `<option value="${rank.id}" ${this.currentRankFilter === rank.id ? 'selected' : ''}>${rank.name}</option>`
        ).join('');
    
        const familyOptions = families.map(family => 
            `<option value="${family.id}" ${this.currentFamilyFilter === family.id ? 'selected' : ''}>${family.name}</option>`
        ).join('');
    
        return `
            <div class="filters-container">
                <select id="rank-filter" onchange="monsterListingView.handleRankFilter(this.value)">
                    <option value="">Tous les rangs</option>
                    ${rankOptions}
                </select>
                <select id="family-filter" onchange="monsterListingView.handleFamilyFilter(this.value)">
                    <option value="">Toutes les familles</option>
                    ${familyOptions}
                </select>
            </div>
        `;
    }

    async renderItemCard(monster) {
        let favButton = null;
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
                        <img src="${ACCESSORY_IMG_PATH}" data-src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" loading="lazy" alt="${monster.name}">
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

    async render() {
        this.details.innerHTML = '';
        let displayedItems = this.renderedItems;
      
        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${await this.renderFiltersControls()}
            ${await this.renderPagination()}
            <div class="item-list" id="item-list"></div>
        `;
        
        const itemListElement = document.getElementById('item-list');
        if (displayedItems.length === 0) {
            itemListElement.innerHTML = `
                <div class="title" id="not-found">
                    <h3>Aucun monstres trouvés !</h3>
                </div>
            `;
        } else {
            itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
        }
      
        this.setupLazyLoading();
    }
}


class FavoritesListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des monstres';
        this.itemsPerPage = ITEMS_PER_PAGE;
        window.addMonsterToParty = addMonsterToParty.bind(this);
        window.favAddToFavorites = async (monsterId) => {
            await addToFavorites(monsterId);
            this.render();
        };
        window.favRemoveFromFavorites = async (monsterId) => {
            await removeFromFavorites(monsterId);
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
    
        this.items = await getFavorites();
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async renderItemCard(favorite) {
        const monster = await getMonster(favorite.id);
        
        let favButton = null;
        if (!(await isFavorite(monster.id))) {
            favButton = `
                <div class='add-button' onclick="event.stopPropagation(); favAddToFavorites(${monster.id});">
                    <span class="material-symbols-rounded">favorite</span>
                </div>
            `
        } else {
            favButton = `
                <div class='add-button' onclick="event.stopPropagation(); favRemoveFromFavorites(${monster.id});">
                    <span class="material-symbols-rounded">heart_minus</span>
                </div>
            `
        }
        return `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('monster', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${ACCESSORY_IMG_PATH}" data-src="${MONSTERS_THUMB_PATH}/${monster.identifier}-thumb.png" loading="lazy" alt="${monster.name}">
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

    async render() {
        this.details.innerHTML = '';
        let displayedItems = this.renderedItems;
      
        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${await this.renderPagination()}
            <div class="item-list" id="item-list"></div>
        `;
        
        const itemListElement = document.getElementById('item-list');
        if (displayedItems.length === 0) {
            itemListElement.innerHTML = `
                <div class="title" id="not-found">
                    <h3>Aucun monstres trouvés !</h3>
                </div>
            `;
        } else {
            itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
        }
      
        this.setupLazyLoading();
    }
}


class AccessoryListingView extends BaseListingView {
    constructor() {
        super();
        this.title = 'Liste des accessoires';
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.currentRankFilter = getHashParam('rank');
        window.accessoryListingView = this;
    }

    async handleRouting(hash, params) {
        const accessoryDetail = params.get('accessory');
        this.currentRankFilter = params.get('rank') || null;

        if (accessoryDetail) {
            accessoryDetailsView.render(accessoryDetail);
        } else {
            accessoryDetailsView.hide();
        }
    
        if (hash != "" && hash === GenericView.previousHash) {
            let page = params.get('page');
            if (page !== GenericView.previousParams.get('page') || 
                this.currentRankFilter !== GenericView.previousParams.get('rank')) {
                GenericView.previousParams = params;
                this.render();
                return;
            } else {
                return;
            }
        }
    
        this.items = await getAccessoriesByRank(this.currentRankFilter);
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async handleRankFilter(value) {
        this.currentRankFilter = value;
        setHashParam('rank', value);
        await this.applyFilters();
    }

    async applyFilters() {
        this.items = await getAccessoriesByRank(this.currentRankFilter || null);
        removeHashParam('page');
        this.render();
    }

    async renderFiltersControls() {
        const ranks = await getRanks();
    
        const rankOptions = ranks.map(rank => 
            `<option value="${rank.id}" ${this.currentRankFilter === rank.id ? 'selected' : ''}>${rank.name}</option>`
        ).join('');
    
        return `
            <div class="filters-container">
                <select id="rank-filter" onchange="accessoryListingView.handleRankFilter(this.value)">
                    <option value="">Tous les rangs</option>
                    ${rankOptions}
                </select>
            </div>
        `;
    }

    async renderItemCard(item) {
        return `
            <div id=${item.id} class="monster-card" onclick="setHashParam('accessory', ${item.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${ACCESSORY_IMG_PATH}" data-src="${ACCESSORY_IMG_PATH}" loading="lazy" alt="${item.name}">
                    </div>
                    <h2>${item.name}</h2>
                </div>
            </div>
        `;
    }

    async render() {
        this.details.innerHTML = '';
        let displayedItems = this.renderedItems;
      
        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${await this.renderFiltersControls()}
            ${await this.renderPagination()}
            <div class="item-list" id="item-list"></div>
        `;
        
        const itemListElement = document.getElementById('item-list');
        if (displayedItems.length === 0) {
            itemListElement.innerHTML = `
                <div class="title" id="not-found">
                    <h3>Aucun accessoires trouvés !</h3>
                </div>
            `;
        } else {
            itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
        }
      
        this.setupLazyLoading();
    }
}

export const monsterListingView = new MonsterListingView();
export const accessoryListingView = new AccessoryListingView();
export const favoriteListingView = new FavoritesListingView();