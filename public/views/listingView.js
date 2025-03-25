import { MONSTERS_PER_PAGE, MONSTERS_THUMB_PATH, MAX_IN_PARTY } from '../lib/config.js';
import { getMonsters, addMonsterToParty, getMonstersbyFamily, getMonstersbyRank, getFamilies, getRanks } from '../lib/provider.js';
import { getHashParam, setHashParam } from '../lib/utils.js';
import { detailsView } from './detailsView.js';
import { GenericView } from './genericView.js';

class ListingView extends GenericView {
    constructor() {
        super();

        GenericView.previousParams = new URLSearchParams();

        this.title = '';
        this.monsters = [];
        this.currentFilter = 'normal'; 
        this.selectedOptions = new Set();

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
    
        // Vérifie si les paramètres ont changé
        if (hash !== "" && hash === GenericView.previousHash) {
            let page = params.get('page');
            if (page !== GenericView.previousParams.get('page')) {
                GenericView.previousParams = params;
                this.render();
                return;
            } else {
                return;
            }
        }
    
        // Mise à jour du filtre sélectionné et des options cochées
        this.currentFilter = params.get('filter') || hash || 'normal';
        this.selectedOptions = new Set(params.getAll('selected'));
    
        // Pour gérer la pagination proprement, on garde uniquement le paramètre page actuel
        let page = params.get('page');
        if (page) {
            params.delete('page'); 
            params.set('page', page); 
        }
    
        switch (this.currentFilter) {
            case 'families':
                this.title = "Liste des familles de monstres";
                if (this.selectedOptions.size > 0) {
                    // Récupérer les monstres correspondant aux familles sélectionnées
                    const monstersByFamily = await Promise.all(
                        [...this.selectedOptions].map(async (familyId) => {
                            // Correction : Utiliser getMonsters et filtrer par famille
                            const allMonsters = await getMonsters();
                            return allMonsters.filter(monster => monster.family_id === parseInt(familyId));
                        })
                    );
                    this.monsters = monstersByFamily.flat();
                } else {
                    this.monsters = await getMonsters();
                }
                break;
    
            case 'ranks':
                this.title = "Liste des monstres par rangs";
                if (this.selectedOptions.size > 0) {
                    // Récupérer les monstres correspondant aux rangs sélectionnés
                    const monstersByRank = await Promise.all(
                        [...this.selectedOptions].map(async (rankId) => {
                            // Correction : Utiliser getMonsters et filtrer par rang
                            const allMonsters = await getMonsters();
                            return allMonsters.filter(monster => monster.rank_id === parseInt(rankId));
                        })
                    );
                    this.monsters = monstersByRank.flat();
                } else {
                    this.monsters = await getMonsters();
                }
                break;
    
            case 'favorites':
                this.title = "Liste des favoris";
                this.monsters = await getMonsters(); // À remplacer par votre logique de favoris
                break;
    
            default:
                this.title = "Liste des monstres";
                this.monsters = await getMonsters();
                break;
        }
    
        this.render();
        GenericView.previousHash = hash;
        GenericView.previousParams = params;
    }

    async renderDropdownMenu() {
        return `
            <select id="filter-select">
                <option value="normal" ${this.currentFilter === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="families" ${this.currentFilter === 'families' ? 'selected' : ''}>Famille</option>
                <option value="ranks" ${this.currentFilter === 'ranks' ? 'selected' : ''}>Rang</option>
            </select>
        `;
    }

    async renderCheckboxFilters() {
        if (this.currentFilter === 'families') {
            const families = await getFamilies();
            return families.map(f => `
                <label>
                    <input type="checkbox" value="${f.id}" ${this.selectedOptions.has(f.id.toString()) ? 'checked' : ''}>
                    ${f.name}
                </label>
            `).join('');
        } else if (this.currentFilter === 'ranks') {
            const ranks = await getRanks();
            return ranks.map(r => `
                <label>
                    <input type="checkbox" value="${r.id}" ${this.selectedOptions.has(r.id.toString()) ? 'checked' : ''}>
                    ${r.name}
                </label>
            `).join('');
        }
        return '';
    }

    async render() {
        this.details.innerHTML = '';
        let displayedMonsters = this.renderedMonsters;

        this.app.innerHTML = `
            <h1 class="title">${this.title}</h1>
            ${await this.renderDropdownMenu()}
            <div id="filter-options">${await this.renderCheckboxFilters()}</div>
            ${await this.renderPagination()}
            <div class="monster-list" id="monster-list"></div>
        `;
    
        // Modification du dropdown
        document.getElementById('filter-select').addEventListener('change', (event) => {
            setHashParam('filter', event.target.value);
            this.handleRouting(event.target.value, new URLSearchParams(window.location.hash.replace('#', '?')));
        });
    
        document.querySelectorAll('#filter-options input[type=checkbox]').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const selectedOptions = Array.from(
                    document.querySelectorAll('#filter-options input[type=checkbox]:checked')
                ).map(cb => cb.value);
        
                // Clear existing selected parameters and add new ones
                let newHash = `#${this.currentFilter}`;
                if (selectedOptions.length > 0) {
                    const params = new URLSearchParams();
                    selectedOptions.forEach(option => {
                        params.append('selected', option);
                    });
                    newHash += `?${params.toString()}`;
                }
        
                window.location.hash = newHash;
            });
        });
    
        const monsterListElement = document.getElementById('monster-list');
        monsterListElement.innerHTML = displayedMonsters.map(monster => 
            `<div id="${monster.id}" class="monster-card" onclick="setHashParam('detail', ${monster.id})">
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