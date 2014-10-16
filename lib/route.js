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
 * @property {String} pattern Pattern for path match
 * @property {Object} [conditions] Conditions for params in pattern
 * @property {Object} [defaults] Defaults values for params in pattern
 * @property {Object} [data] Data that will be bonded with route
 * @property {Function} [filterMatch] Function that will be applied after match method with its result
 * @property {Function} [filterBuild] Function that will be applied before build method with input params
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

    if ( ! options || typeof options !== 'object') {
        throw new Error('You must specify options');
    }

    if (typeof options.pattern !== 'string') {
        throw new Error('You must specify the pattern of the route');
    }

    /**
     * @type {RouteOptions}
     * @private
     */
    this._options = options;
    this._conditions = options.conditions && typeof options.conditions === 'object' ? options.conditions : {};

    if (options.isTrailingSlashOptional !== false) {
        options.pattern += GROUP_OPENED_CHAR + PARAM_OPENED_CHAR +
            TRAILING_SLASH_PARAM_NAME +
            PARAM_CLOSED_CHAR + GROUP_CLOSED_CHAR;
        this._conditions[TRAILING_SLASH_PARAM_NAME] = TRAILING_SLASH_PARAM_VALUE_ESCAPED;
    }

    options.pattern += GROUP_OPENED_CHAR +
        '?' + PARAM_OPENED_CHAR + QUERY_STRING_PARAM_NAME + PARAM_CLOSED_CHAR +
        GROUP_CLOSED_CHAR;
    this._conditions[QUERY_STRING_PARAM_NAME] = '.*';

    this._paramsMap = [];
    this._mainParamsMap = {};
    this._requiredParams = [];

    /**
     * @type {Array}
     * @private
     */
    this._parts = this._parsePattern(options.pattern);

    this._buildParseRegExp();
    this._buildBuildFn();
}

/**
 * @param {String} pattern
 * @param {Boolean} [isOptional=false]
 * @returns {Array}
 * @private
 */
Route.prototype._parsePattern = function(pattern, isOptional) {
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
                this._parseParams(part, parts, isOptional);
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
                        parts : this._parsePattern(part, true)
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

    this._parseParams(part, parts, isOptional);

    return parts;
};

/**
 * @param {String} pattern
 * @param {Array} parts
 * @param {Boolean} isOptional
 * @private
 */
Route.prototype._parseParams = function(pattern, parts, isOptional) {
    var matches = pattern.match(PARSE_PARAMS_REGEXP),
        i, size,
        part,
        paramName;

    if (matches) {
        for (i = 0, size = matches.length; i < size; ++i) {
            part = matches[i];

            if (part.charAt(0) === PARAM_OPENED_CHAR && part.charAt(part.length - 1) === PARAM_CLOSED_CHAR) {
                paramName = part.substr(1, part.length - 2);
                this._paramsMap.push(paramName);
                this._mainParamsMap[paramName] = true;
                isOptional || this._requiredParams.push(paramName);

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
Route.prototype._buildParseRegExp = function() {
    this._parseRegExpSource = '^' + this._buildParseRegExpParts(this._parts) + '$';
    this._parseRegExp = new RegExp(this._parseRegExpSource);
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
 * @private
 */
Route.prototype._buildBuildFn = function() {
    this._buildFnSource = 'var h=({}).hasOwnProperty;return ' + this._buildBuildFnParts(this._parts) + ';';
    /*jshint evil:true */
    this._buildFn = new Function('p', this._buildFnSource);
};

/**
 * @param {Array} parts
 * @returns {String}
 * @private
 */
Route.prototype._buildBuildFnParts = function(parts) {
    var ret = '""',
        i, sizeI, j, sizeJ,
        part, name,
        defaults = this._options.defaults;

    for (i = 0, sizeI = parts.length; i < sizeI; ++i) {
        part = parts[i];

        if (typeof part === 'string') {
            ret += '+"' + escape(part) + '"' ;
        } else if (part.what === 'param') {
            this._mainParamsMap[part.name] = true;
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

            ret += ')?(' + this._buildBuildFnParts(part.parts) + '):"")';
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
 * Matches path with route
 * @param {String} path
 * @param {Function|Object} [data]
 * @returns {Object|null}
 */
Route.prototype.match = function(path, data) {
    var ret = null,
        matches,
        i, size,
        paramName,
        paramValue,
        queryParams,
        queryString,
        options = this._options,
        filter = options.postMatch,
        defaults = options.defaults;

    if (typeof path !== 'string' || (data && ! this._isDataMatched(data))) {
        return ret;
    }

    matches = path.match(this._parseRegExp);

    if (matches) {
        ret = {};

        for (i = 1, size = matches.length; i < size; ++i) {
            if (typeof matches[i] !== 'undefined' && /* for IE lt 9*/ matches[i] !== '') {
                paramName = this._paramsMap[i - 1];
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
                    if (this._mainParamsMap[paramName] && isArray(paramValue)) {
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
                (this._mainParamsMap[paramName] || useQueryString)
        ) {
            paramValue = params[paramName];
            if (isStrict && ! this._checkParamValue(paramName, paramValue)) {
                return null;
            }

            (this._mainParamsMap[paramName] ? newParams : queryParams)[paramName] = paramValue;
        }
    }

    if (isStrict) {
        for (i = 0, size = this._requiredParams.length; i < size; ++i) {
            if ( ! has(newParams, this._requiredParams[i])) {
                return null;
            }
        }
    }

    if (useQueryString) {
        queryString = querystring.stringify(queryParams);
        queryString && (newParams[QUERY_STRING_PARAM_NAME] = queryString);
    }

    return this._buildFn(newParams);
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
