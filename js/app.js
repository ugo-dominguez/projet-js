import { showMonsterList, showMonsterDetail } from './views/views.js';
import { show404 } from './views/error.js';

import { router } from './init.js';


const routes = {
    '/': showMonsterList,
    '/monster/:id': showMonsterDetail,
    '404': show404
};

for (const path in routes) {
    if (path.includes(':id')) {
        router.addRoute(path.replace('/:id', '/:id'), (id) => {
            routes[path](id);
        });
    } else {
        router.addRoute(path, routes[path]);
    }
}

router.init();
