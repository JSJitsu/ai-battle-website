var router = {
    routes: [],
    on: function (route, handler) {

        route = route.replace(/:\w+/g, '(.+)');

        this.routes.push({
            regex: new RegExp(route),
            handler: handler
        });
    },
    handler: function () {
        var hash = location.hash.substr(1),
            routes = this.routes,
            matches;

        for (var i=0; i < routes.length; i++) {
            matches = hash.match(routes[i].regex);
            if (matches) {
                routes[i].handler.apply(this, matches.slice(1));
            }
        }
    },
    addListenerAndTrigger: function (route, handler) {
        this.on(route, handler);

        if (window.location.hash) {
            this.handler();
        } else {
            handler();
        }
    }
};

window.addEventListener('hashchange', router.handler.bind(router));