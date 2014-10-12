var Route = require('./route');

/**
 * Creates new Router
 * @constructor
 */
function Router() {
    if ( ! (this instanceof Router)) {
        return new Router();
    }

    this._routes = [];
    this._routesByName = {};
}

/**
 * Add route
 * @param {RouteOptions} options
 * @returns {Route}
 */
Router.prototype.addRoute = function(options) {
    var route,
        name;

    route = new Route(options);

    this._routes.push(route);
    name = route.getName();
    name && (this._routesByName[name] = route);

    return route;
};

/**
 * Returns all successfully matched routes
 * @returns {[ Route, Object ][]}
 */
Router.prototype.find = function() {
    var ret = [],
        parsed,
        i, size,
        routes = this._routes;

    for (i = 0, size = routes.length; i < size; ++i) {
        parsed = routes[i].match.apply(routes[i], arguments);
        if (parsed !== null) {
            ret.push([ routes[i], parsed ]);
        }
    }

    return ret;
};

/**
 * Returns first successfully matched route
 * @returns {[ Route, Object ]|null}
 */
Router.prototype.findFirst = function() {
    var parsed,
        i, size,
        routes = this._routes;

    for (i = 0, size = routes.length; i < size; ++i) {
        parsed = routes[i].match.apply(routes[i], arguments);
        if (parsed !== null) {
            return [ routes[i], parsed ];
        }
    }

    return null;
};

/**
 * Returns a route by its name
 * @param {String} name
 * @returns {Route}
 */
Router.prototype.getRouteByName = function(name) {
    return this._routesByName[name] || null;
};

/**
 * @static
 * @type {Route}
 */
Router.Route = Route;

module.exports = Router;
