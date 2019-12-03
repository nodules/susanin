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
 * @const
 * @type {number}
 */
var OPTIONAL_PARAM_WEIGHT = 1;

/**
 * @const
 * @type {number}
 */
var REQUIRED_PARAM_WEIGHT = 2;

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

    if (options.isTrailingSlashOptional !== false) {
        this._conditions[TRAILING_SLASH_PARAM_NAME] = TRAILING_SLASH_PARAM_VALUE_ESCAPED;
    }

    this._conditions[QUERY_STRING_PARAM_NAME] = '.*';

    this._subPatterns = [];

    for (var i = 0, l = options.patterns.length; i < l; i++) {
        var pattern = options.patterns[i];
        var subPattern = {};

        if (typeof pattern !== 'string') {
            throw new Error('You must specify the pattern of the route');
        } else {
            if (options.isTrailingSlashOptional !== false) {
                pattern += GROUP_OPENED_CHAR + PARAM_OPENED_CHAR +
                    TRAILING_SLASH_PARAM_NAME +
                    PARAM_CLOSED_CHAR + GROUP_CLOSED_CHAR;
            }

            pattern += GROUP_OPENED_CHAR +
                '?' + PARAM_OPENED_CHAR + QUERY_STRING_PARAM_NAME + PARAM_CLOSED_CHAR +
                GROUP_CLOSED_CHAR;

            subPattern._pattern = pattern;
            subPattern._paramsMap = [];
            subPattern._mainParamsMap = {};
            subPattern._requiredParams = [];
            subPattern._optionalParams = [];

            /**
             * @type {Array}
             * @private
             */
            subPattern._parts = this._parsePattern(subPattern, pattern);

            this._buildParseRegExp(subPattern);
            this._buildBuildFn(subPattern);

            this._subPatterns.push(subPattern);
        }
    }
}

/**
 * @param {Object} subPattern
 * @param {String} pattern
 * @param {Boolean} [isOptional=false]
 * @returns {Array}
 * @private
 */
Route.prototype._parsePattern = function(subPattern, pattern, isOptional) {
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
                this._parseParams(subPattern, part, parts, isOptional);
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
                        parts : this._parsePattern(subPattern, part, true)
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

    this._parseParams(subPattern, part, parts, isOptional);

    return parts;
};

/**
 * @param {Object} subPattern
 * @param {String} pattern
 * @param {Array} parts
 * @param {Boolean} isOptional
 * @private
 */
Route.prototype._parseParams = function(subPattern, pattern, parts, isOptional) {
    var matches = pattern.match(PARSE_PARAMS_REGEXP),
        i, size,
        part,
        paramName;

    if (matches) {
        for (i = 0, size = matches.length; i < size; ++i) {
            part = matches[i];

            if (part.charAt(0) === PARAM_OPENED_CHAR && part.charAt(part.length - 1) === PARAM_CLOSED_CHAR) {
                paramName = part.substr(1, part.length - 2);
                subPattern._paramsMap.push(paramName);
                subPattern._mainParamsMap[paramName] = true;

                if (isOptional) {
                    subPattern._optionalParams.push(paramName);
                } else {
                    subPattern._requiredParams.push(paramName);
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
Route.prototype._buildParseRegExp = function(subPattern) {
    subPattern._parseRegExpSource = '^' + this._buildParseRegExpParts(subPattern._parts) + '$';
    subPattern._parseRegExp = new RegExp(subPattern._parseRegExpSource);
};

/**
 * @param {Array} parts
 * @returns {String}
 * @private
 */
Route.prototype._buildParseRegExpParts = function(parts) {
    var ret = '',
        i, size,
        part;

    for (i = 0, size = parts.length; i < size; ++i) {
        part = parts[i];

        if (typeof part === 'string') {
            ret += escape(part);
        } else if (part.what === 'param') {
            ret += '(' + (this._getParamValueRegExpSource(part.name) || PARAM_VALUE_REGEXP_SOURCE) + ')';
        } else {
            ret += '(?:' + this._buildParseRegExpParts(part.parts) + ')?';
        }
    }

    return ret;
};

/**
 * @param {String} paramName
 * @returns {?String}
 * @private
 */
Route.prototype._getParamValueRegExpSource = function(paramName) {
    var regExpSource,
        regExpSources = this._conditionRegExpSources || (this._conditionRegExpSources = {}),
        conditions = this._conditions,
        condition;

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
 * @param {String} paramName
 * @returns {?RegExp}
 * @private
 */
Route.prototype._getParamValueRegExp = function(paramName) {
    var regExpSource,
        regExps = this._conditionRegExps || (this._conditionRegExps = {});

    if ( ! has(regExps, paramName)) {
        regExpSource = this._getParamValueRegExpSource(paramName);
        regExps[paramName] = regExpSource ? new RegExp('^' + regExpSource + '$') : null;
    }

    return regExps[paramName];
};

/**
 * @param {String} paramName
 * @param {String} paramValue
 * @private {Boolean}
 */
Route.prototype._checkParamValue = function(paramName, paramValue) {
    var regExp = this._getParamValueRegExp(paramName);

    return regExp ? regExp.test(paramValue) : true;
};

/**
 * @param {Object} subPattern
 * @private
 */
Route.prototype._buildBuildFn = function(subPattern) {
    subPattern._buildFnSource = 'var h=({}).hasOwnProperty;return ' + this._buildBuildFnParts(subPattern) + ';';
    /*jshint evil:true */
    subPattern._buildFn = new Function('p', subPattern._buildFnSource);
};

/**
 * @param {Object} subPattern
 * @param {?Object} parts
 * @returns {String}
 * @private
 */
Route.prototype._buildBuildFnParts = function(subPattern, parts) {
    var ret = '""',
        i, sizeI, j, sizeJ,
        part, name,
        defaults = this._options.defaults;

    if (! parts) {
        parts = subPattern._parts;
    }

    for (i = 0, sizeI = parts.length; i < sizeI; ++i) {
        part = parts[i];

        if (typeof part === 'string') {
            ret += '+"' + escape(part) + '"' ;
        } else if (part.what === 'param') {
            subPattern._mainParamsMap[part.name] = true;
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

            ret += ')?(' + this._buildBuildFnParts(subPattern, part.parts) + '):"")';
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
 * @return {Array}
 * @private
 */
Route.prototype._getPatternParamsIntersection = function(patternParams, params) {
    var intersection = [],
        paramIndex,
        size,
        paramName;

    for (paramIndex = 0, size = patternParams.length; paramIndex < size; paramIndex++) {
        paramName = patternParams[paramIndex];

        if (has(params, paramName)) {
            intersection.push(paramName);
        }
    }

    return intersection;
};

/**
 * @param {Object} subPattern
 * @param {Object} params
 * @param {?Boolean} [isStrict=false]
 * @return {number}
 * @private
 */
Route.prototype._getParamsWeight = function(subPattern, params, isStrict) {
    var mainParams = subPattern._paramsMap;
    var requiredParams = subPattern._requiredParams;
    var optionalParams = subPattern._optionalParams;
    var weight = 0;
    var paramsIntersection;

    if (isStrict) {
        paramsIntersection = this._getPatternParamsIntersection(requiredParams, params);

        if (requiredParams.length !== paramsIntersection.length) {
            return weight;
        }

        paramsIntersection = this._getPatternParamsIntersection(optionalParams, params);
        weight = paramsIntersection.length * OPTIONAL_PARAM_WEIGHT +
            requiredParams.length * REQUIRED_PARAM_WEIGHT;
    } else {
        paramsIntersection = this._getPatternParamsIntersection(mainParams, params);

        weight = paramsIntersection.length * REQUIRED_PARAM_WEIGHT;
    }

    if ( ! weight) {
        weight = 1;
    }

    return weight;
};

/**
 * Matches path with route
 * @param {String} path
 * @param {Function|Object} [data]
 * @returns {Object|null}
 */
Route.prototype.match = function(path, data) {
    var bestParams = null;

    if (typeof path !== 'string' || (data && ! this._isDataMatched(data))) {
        return bestParams;
    }

    var subPatterns = this._subPatterns;
    var bestsubPattern;
    var bestParamsWeight = 0;

    for (var i = 0, l = subPatterns.length; i < l; i++) {
        var subPattern = subPatterns[i];

        var resultParams = this._matchsubPattern(subPattern, path);

        if (resultParams) {
            var paramsWeight = this._getParamsWeight(subPattern, resultParams);

            if (paramsWeight >= bestParamsWeight) {
                bestParamsWeight = paramsWeight;
                bestsubPattern = subPattern;
                bestParams = resultParams;
            }
        }
    }

    return bestParams;
};

/**
 * @param {Object} subPattern
 * @param {String} path
 * @return {null|Object}
 * @private
 */
Route.prototype._matchsubPattern = function(subPattern, path) {
    var matches,
        ret = null,
        i, size,
        paramName,
        paramValue,
        queryParams,
        queryString,
        options = this._options,
        filter = options.postMatch,
        defaults = options.defaults;

    matches = path.match(subPattern._parseRegExp);

    if (matches) {
        ret = {};

        for (i = 1, size = matches.length; i < size; ++i) {
            if (typeof matches[i] !== 'undefined' && /* for IE lt 9*/ matches[i] !== '') {
                paramName = subPattern._paramsMap[i - 1];
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
                    if (subPattern._mainParamsMap[paramName] && isArray(paramValue)) {
                        paramValue = paramValue[0];
                    }

                    if (isArray(paramValue)) {
                        ret[paramName] = [];

                        for (i = 0, size = paramValue.length; i < size; ++i) {
                            if (this._checkParamValue(paramName, paramValue[i])) {
                                ret[paramName].push(paramValue[i]);
                            }
                        }
                    } else if (this._checkParamValue(paramName, paramValue)) {
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
    var subPatterns = this._subPatterns;
    var bestParams;
    var bestsubPattern;
    var bestParamsWeight = 0;

    params || (params = {});

    if (subPatterns.length > 1) {
        for (var i = 0, l = subPatterns.length; i < l; i++) {
            var subPattern = subPatterns[i];

            var resultParams = this._buildsubPatternParams(subPattern, params, isStrict);

            if (resultParams) {
                var paramsWeight = this._getParamsWeight(subPattern, params, isStrict);

                if (paramsWeight > bestParamsWeight) {
                    bestParamsWeight = paramsWeight;
                    bestsubPattern = subPattern;
                    bestParams = resultParams;
                }
            }
        }
    } else {
        bestsubPattern = subPatterns[0];
        bestParams = this._buildsubPatternParams(bestsubPattern, params, isStrict);
    }

    if (bestParams) {
        return this._buildsubPattern(bestsubPattern, bestParams);
    }

    return null;
};

/**
 * @param {Object} subPattern
 * @param {Object} params
 * @return {String}
 * @private
 */
Route.prototype._buildsubPattern = function(subPattern, params) {
    return subPattern._buildFn(params);
};

/**
 * @param {Object} subPattern
 * @param {Object} params
 * @param {?Boolean} [isStrict=false]
 * @return {null|Object}
 * @private
 */
Route.prototype._buildsubPatternParams = function(subPattern, params, isStrict) {
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
                (subPattern._mainParamsMap[paramName] || useQueryString)
        ) {
            paramValue = params[paramName];
            if (isStrict && ! this._checkParamValue(paramName, paramValue)) {
                return null;
            }

            (subPattern._mainParamsMap[paramName] ? newParams : queryParams)[paramName] = paramValue;
        }
    }

    if (isStrict) {
        for (i = 0, size = subPattern._requiredParams.length; i < size; ++i) {
            if ( ! has(newParams, subPattern._requiredParams[i])) {
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
