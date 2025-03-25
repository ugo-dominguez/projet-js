import { getHashAndParams } from "./lib/utils.js";
import { notFoundView } from "./views/404View.js";
import { gameView } from "./views/gameView.js";
import { listingView } from "./views/listingView.js";


// Routing
const routes = {
    "": listingView,
    "listing": listingView,
    "families": listingView,
    "ranks": listingView,
    "favorites": listingView,
    "404": notFoundView,
    "game": gameView
}

function handleRouting() {
    let { hash, params } = getHashAndParams();
    let route = hash.split('/')[0];
    console.log(route);

    if (routes.hasOwnProperty(route)) {
        routes[route].handleRouting(hash, params);
    } else {
        routes["404"].handleRouting();
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);
