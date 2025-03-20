import { GenericView } from './genericView.js';


class NotFoundView extends GenericView {
    constructor() {
        super();
    }

    async handleRouting(hash, params) {
        super.handleRouting(hash, params)
        this.render()
    }

    async render() {
        this.details.innerHTML = '';

        this.app.innerHTML = `
            <div class="title" id="not-found">
                <h1>404</h1>
                <p>La page demandée n'existe pas.</p>
                <a onclick="location.hash='listing';">Retour à l'accueil</a>
            </div>
        `;
    }
}

export const notFoundView = new NotFoundView();
