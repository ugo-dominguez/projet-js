import { router, appContainer } from '../init.js';


export function show404() {
    appContainer.innerHTML = `
        <div class="error-page">
        <h1 class="title">404 - Monstre non trouvé</h1>
        <button id="back-btn">Retour</button>
        </div>
    `;
    
    document.getElementById('back-btn').addEventListener('click', () => router.navigate('/'));
}