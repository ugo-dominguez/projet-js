import { MONSTERS_PER_PAGE, MONSTERS_THUMB_PATH, MAX_IN_PARTY } from '../lib/config.js';
import { getMonsters, addMonsterToParty,  getMonstersbyFamily, getMonstersbyRank } from '../lib/provider.js';
import { getHashParam, setHashParam } from '../lib/utils.js';
import { detailsView } from './detailsView.js';
import { GenericView } from './genericView.js';


class ListingView extends GenericView {
    constructor() {
        super();

        GenericView.previousParams = new URLSearchParams();

        this.title = '';
        this.monsters = [];

        window.currentPage = this.currentPage;
        window.addMonsterToParty = addMonsterToParty.bind(this);
    }

    get renderedMonsters() {
        let selectedPage = parseInt(getHashParam('page')) || 1;

        if (selectedPage > Math.ceil(this.monsters.length / MONSTERS_PER_PAGE)) {
            selectedPage = Math.ceil(this.monsters.length / MONSTERS_PER_PAGE);
        }

        return this.monsters.slice((selectedPage - 1) * MONSTERS_PER_PAGE, selectedPage * MONSTERS_PER_PAGE);
    }

    async handleRouting(hash, params) {
        const detail = params.get('detail');

        if (detail) {
            detailsView.render(detail);
        } else {
            detailsView.hide();
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

        switch (hash) {
            case 'favorites':
                this.title = "Liste des favoris"; 
                this.monsters = await getMonsters();
                break;
                
            case 'families':
                this.title = "Petite liste des familles"; 
                this.monsters = await getMonstersbyFamily();
                break;
            
            case 'ranks':
                this.title = "Liste des monstres par rangs"; 
                this.monsters = await getMonstersbyRank();
                break;

            
            default:
                this.title = "Liste des monstres";
                this.monsters = await getMonsters();
                break;
        }

        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params
    }

    async render() {
        this.details.innerHTML = '';
        let displayedMonsters = this.renderedMonsters;

        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${await this.renderPagination()}
            <div class="monster-list" id="monster-list"></div>
        `;
        
        const monsterListElement = document.getElementById('monster-list');
        monsterListElement.innerHTML = displayedMonsters.map(monster => `
            <div id=${monster.id} class="monster-card" onclick="setHashParam('detail', ${monster.id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <img src="${MONSTERS_THUMB_PATH + monster.identifier}-thumb.png" alt="${monster.name}">
                    </div>
                    <h2>${monster.name}</h2>
                </div>
                <div class='add-button' onclick="event.stopPropagation(); addMonsterToParty(${monster.id})">
                    <span class="material-symbols-rounded">add</span>
                </div>
            </div>`
        ).join('');
    }

    async renderPagination() {
        const totalPages = Math.ceil(this.monsters.length / MONSTERS_PER_PAGE);
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
}

export const listingView = new ListingView();
