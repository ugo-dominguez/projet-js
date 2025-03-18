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
        
        const routeHandler = this.routes[this.currentUrl] || this.routes['404'];
        routeHandler();
        
        window.location.hash = this.currentUrl;
    }
    
    init() {
        this.navigate(window.location.hash || '/');
    }
  }