import { MONSTERS_PER_PAGE, MONSTERS_THUMB_PATH, MAX_IN_PARTY } from '../lib/config.js';
import { getMonsters, getParty, addMonsterToParty } from '../lib/provider.js';
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
        window.addToParty = this.addToParty.bind(this);
    }

    get renderedMonsters() {
        let selectedPage = parseInt(getHashParam('page')) || 1;

        if (selectedPage > Math.ceil(this.monsters.length / MONSTERS_PER_PAGE)) {
            selectedPage = Math.ceil(this.monsters.length / MONSTERS_PER_PAGE);
        }

        return this.monsters.slice((selectedPage - 1) * MONSTERS_PER_PAGE, selectedPage * MONSTERS_PER_PAGE);
    }

    async addToParty(monsterId) {
        const party = await getParty();
        
        if (party.includes(monsterId)) {
            alert("Ce monstre est déjà dans l'équipe !");
            return;
        }

        if (party.length >= MAX_IN_PARTY) {
            alert('Votre équipe est complete !.');
            return;
        }

        await addMonsterToParty(monsterId);
        alert(`Le monstre a été ajouté à votre équipe !`);
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
        monsterListElement.innerHTML = displayedMonsters.map(p => `
            <div id=${p.monster_id} class="monster-card" onclick="setHashParam('detail', ${p.monster_id})">
                <div class="monster-card-content">
                    <div class='image-container'>
                        <div></div>
                        <img src="${MONSTERS_THUMB_PATH + p.identifier}-thumb.png" alt="${p.name}">
                    </div>
                    <h2>${p.name}</h2>
                </div>
                <div class='add-button' onclick="addToParty(${p.monster_id})">
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
