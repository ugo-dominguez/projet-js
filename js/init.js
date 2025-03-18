import { Provider } from "./services/provider.js";
import { Router } from "./services/router.js";


export const dataProvider = new Provider();
export const router = new Router();
export const appContainer = document.getElementById('app-container');