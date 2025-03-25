import { MONSTERS_THUMB_PATH } from '../lib/config.js';
import { getParty } from '../lib/provider.js';
import { GenericView } from './genericView.js';

class GameView extends GenericView {
    constructor() {
        super();
        this.party = getParty();
    }

    async handleRouting(hash, params) {
        super.handleRouting(hash, params)
        this.render()
    }

    async render() {
        this.details.innerHTML = '';
        this.app.innerHTML = `
            <h1 class="title">Votre Équipe</h1>
        `;
    }
}

export const gameView = new GameView();