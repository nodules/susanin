var Route = require('./route');

/**
 * @constructor
 */
function Router() {
    this._routes = null;
    this._routesByName = null;
}

/**
 * Добавляет роут
 * @param {String} method http метод
 * @param {String} name имя роута
 * @param {String} pattern паттерн соответствия
 * @param {Object} [conditions] условия, накладываемые на параметры
 * @param {Object} [defaults] умалчиваемые значения параметров
 */
Router.prototype.addRoute = function(method, name, pattern, conditions, defaults) {
    var route;

    route = new Route(method, name, pattern, conditions, defaults);

    this._routes || (this._routes = []);
    this._routes.push(route);

    this._routesByName || (this._routesByName = {});
    this._routesByName[name] = route;

    return route;
};

/**
 * Находит первый подходящий роут по пути и методу,
 * возвращает массив с привязанными данными и распарсенными параметрами либо null, если ни один из роутов не подошёл
 * @return {Array}
 */
Router.prototype.find = function() {
    var ret = null,
        parsed,
        i, size,
        routes = this._routes;

    if (routes) {
        for (i = 0, size = routes.length; i < size; ++i) {
            parsed = routes[i].parse.apply(routes[i], arguments);
            if (parsed !== null) {
                ret = [ routes[i], parsed ];
                break;
            }
        }
    }

    return ret;
};

/**
 * Возвращает роут по имени
 * @param {String} name
 * @return {Route}
 */
Router.prototype.getRouteByName = function(name) {
    return (this._routesByName && this._routesByName[name]) || null;
};

/**
 * Формирует бандл для прокидывания на клиент
 * @return {Array}
 */
Router.prototype.bundle = function() {
    return this._routes && this._routes.map(function(route) {
        return route.bundle();
    });
};

/**
 * Шорткаты: router.get(..), router.post(...) и т.д.
 */
Route.HTTP_METHODS.forEach(function(method) {
    Router.prototype[method.toLowerCase()] = function() {
        var args = [ method ].concat(Array.prototype.slice.call(arguments));

        return this.addRoute.apply(this, args);
    };
});

module.exports = Router;