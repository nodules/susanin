(function(global) {

    var hasOwnProp = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        isArray = function(subject) {
            return toString.call(subject) === '[object Array]';
        };

    var querystring = {

        /**
         * Парсит строку вида "param1=value1&param2=value2&param2&param3=value3"
         * и возвращает объект:
         * {
         *     param1 : value1,
         *     parma2 : [ value2, '' ],
         *     param3 : value3
         * }
         * Аналог http://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq
         * @static
         * @param {String} query
         * @param {String} [sep='&']
         * @param {String} [eq='=']
         * @return {Object}
         */
        parse : function (query, sep, eq) {
            var params = {},
                queryParams,
                tmp, value, key,
                i, size;

            arguments.length || (query = location.search.substr(1));

            if (!query) {
                return params;
            }

            sep || (sep = '&');
            eq || (eq = '=');

            queryParams = query.split(sep);

            for (i = 0, size = queryParams.length; i < size; ++i) {
                tmp = queryParams[i].split(eq);
                value = typeof tmp[1] !== 'undefined' ? decodeURIComponent(tmp[1].replace(/\+/g, '%20')) : '';
                key = decodeURIComponent(tmp[0]);

                if (params.hasOwnProperty(key)) {
                    if (!Array.isArray(params[key])) {
                        params[key] = [params[key], value];
                    } else {
                        params[key].push(value);
                    }
                } else {
                    params[key] = value;
                }
            }

            return params;
        },

        /**
         * Метод обратный parse
         * Аналог http://nodejs.org/api/querystring.html#querystring_querystring_stringify_obj_sep_eq
         * @static
         * @param {Object} params
         * @param {String} [sep='&']
         * @param {String} [eq='=']
         * @return {String}
         */
        stringify : function (params, sep, eq) {
            var query = '',
                value,
                typeOf,
                tmpArray,
                i, size, key;

            if (!params) {
                return query;
            }

            sep || (sep = '&');
            eq || (eq = '=');

            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    tmpArray = [].concat(params[key]);
                    for (i = 0, size = tmpArray.length; i < size; ++i) {
                        typeOf = typeof tmpArray[i];

                        if (typeOf === 'object' || typeOf === 'undefined') {
                            value = '';
                        } else {
                            value = encodeURIComponent(tmpArray[i]);
                        }

                        query += sep + encodeURIComponent(key) + eq + value;
                    }
                }
            }

            return query.substr(sep.length);
        }

    };

    var escape = (function() {
        var SPECIAL_CHARS = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ],
            SPECIAL_CHARS_REGEXP = new RegExp('(\\' + SPECIAL_CHARS.join('|\\') + ')', 'g');

        return function(text) {
            return text.replace(SPECIAL_CHARS_REGEXP, '\\$1');
        };
    })();

    var HTTP_METHODS = [ 'GET', 'POST', 'DELETE', 'PUT' ];
    var HTTP_METHODS_REGEXP = new RegExp('^(' + HTTP_METHODS.join('|') + ')$');

    var PARAM_OPENED_CHAR = '<';
    var PARAM_CLOSED_CHAR = '>';

    var GROUP_OPENED_CHAR = '(';
    var GROUP_CLOSED_CHAR = ')';

    var PARAM_NAME_REGEXP_SOURCE = '[a-zA-Z_][\\w\\-]*';
    var PARAM_VALUE_REGEXP_SOURCE = '[\\w\\-]+';

    var PARSE_PARAMS_REGEXP =
        new RegExp(
            '(' +
                escape(PARAM_OPENED_CHAR) + PARAM_NAME_REGEXP_SOURCE +
                escape(PARAM_CLOSED_CHAR) + '|' +
                '[^' + escape(PARAM_OPENED_CHAR) + escape(PARAM_CLOSED_CHAR) + ']+' + '|' +
                escape(PARAM_OPENED_CHAR) + '|' +
                escape(PARAM_CLOSED_CHAR) +
                ')',
            'g');

    /**
     * Класс роут
     * @constructor
     * @param {String} method http метод
     * @param {String} name имя роута
     * @param {String} pattern паттерн соответствия
     * @param {Object} [conditions] условия, накладываемые на параметры
     * @param {Object} [defaults] умалчиваемые значения параметров
     */
    function Route(method, name, pattern, conditions, defaults) {
        method = method.toUpperCase();

        if ( ! HTTP_METHODS_REGEXP.test(method)) {
            throw 'Invalid http method "' + method + '"';
        }

        if (typeof name !== 'string') {
            throw 'Argument 2 (name) must be string';
        }

        if (typeof pattern !== 'string') {
            throw 'Argument 3 (pattern) must be string';
        }

        /* Добавим query_string */
        pattern += GROUP_OPENED_CHAR +
            '?' + PARAM_OPENED_CHAR + 'query_string' + PARAM_CLOSED_CHAR +
            GROUP_CLOSED_CHAR;
        conditions || (conditions = {});
        conditions.query_string = '.*';
        /* /Добавим query_string */

        this._method = method;
        this._name = name;
        this._pattern = pattern;
        this._conditions = conditions;
        this._defaults = defaults || null;
        this._data = null;

        this
            .parsePattern()
            .buildParseRegExp()
            .buildBuildFn();
    }

    /**
     * Парсит паттерн, дробит его на составляющие
     * @return {Route}
     */
    Route.prototype.parsePattern = function() {
        /*jshint maxdepth:10*/
        function parseBrackets(pattern) {
            var parts = [],
                part = '',
                character,
                i = 0, j, size,
                countOpened = 0,
                isFindingClosed = false,
                length = pattern.length;

            while (i < length) {
                character = pattern.charAt(i++);

                if (character === GROUP_OPENED_CHAR) {
                    if (isFindingClosed) {
                        ++countOpened;
                        part += character;
                    } else {
                        parseParams(part, parts);
                        part = '';
                        countOpened = 0;
                        isFindingClosed = true;
                    }
                } else if (character === GROUP_CLOSED_CHAR) {
                    if (isFindingClosed) {
                        if (countOpened === 0) {
                            part = {
                                what : 'optional',
                                dependOnParams : [],
                                parts : parseBrackets(part)
                            };

                            parts.push(part);

                            for (j = 0, size = part.parts.length; j < size; ++j) {
                                if (part.parts[j] && part.parts[j].what === 'param') {
                                    part.dependOnParams.push(part.parts[j].name);
                                }
                            }

                            part = '';
                            isFindingClosed = false;
                        } else {
                            --countOpened;
                            part += character;
                        }
                    } else {
                        part += character;
                    }
                } else {
                    part += character;
                }
            }

            parseParams(part, parts);

            return parts;
        }

        function parseParams(pattern, parts) {
            var matches = pattern.match(PARSE_PARAMS_REGEXP),
                i, size,
                part;

            if (matches) {
                for (i = 0, size = matches.length; i < size; ++i) {
                    part = matches[i];

                    if (part.charAt(0) === PARAM_OPENED_CHAR && part.charAt(part.length - 1) === PARAM_CLOSED_CHAR) {
                        parts.push({
                            what : 'param',
                            name : part.substr(1, part.length - 2)
                        });
                    } else {
                        parts.push(part);
                    }
                }
            }
        }

        this._parts = parseBrackets(this._pattern);

        return this;
    };

    /**
     * Строит регэксп для проверки
     * @return {Route}
     */
    Route.prototype.buildParseRegExp = function() {
        var route = this;

        function build(parts) {
            var ret = '',
                i, size,
                part;

            for (i = 0, size = parts.length; i < size; ++i) {
                part = parts[i];

                if (typeof part === 'string') {
                    ret += escape(part);
                } else if (part && part.what === 'param') {
                    route._paramsMap.push(part.name);
                    ret += '(' + buildParamValueRegExpSource(part.name) + ')';
                } else if (part && part.what === 'optional') {
                    ret += '(?:' + build(part.parts) + ')?';
                }
            }

            return ret;
        }

        function buildParamValueRegExpSource(paramName) {
            var ret = '',
                condition = route._conditions && route._conditions[paramName];

            if (condition) {
                if (isArray(condition)) {
                    ret = '(?:' + condition.join('|') + ')';
                } else {
                    ret = condition + '';
                }
            } else {
                ret =  PARAM_VALUE_REGEXP_SOURCE;
            }

            return ret;
        }

        this._paramsMap = [];
        this._parseRegExpSource = '^' + build(this._parts) + '$';
        this._parseRegExp = new RegExp(this._parseRegExpSource);

        return this;
    };

    /**
     * Строит функцию для составления пути
     * @return {Route}
     */
    Route.prototype.buildBuildFn = function() {
        /*jshint evil:true */
        var route = this;

        function build(parts) {
            var ret = '""',
                i, sizeI, j, sizeJ,
                part, name;

            for (i = 0, sizeI = parts.length; i < sizeI; ++i) {
                part = parts[i];

                if (typeof part === 'string') {
                    ret += '+"' + escape(part) + '"' ;
                } else if (part && part.what === 'param') {
                    ret += '+(h.call(p,"' + escape(part.name) + '")?' +
                        'p["' + escape(part.name) + '"]:' +
                        (route._defaults && hasOwnProp.call(route._defaults, part.name) ?
                            '"' + escape(route._defaults[part.name]) +  '"' :
                            '""') +
                        ')';
                } else if (part && part.what === 'optional') {
                    ret += '+((false';

                    for (j = 0, sizeJ = part.dependOnParams.length; j < sizeJ; ++j) {
                        name = part.dependOnParams[j];

                        ret += '||(h.call(p,"' + escape(name) + '")' +
                            (route._defaults && hasOwnProp.call(route._defaults, name) ?
                                '&&p["' + escape(name) + '"]!=="' +
                                    escape(route._defaults[name]) + '"' :
                                '') +
                            ')';
                    }

                    ret += ')?(' + build(part.parts) + '):"")';
                }
            }

            return ret;
        }

        this._buildFnSource = 'var h=({}).hasOwnProperty;return ' + build(this._parts) + ';';
        this._buildFn = new Function('p', this._buildFnSource);

        return this;
    };

    /**
     * Парсит переданный путь, возвращает объект с параметрами либо null
     * @param {String} path
     * @param {String} method
     * @return {Object}
     */
    Route.prototype.parse = function(path, method) {
        var ret = null,
            matches,
            i, size,
            key,
            queryParams;

        method = method.toUpperCase();

        if (this._method === method) {
            matches = path.match(this._parseRegExp);

            if (matches) {
                ret = {};

                for (i = 1, size = matches.length; i < size; ++i) {
                    if (typeof matches[i] !== 'undefined') {
                        ret[this._paramsMap[i - 1]] = matches[i];
                    }
                }

                for (key in this._defaults) {
                    if (hasOwnProp.call(this._defaults, key) && ! hasOwnProp.call(ret, key)) {
                        ret[key] = this._defaults[key];
                    }
                }

                queryParams = querystring.parse(ret.query_string);
                for (key in queryParams) {
                    if (hasOwnProp.call(queryParams, key) && ! hasOwnProp.call(ret, key)) {
                        ret[key] = queryParams[key];
                    }
                }
                delete ret.query_string;
            }
        }

        return ret;
    };

    /**
     * Составляет путь по переданным параметрам
     * @param {Object} params
     * @return {String}
     */
    Route.prototype.build = function(params) {
        var newParams = {},
            queryParams = {},
            queryString,
            key;

        for (key in params) {
            if (hasOwnProp.call(params, key)) {
                if (this._paramsMap.indexOf(key) !== -1) {
                    newParams[key] = params[key];
                } else {
                    queryParams[key] = params[key];
                }
            }
        }

        queryString = querystring.stringify(queryParams);
        queryString && (newParams.query_string = queryString);

        return this._buildFn(newParams);
    };

    /**
     * Связывает данные с роутом
     * геттер и сеттер
     * @param {Object} data
     * @return {Route}
     */
    Route.prototype.bind = function(data) {
        if (typeof data === 'undefined') {
            return this._data;
        }

        this._data = data;

        return this;
    };

    Route.prototype.bundle = function() {
        return [
            this._name,
            this._defaults,
            this._paramsMap,
            this._parseRegExpSource,
            this._buildFnSource,
            this._data && this._data.controller
        ];
    };


    /**
     * @constructor
     */
    function Router() {
        this._routes = [];
        this._routesByName = {};
    }

    /**
     * Добавляет роут
     * @param {String} method http метод
     * @param {String} name имя роута
     * @param {String} pattern паттерн соответствия
     * @param {Object} [conditions] условия, накладываемые на параметры
     * @param {Object} [defaults] умалчиваемые значения параметров
     */
    Router.prototype.addRoute = function(method, name, pattern, conditions, defaults) {      // @todo => opts
        var route;

        route = new Route(method, name, pattern, conditions, defaults);

        this._routes.push(route);
        this._routesByName[name] = route;

        return route;
    };

    /**
     * Находит первый подходящий роут по пути и методу,
     * возвращает массив с привязанными данными и распарсенными параметрами либо null, если ни один из роутов не подошёл
     * @return {Array}
     */
    Router.prototype.find = function() {
        var parsed,
            i, size,
            routes = this._routes;

        for (i = 0, size = routes.length; i < size; ++i) {
            parsed = routes[i].parse.apply(routes[i], arguments);
            if (parsed !== null) {
                return [ routes[i], parsed ];
            }
        }

        return null;
    };

    /**
     * Возвращает роут по имени
     * @param {String} name
     * @return {Route}
     */
    Router.prototype.getRouteByName = function(name) {
        return this._routesByName[name] || null;
    };

    /**
     * Формирует бандл для прокидывания на клиент
     * @return {Array}
     */
    Router.prototype.bundle = function() {
        var ret = null,
            i, size,
            routes = this._routes;

        for (i = 0, size = routes.length; i < size; ++i) {
            ret || (ret = []);
            ret.push(routes[i].bundle());
        }

        return ret;
    };

    if (typeof module !== 'undefined' && typeof module.exports === 'object') {
        module.exports = Router;
    } else {
        global.Router = Router;
    }

})(this);