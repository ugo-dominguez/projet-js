export class Router {
    constructor() {
        this.routes = {};
        this.currentUrl = '';
        
        window.addEventListener('popstate', () => this.navigate(window.location.hash));
    }
    
    addRoute(route, handler) {
        this.routes[route] = handler;
        return this;
    }
    
    navigate(url) {
        this.currentUrl = url.replace('#', '');
        
        if (this.currentUrl === '') {
            this.currentUrl = '/';
        }
        
        let matchedRoute = Object.keys(this.routes).find(route => {
            const regex = new RegExp(`^${route.replace(':id', '(.+)')}$`);
            return regex.test(this.currentUrl);
        });
    
        if (matchedRoute) {
            const id = this.currentUrl.match(new RegExp(`^${matchedRoute.replace(':id', '(.+)')}$`))[1];
            this.routes[matchedRoute](id);
        } else {
            (this.routes['404'] || (() => {}))();
        }
        
        window.location.hash = this.currentUrl;
    }
    
    init() {
        this.navigate(window.location.hash || '/');
    }  
}