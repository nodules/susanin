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
 * @param {Object|String} options
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
 * @param {Object|String} matchObject
 * @returns {Array|null}
 */
Router.prototype.find = function(matchObject) {
    var ret = [],
        parsed,
        i, size,
        routes = this._routes;

    for (i = 0, size = routes.length; i < size; ++i) {
        parsed = routes[i].match(matchObject);
        if (parsed !== null) {
            ret.push([ routes[i], parsed ]);
        }
    }

    return ret;
};

/**
 * Returns first successfully matched route
 * @param {Object|String} matchObject
 * @returns {Array|null}
 */
Router.prototype.findFirst = function(matchObject) {
    var parsed,
        i, size,
        routes = this._routes;

    for (i = 0, size = routes.length; i < size; ++i) {
        parsed = routes[i].match(matchObject);
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

Router.Route = Route;

module.exports = Router;
