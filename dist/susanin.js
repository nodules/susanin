(function(global) {
    function require(key) {
        return ({
            './querystring' : function() {
                var module = {};

                /* ../lib/querystring.js begin */
var hasOwnProp = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    isArray = function(subject) {
        return toString.call(subject) === '[object Array]';
    };

var querystring = {

    /**
     * @param {String} str
     * @returns {String}
     */
    decode : function(str) {
        var ret;

        try {
            ret = decodeURIComponent(str.replace(/\+/g, '%20'));
        } catch (e) {
            ret = str;
        }

        return ret;
    },

    /**
     * Parse a string "param1=value1&param2=value2&param2&param3=value3"
     * and return object:
     * {
     *     param1 : value1,
     *     parma2 : [ value2, '' ],
     *     param3 : value3
     * }
     * @link http://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq
     * @param {String} query
     * @param {String} [sep='&']
     * @param {String} [eq='=']
     * @returns {Object}
     */
    parse : function(query, sep, eq) {
        var params = {},
            queryParams,
            value, key,
            i, size,
            pair, idx;

        if (typeof query !== 'string' || query === '') {
            return params;
        }

        sep || (sep = '&');
        eq || (eq = '=');

        queryParams = query.split(sep);

        for (i = 0, size = queryParams.length; i < size; ++i) {
            pair = querystring.decode(queryParams[i]);
            idx = pair.indexOf(eq);

            if (idx >= 0) {
                key = pair.substr(0, idx);
                value = pair.substr(idx + 1);
            } else {
                key = pair;
                value = '';
            }

            if (hasOwnProp.call(params, key)) {
                if ( ! isArray(params[key])) {
                    params[key] = [ params[key], value ];
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
     * Build querystring from object
     * @link http://nodejs.org/api/querystring.html#querystring_querystring_stringify_obj_sep_eq
     * @param {Object} params
     * @param {String} [sep='&']
     * @param {String} [eq='=']
     * @returns {String}
     */
    stringify : function(params, sep, eq) {
        var query = '',
            value,
            typeOf,
            tmpArray,
            i, size, key;

        if ( ! params) {
            return query;
        }

        sep || (sep = '&');
        eq || (eq = '=');

        for (key in params) {
            if (hasOwnProp.call(params, key)) {
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

module.exports = querystring;

/* ../lib/querystring.js end */


                return module.exports;
            },
            './route' : function() {
                var module = {};

                /* ../lib/route.js begin */
var hasOwnProp = Object.prototype.hasOwnProperty,

    /**
     * @param {Object} ctx
     * @param {String} name
     * @returns {Boolean}
     */
    has = function(ctx, name) {
        return hasOwnProp.call(ctx, name);
    },

    toString = Object.prototype.toString,

    /**
     * @param {*} subject
     * @returns {Boolean}
     */
    isArray = function(subject) {
        return toString.call(subject) === '[object Array]';
    };

var querystring = require('./querystring');

/**
 * @type {Function}
 */
var escape = (function() {
    var SPECIAL_CHARS = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ],
        SPECIAL_CHARS_REGEXP = new RegExp('(\\' + SPECIAL_CHARS.join('|\\') + ')', 'g');

    return function(text) {
        return text.replace(SPECIAL_CHARS_REGEXP, '\\$1');
    };
})();

/**
 * @const
 * @type {String}
 */
var EXPANDO = String(Math.random()).substr(2, 5);

/**
 * @const
 * @type {String}
 */
var PARAM_OPENED_CHAR = '<';

/**
 * @const
 * @type {String}
 */
var PARAM_CLOSED_CHAR = '>';

/**
 * @const
 * @type {String}
 */
var GROUP_OPENED_CHAR = '(';

/**
 * @const
 * @type {String}
 */
var GROUP_CLOSED_CHAR = ')';

/**
 * @const
 * @type {String}
 */
var PARAM_NAME_REGEXP_SOURCE = '[a-zA-Z_][\\w\\-]*';

/**
 * @const
 * @type {String}
 */
var PARAM_VALUE_REGEXP_SOURCE = '[\\w\\-\\.~]+';

/**
 * @const
 * @type {RegExp}
 */
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
 * @const
 * @type {String}
 */
var TRAILING_SLASH_PARAM_NAME = 'ts_' + EXPANDO;

/**
 * @const
 * @type {String}
 */
var TRAILING_SLASH_PARAM_VALUE = '/';

/**
 * @const
 * @type {String}
 */
var TRAILING_SLASH_PARAM_VALUE_ESCAPED = escape('/');

/**
 * @const
 * @type {String}
 */
var QUERY_STRING_PARAM_NAME = 'qs_' + EXPANDO;

/**
 * @typedef {Object|String} RouteOptions If it's a string it means pattern for path match
 * @property {String} [name] Name of the route
 * @property {String} [pattern] Pattern for path match
 * @property {String[]} [patterns] Patterns for path match
 * @property {Object} [conditions] Conditions for params in pattern
 * @property {Object} [defaults] Defaults values for params in pattern
 * @property {Object} [data] Data that will be bonded with route
 * @property {Function} [postMatch] Function that will be applied after match method with its result
 * @property {Function} [preBuild] Function that will be applied before build method with input params
 * @property {Boolean} [isTrailingSlashOptional=true] If `true` trailing slash is optional
 * @property {Boolean} [useQueryString=true] If `true` query string will be parsed and returned
 */

/**
 * Creates new route
 * @constructor
 * @param {RouteOptions} options
 */
function Route(options) {
    if ( ! (this instanceof Route)) {
        return new Route(options);
    }

    typeof options === 'string' && (options = { pattern : options });
    isArray(options) && (options = { patterns : options });

    if (! isArray(options.patterns)) {
        options.patterns = [];
    }

    if (options.pattern) {
        options.patterns.push(options.pattern);
        delete options.pattern;
    }

    if ( ! options || typeof options !== 'object') {
        throw new Error('You must specify options');
    }

    /**
     * @type {RouteOptions}
     * @private
     */
    this._options = options;
    this._conditions = options.conditions && typeof options.conditions === 'object' ? options.conditions : {};

    this._conditions = this._setConditions(this._conditions);

    this._subRoutes = [];

    for (var i = 0, l = options.patterns.length; i < l; i++) {
        var subRouteOptions = options.patterns[i];
        var subRoute = {};
        var testString = typeof subRouteOptions === 'object' ? subRouteOptions.pattern : subRouteOptions;

        if (typeof testString !== 'string') {
            throw new Error('You must specify the pattern of the route');
        } else {
            if (options.isTrailingSlashOptional !== false) {
                testString += GROUP_OPENED_CHAR + PARAM_OPENED_CHAR +
                    TRAILING_SLASH_PARAM_NAME +
                    PARAM_CLOSED_CHAR + GROUP_CLOSED_CHAR;
            }

            testString += GROUP_OPENED_CHAR +
                '?' + PARAM_OPENED_CHAR + QUERY_STRING_PARAM_NAME + PARAM_CLOSED_CHAR +
                GROUP_CLOSED_CHAR;

            subRoute.pattern = testString;
            subRoute.paramsMap = [];
            subRoute.mainParamsMap = {};
            subRoute.requiredParams = [];
            subRoute.optionalParams = [];

            if (subRouteOptions.conditions) {
                subRoute.conditions = this._setConditions(subRouteOptions.conditions);
            }

            if (subRouteOptions.defaults) {
                subRoute.defaults = subRouteOptions.defaults;
            }

            /**
             * @type {Array}
             * @private
             */
            subRoute.parts = this._parsePattern(subRoute, testString);

            this._buildParseRegExp(subRoute);
            this._buildBuildFn(subRoute);

            this._subRoutes.push(subRoute);
        }
    }
}

Route.prototype._getDefaults = function(subRoute) {
    return subRoute.defaults || this._options.defaults;
};

Route.prototype._setConditions = function(conditions) {
    if (this._options.isTrailingSlashOptional !== false) {
        conditions[TRAILING_SLASH_PARAM_NAME] = TRAILING_SLASH_PARAM_VALUE_ESCAPED;
    }

    conditions[QUERY_STRING_PARAM_NAME] = '.*';

    return conditions;
};

/**
 * @param {Object} subRoute
 * @param {String} pattern
 * @param {Boolean} [isOptional=false]
 * @returns {Array}
 * @private
 */
Route.prototype._parsePattern = function(subRoute, pattern, isOptional) {
    var parts = [],
        part = '',
        character,
        i = 0, j, size,
        countOpened = 0,
        isFindingClosed = false,
        length = pattern.length,
        what;

    while (i < length) {
        character = pattern.charAt(i++);

        if (character === GROUP_OPENED_CHAR) {
            if (isFindingClosed) {
                ++countOpened;
                part += character;
            } else {
                this._parseParams(subRoute, part, parts, isOptional);
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
                        parts : this._parsePattern(subRoute, part, true)
                    };

                    parts.push(part);

                    for (j = 0, size = part.parts.length; j < size; ++j) {
                        what = part.parts[j] && part.parts[j].what;

                        if (what === 'param') {
                            part.dependOnParams.push(part.parts[j].name);
                        } else if (what === 'optional') {
                            part.dependOnParams.push.apply(part.dependOnParams, part.parts[j].dependOnParams);
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

    this._parseParams(subRoute, part, parts, isOptional);

    return parts;
};

/**
 * @param {Object} subRoute
 * @param {String} pattern
 * @param {Array} parts
 * @param {Boolean} isOptional
 * @private
 */
Route.prototype._parseParams = function(subRoute, pattern, parts, isOptional) {
    var matches = pattern.match(PARSE_PARAMS_REGEXP),
        i, size,
        part,
        paramName;

    if (matches) {
        for (i = 0, size = matches.length; i < size; ++i) {
            part = matches[i];

            if (part.charAt(0) === PARAM_OPENED_CHAR && part.charAt(part.length - 1) === PARAM_CLOSED_CHAR) {
                paramName = part.substr(1, part.length - 2);
                subRoute.paramsMap.push(paramName);
                subRoute.mainParamsMap[paramName] = true;

                if (isOptional) {
                    subRoute.optionalParams.push(paramName);
                } else {
                    subRoute.requiredParams.push(paramName);
                }

                parts.push({
                    what : 'param',
                    name : paramName
                });
            } else {
                parts.push(part);
            }
        }
    }
};

/**
 * @private
 */
Route.prototype._buildParseRegExp = function(subRoute) {
    subRoute.parseRegExpSource = '^' + this._buildParseRegExpParts(subRoute, subRoute.parts) + '$';
    subRoute.parseRegExp = new RegExp(subRoute.parseRegExpSource);
};

/**
 * @param {Object} subRoute
 * @param {Array} parts
 * @returns {String}
 * @private
 */
Route.prototype._buildParseRegExpParts = function(subRoute, parts) {
    var ret = '',
        i, size,
        part;

    for (i = 0, size = parts.length; i < size; ++i) {
        part = parts[i];

        if (typeof part === 'string') {
            ret += escape(part);
        } else if (part.what === 'param') {
            ret += '(' + (this._getParamValueRegExpSource(subRoute, part.name) || PARAM_VALUE_REGEXP_SOURCE) + ')';
        } else {
            ret += '(?:' + this._buildParseRegExpParts(subRoute, part.parts) + ')?';
        }
    }

    return ret;
};

/**
 * @param {Object} subRoute
 * @param {String} paramName
 * @returns {?String}
 * @private
 */
Route.prototype._getParamValueRegExpSource = function(subRoute, paramName) {
    var regExpSource,
        regExpSources,
        conditions = subRoute.conditions || this._conditions,
        condition;

    if (subRoute.conditions) {
        regExpSources = subRoute.conditionRegExpSources || (subRoute.conditionRegExpSources = {});
    } else {
        regExpSources = this._conditionRegExpSources || (this._conditionRegExpSources = {});
    }

    if ( ! has(regExpSources, paramName)) {
        if (has(conditions, paramName)) {
            condition = conditions[paramName];
            if (isArray(condition)) {
                regExpSource = '(?:' + condition.join('|') + ')';
            } else {
                regExpSource = condition + '';
            }
        } else {
            regExpSource = null;
        }
        regExpSources[paramName] = regExpSource;
    }

    return regExpSources[paramName];
};

/**
 * @param {Object} subRoute
 * @param {String} paramName
 * @returns {?RegExp}
 * @private
 */
Route.prototype._getParamValueRegExp = function(subRoute, paramName) {
    var regExpSource,
        regExps;

    if (subRoute.conditions) {
        regExps = subRoute.conditionRegExps || (subRoute.conditionRegExps = {});
    } else {
        regExps = this._conditionRegExps || (this._conditionRegExps = {});
    }

    if ( ! has(regExps, paramName)) {
        regExpSource = this._getParamValueRegExpSource(subRoute, paramName);
        regExps[paramName] = regExpSource ? new RegExp('^' + regExpSource + '$') : null;
    }

    return regExps[paramName];
};

/**
 * @param {Object} subRoute
 * @param {String} paramName
 * @param {String} paramValue
 * @private {Boolean}
 */
Route.prototype._checkParamValue = function(subRoute, paramName, paramValue) {
    var regExp = this._getParamValueRegExp(subRoute, paramName);

    return regExp ? regExp.test(paramValue) : true;
};

/**
 * @param {Object} subRoute
 * @private
 */
Route.prototype._buildBuildFn = function(subRoute) {
    subRoute._buildFnSource = 'var h=({}).hasOwnProperty;return ' + this._buildBuildFnParts(subRoute) + ';';
    /*jshint evil:true */
    subRoute._buildFn = new Function('p', subRoute._buildFnSource);
};

/**
 * @param {Object} subRoute
 * @param {?Object} parts
 * @returns {String}
 * @private
 */
Route.prototype._buildBuildFnParts = function(subRoute, parts) {
    var ret = '""',
        i, sizeI, j, sizeJ,
        part, name,
        defaults = this._getDefaults(subRoute);

    if (! parts) {
        parts = subRoute.parts;
    }

    for (i = 0, sizeI = parts.length; i < sizeI; ++i) {
        part = parts[i];

        if (typeof part === 'string') {
            ret += '+"' + escape(part) + '"' ;
        } else if (part.what === 'param') {
            subRoute.mainParamsMap[part.name] = true;
            ret += '+(h.call(p,"' + escape(part.name) + '")?' +
                'p["' + escape(part.name) + '"]:' +
                (defaults && has(defaults, part.name) ?
                 '"' + escape(defaults[part.name]) +  '"' :
                 '""') +
                ')';
        } else {
            ret += '+((false';

            for (j = 0, sizeJ = part.dependOnParams.length; j < sizeJ; ++j) {
                name = part.dependOnParams[j];

                ret += '||(h.call(p,"' + escape(name) + '")' +
                    (defaults && has(defaults, name) ?
                     '&&p["' + escape(name) + '"]!=="' +
                         escape(defaults[name]) + '"' :
                     '') +
                    ')';
            }

            ret += ')?(' + this._buildBuildFnParts(subRoute, part.parts) + '):"")';
        }
    }

    return ret;
};

/**
 * @param {Object|Function} data
 * @returns {Boolean}
 * @private
 */
Route.prototype._isDataMatched = function(data) {
    var routeData = this._options.data,
        key;

    if (typeof data === 'function') {
        return Boolean(data(routeData));
    } else if (data && typeof data === 'object') {
        for (key in data) {
            if (has(data, key)) {
                if ( ! routeData || typeof routeData !== 'object' || routeData[key] !== data[key]) {
                    return false;
                }
            }
        }
    }

    return true;
};

/**
 * @param {Array} patternParams
 * @param {Object} params
 * @param {Object} [defaultParams]
 * @return {Array}
 * @private
 */
Route.prototype._getPatternParamsIntersection = function(patternParams, params, defaultParams) {
    var intersection = [],
        paramIndex,
        size,
        paramName;

    defaultParams || (defaultParams = {});

    for (paramIndex = 0, size = patternParams.length; paramIndex < size; paramIndex++) {
        paramName = patternParams[paramIndex];

        if (has(params, paramName) || has(defaultParams, paramName)) {
            intersection.push(paramName);
        }
    }

    return intersection;
};

/**
 * Matches path with route
 * @param {String} path
 * @param {Function|Object} [data]
 * @returns {Object|null}
 */
Route.prototype.match = function(path, data) {
    var selectedParams = null;

    if (typeof path !== 'string' || (data && ! this._isDataMatched(data))) {
        return null;
    }

    var subPatterns = this._subRoutes;

    for (var i = 0, l = subPatterns.length; i < l; i++) {
        var subRoute = subPatterns[i];

        var resultParams = this._matchSubPattern(subRoute, path);

        if (resultParams) {
            selectedParams = resultParams;
            break;
        }
    }

    return selectedParams;
};

/**
 * @param {Object} subRoute
 * @param {String} path
 * @return {null|Object}
 * @private
 */
Route.prototype._matchSubPattern = function(subRoute, path) {
    var matches,
        ret = null,
        i, size,
        paramName,
        paramValue,
        queryParams,
        queryString,
        options = this._options,
        filter = options.postMatch,
        defaults = subRoute.defaults || options.defaults;

    matches = path.match(subRoute.parseRegExp);

    if (matches) {
        ret = {};

        for (i = 1, size = matches.length; i < size; ++i) {
            if (typeof matches[i] !== 'undefined' && /* for IE lt 9*/ matches[i] !== '') {
                paramName = subRoute.paramsMap[i - 1];
                if (paramName === QUERY_STRING_PARAM_NAME) {
                    queryString = matches[i];
                } else if (paramName === TRAILING_SLASH_PARAM_NAME) {
                    if (path.charAt(path.length - 2) === TRAILING_SLASH_PARAM_VALUE) {
                        return null;
                    }
                } else  {
                    ret[paramName] = matches[i];
                }
            }
        }

        if (queryString && options.useQueryString !== false) {
            queryParams = querystring.parse(queryString);
            for (paramName in queryParams) {
                if (has(queryParams, paramName) && ! has(ret, paramName)) {
                    paramValue = queryParams[paramName];
                    if (subRoute.mainParamsMap[paramName] && isArray(paramValue)) {
                        paramValue = paramValue[0];
                    }

                    if (isArray(paramValue)) {
                        ret[paramName] = [];

                        for (i = 0, size = paramValue.length; i < size; ++i) {
                            if (this._checkParamValue(subRoute, paramName, paramValue[i])) {
                                ret[paramName].push(paramValue[i]);
                            }
                        }
                    } else if (this._checkParamValue(subRoute, paramName, paramValue)) {
                        ret[paramName] = paramValue;
                    }
                }
            }
        }

        for (paramName in defaults) {
            if (has(defaults, paramName) && ! has(ret, paramName)) {
                ret[paramName] = defaults[paramName];
            }
        }
    }

    if (ret && typeof filter === 'function') {
        ret = filter(ret);
        if ( ! (ret && typeof ret === 'object')) {
            ret = null;
        }
    }

    return ret;
};

/**
 * Build path from params
 * @param {Object} params
 * @param {Boolean} [isStrict=false]
 * @returns {?String}
 */
Route.prototype.build = function(params, isStrict) {
    var subRoutes = this._subRoutes;
    var selectedParams;
    var selectedSubRoute;
    var subRoutesLength = subRoutes.length;

    params || (params = {});

    if (subRoutesLength > 1) {
        for (var i = 0; i < subRoutesLength; i++) {
            var isLastSubRoute = i + 1 === subRoutesLength;
            var subRoute = subRoutes[i];
            var requiredParams = subRoute.requiredParams;
            var defaultParams = this._getDefaults(subRoute);
            var requiredParamsIntersection = this._getPatternParamsIntersection(requiredParams, params, defaultParams);

            var resultParams = this._buildSubPatternParams(subRoute, params, isStrict);

            if (
                requiredParamsIntersection.length === requiredParams.length && resultParams ||
                ! isStrict && isLastSubRoute
            ) {
                if (isStrict || resultParams || ! isStrict && isLastSubRoute) {
                    selectedSubRoute = subRoute;
                    selectedParams = resultParams;

                    break;
                }
            }
        }

    } else {
        selectedSubRoute = subRoutes[0];
        selectedParams = this._buildSubPatternParams(selectedSubRoute, params, isStrict);
    }

    if (selectedParams) {
        return this._buildSubPattern(selectedSubRoute, selectedParams);
    }

    return null;
};

/**
 * @param {Object} subRoute
 * @param {Object} params
 * @return {String}
 * @private
 */
Route.prototype._buildSubPattern = function(subRoute, params) {
    return subRoute._buildFn(params);
};

/**
 * @param {Object} subRoute
 * @param {Object} params
 * @param {?Boolean} [isStrict=false]
 * @return {null|Object}
 * @private
 */
Route.prototype._buildSubPatternParams = function(subRoute, params, isStrict) {
    var options = this._options,
        newParams = {},
        useQueryString = options.useQueryString !== false,
        queryParams = {},
        queryString,
        paramName,
        paramValue,
        filter = options.preBuild,
        i, size;

    if (typeof filter === 'function') {
        params = filter(params);
    }

    for (paramName in params) {
        if (
            has(params, paramName) &&
                params[paramName] !== null &&
                typeof params[paramName] !== 'undefined' &&
                (subRoute.mainParamsMap[paramName] || useQueryString)
        ) {
            paramValue = params[paramName];
            if (isStrict && ! this._checkParamValue(subRoute, paramName, paramValue)) {
                return null;
            }

            (subRoute.mainParamsMap[paramName] ? newParams : queryParams)[paramName] = paramValue;
        }
    }

    if (isStrict) {
        for (i = 0, size = subRoute.requiredParams.length; i < size; ++i) {
            if ( ! has(newParams, subRoute.requiredParams[i])) {
                return null;
            }
        }
    }

    if (useQueryString) {
        queryString = querystring.stringify(queryParams);
        queryString && (newParams[QUERY_STRING_PARAM_NAME] = queryString);
    }

    return newParams;
};

/**
 * Returns binded with route data
 * @returns {*}
 */
Route.prototype.getData = function() {
    return this._options.data;
};

/**
 * Returns name of the route
 * @returns {*}
 */
Route.prototype.getName = function() {
    return this._options.name;
};

module.exports = Route;

/* ../lib/route.js end */


                return module.exports;
            },
            './router' : function() {
                var module = {};

                /* ../lib/router.js begin */
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

/* ../lib/router.js end */


                return module.exports;
            }
        })[key]();
    }

    var Router = require('./router'),
        defineAsGlobal = true;

    // CommonJS
    if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        module.exports = Router;
        defineAsGlobal = false;
    }

    // YModules support
    if (global.modules && modules.define && modules.require) {
        modules.define('susanin', function(provide) {
            provide(Router);
        });
        defineAsGlobal = false;
    }

    // AMD support
    if (typeof global.define === 'function' && define.amd) {
        define(function() {
            return Router;
        });
        defineAsGlobal = false;
    }

    defineAsGlobal && (global.Susanin = Router);

})(this);
