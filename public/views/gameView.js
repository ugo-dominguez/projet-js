import { MONSTERS_THUMB_PATH } from '../lib/config.js';
import { GenericView } from './genericView.js';

class GameView extends GenericView {
    constructor() {
        super();
        this.party = JSON.parse(localStorage.getItem('party')) || [];
        window.removeFromParty = this.removeFromParty.bind(this);
    }

    removeFromParty(monsterId) {
        this.party = this.party.filter(m => m.monster_id !== parseInt(monsterId));
        localStorage.setItem('party', JSON.stringify(this.party));
        this.render();
    }

    async handleRouting() {
        this.render();
    }

    async render() {
        this.details.innerHTML = '';
        this.app.innerHTML = `
            <h1 class="title">Votre Équipe</h1>
            ${this.renderPartyStatus()}
            <div class="party-list" id="party-list">
                ${this.renderPartyMembers()}
            </div>
        `;
    }

    renderPartyStatus() {
        return `
            <div class="party-status">
                <p>Membres de l'équipe : ${this.party.length} / 6</p>
            </div>
        `;
    }

    renderPartyMembers() {
        if (this.party.length === 0) {
            return `
                <div class="empty-party">
                    <p>Votre équipe est vide. Ajoutez des monstres depuis la liste des monstres!</p>
                    <button onclick="location.hash='listing'">Aller à la liste des monstres</button>
                </div>
            `;
        }

        return this.party.map(monster => `
            <div class="party-member" id="party-${monster.monster_id}">
                <div class='image-container'>
                    <img src="${MONSTERS_THUMB_PATH + monster.identifier}-thumb.png" alt="${monster.name}">
                </div>
                <div class="monster-details">
                    <h2>${monster.name}</h2>
                    <div class="monster-stats">
                        <p>Niveau: ${monster.level}</p>
                        <p>HP: ${monster.stats.hp} / ${monster.stats.max_hp}</p>
                        <p>MP: ${monster.stats.mp} / ${monster.stats.max_mp}</p>
                    </div>
                </div>
                <button onclick="removeFromParty(${monster.monster_id})">Retirer</button>
            </div>
        `).join('');
    }
}

export const gameView = new GameView();