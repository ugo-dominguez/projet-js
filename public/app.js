import { getHashAndParams } from "./lib/utils.js";
import { notFoundView } from "./views/404View.js";
import { gameView } from "./views/gameView.js";
import { monsterListingView, accessoryListingView } from "./views/listingViews.js";


// Routing
const routes = {
    "": monsterListingView,
    "monsters": monsterListingView,
    "accessories": accessoryListingView,
    "404": notFoundView,
    "game": gameView
}

function handleRouting() {
    let { hash, params } = getHashAndParams();
    let route = hash.split('/')[0];

    if (routes.hasOwnProperty(route)) {
        routes[route].handleRouting(hash, params);
    } else {
        routes["404"].handleRouting();
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);
