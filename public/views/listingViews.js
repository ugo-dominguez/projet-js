import { ITEMS_PER_PAGE, MONSTERS_THUMB_PATH, ACCESSORY_IMG_PATH } from '../lib/config.js';
import { getMonsters, getAccessories, addMonsterToParty } from '../lib/provider.js';
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
        itemListElement.innerHTML = (await Promise.all(displayedItems.map(item => this.renderItemCard(item)))).join('');
      
        this.setupLazyLoading();
      }
      
      setupLazyLoading() {
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
        window.addMonsterToParty = addMonsterToParty.bind(this);
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

        this.items = await getMonsters();
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
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
                <div class='add-button' onclick="event.stopPropagation(); addMonsterToParty(${monster.id})">
                    <span class="material-symbols-rounded">add</span>
                </div>
            </div>
        `;
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
                        <img src="placeholder.jpg" data-src="${ACCESSORY_IMG_PATH}" loading="lazy" alt="${item.name}">
                    </div>
                    <h2>${item.name}</h2>
                </div>
            </div>
        `;
    }
}

export const monsterListingView = new MonsterListingView();
export const accessoryListingView = new AccessoryListingView();
