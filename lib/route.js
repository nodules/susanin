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

var OPTIONAL_PARAM_WEIGHT = 1;
var REQUIRED_PARAM_WEIGHT = 2;
var MINIMAL_PATTERN_WEIGHT = 1;

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
var DEFAULT_PATTERN_NAME = 'pattern_' + EXPANDO;

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

    this._setOptions(options);
}

Route.prototype._setOptions = function(opts) {
    var options = opts;

    if (typeof options === 'string') {
        options = { pattern : options };
    }

    if (! options || typeof options !== 'object') {
        throw new Error('You must specify options');
    }

    this._options = options;
    this._setConditions(this._options.conditions);
    this._setPatterns(this._options.pattern);
};

Route.prototype._setConditions = function(conditions) {
    var opts = this._options;

    this._conditions = conditions && typeof conditions === 'object' ? conditions : {};

    if (opts.isTrailingSlashOptional !== false) {
        this._conditions[TRAILING_SLASH_PARAM_NAME] = TRAILING_SLASH_PARAM_VALUE_ESCAPED;
    }

    this._conditions[QUERY_STRING_PARAM_NAME] = '.*';
};

Route.prototype._setPatterns = function(patternOpts) {
    var opts = this._options,
        defaultPattern,
        patterns,
        patternIndex,
        patternsSize,
        currentPattern,
        patternName,
        patternTest,
        parsedPattern,
        pattern;

    defaultPattern = {
        name : DEFAULT_PATTERN_NAME,
        test : patternOpts
    };
    patterns = isArray(patternOpts) ? patternOpts : [ defaultPattern ];

    this._patterns = {};
    this._patternNames = [];

    for (patternIndex = 0, patternsSize = patterns.length; patternIndex < patternsSize; patternIndex++) {
        currentPattern = patterns[patternIndex];
        patternName = currentPattern.name;
        patternTest = currentPattern.test;

        if (typeof patternTest !== 'string' || typeof patternName !== 'string') {
            throw new Error('You must specify the pattern of the route');
        }

        if (opts.isTrailingSlashOptional !== false) {
            patternTest += GROUP_OPENED_CHAR + PARAM_OPENED_CHAR +
                TRAILING_SLASH_PARAM_NAME +
                PARAM_CLOSED_CHAR + GROUP_CLOSED_CHAR;
        }
    
        patternTest += GROUP_OPENED_CHAR +
            '?' + PARAM_OPENED_CHAR + QUERY_STRING_PARAM_NAME + PARAM_CLOSED_CHAR +
            GROUP_CLOSED_CHAR;

        parsedPattern = this._parsePattern(patternTest);
        pattern = {
            name : patternName,
            test : patternTest,
            params : parsedPattern.params,
            mainParams : parsedPattern.mainParams,
            requiredParams : parsedPattern.requiredParams,
            optionalParams : parsedPattern.optionalParams,
            parts : parsedPattern.parts
        };

        this._buildParseRegExp(pattern);
        this._buildBuildFn(pattern);
        this._patterns[patternName] = pattern;
        this._patternNames.push(patternName);
    }
};

/**
 * @param {String} pattern
 * @param {Boolean} [isOptional=false]
 * @returns {Array}
 * @private
 */
Route.prototype._parsePattern = function(pattern, isOptional) {
    var part = '',
        character,
        i = 0, j, size,
        countOpened = 0,
        isFindingClosed = false,
        length = pattern.length,
        what,
        parsedPattern,
        parseResult;

    parseResult = {
        parts : [],
        params : [],
        mainParams : [],
        requiredParams : [],
        optionalParams : []
    };

    var addParams = function(params, requiredParams) {
        var paramIndex,
            paramsSize,
            param;

        for (paramIndex = 0, paramsSize = params.length; paramIndex < paramsSize; paramIndex++) {
            param = params[paramIndex];

            parseResult.params.push(param);
            parseResult.mainParams[param] = true;

            if (requiredParams.indexOf(param) !== -1) {
                parseResult.requiredParams.push(param);
            } else {
                parseResult.optionalParams.push(param);
            }
        }
    };

    var addParts = function(parts) {
        var partIndex,
            partsSize,
            part;

        for (partIndex = 0, partsSize = parts.length; partIndex < partsSize; partIndex++) {
            part = parts[partIndex];

            parseResult.parts.push(part);
        }
    };

    while (i < length) {
        character = pattern.charAt(i++);

        if (character === GROUP_OPENED_CHAR) {
            if (isFindingClosed) {
                ++countOpened;
                part += character;
            } else {
                parsedPattern = this._parseParams(part, isOptional);
                addParams(parsedPattern.params, parsedPattern.requiredParams);
                addParts(parsedPattern.parts);

                part = '';
                countOpened = 0;
                isFindingClosed = true;
            }
        } else if (character === GROUP_CLOSED_CHAR) {
            if (isFindingClosed) {
                if (countOpened === 0) {
                    parsedPattern = this._parsePattern(part, true);

                    part = {
                        what : 'optional',
                        dependOnParams : [],
                        parts : parsedPattern.parts
                    };

                    addParams(parsedPattern.params, parsedPattern.requiredParams);
                    addParts([ part ]);

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

    parsedPattern = this._parseParams(part, isOptional);
    addParams(parsedPattern.params, parsedPattern.requiredParams);
    addParts(parsedPattern.parts);

    return parseResult;
};

/**
 * @param {String} pattern
 * @param {Boolean} isOptional
 * @private
 */
Route.prototype._parseParams = function(pattern, isOptional) {
    var matches = pattern.match(PARSE_PARAMS_REGEXP),
        i, size,
        part,
        paramName,
        parseResult;

    parseResult  = {
        parts : [],
        params : [],
        requiredParams : []
    };

    if (matches) {
        for (i = 0, size = matches.length; i < size; ++i) {
            part = matches[i];

            if (part.charAt(0) === PARAM_OPENED_CHAR && part.charAt(part.length - 1) === PARAM_CLOSED_CHAR) {
                paramName = part.substr(1, part.length - 2);

                parseResult.params.push(paramName);
                parseResult.parts.push({
                    what : 'param',
                    name : paramName
                });
                isOptional || parseResult.requiredParams.push(paramName);
            } else {
                parseResult.parts.push(part);
            }
        }
    }

    return parseResult;
};

/**
 * @private
 */
Route.prototype._buildParseRegExp = function(pattern) {
    pattern.parseRegExpSource = '^' + this._buildParseRegExpParts(pattern.parts) + '$';
    pattern.parseRegExp = new RegExp(pattern.parseRegExpSource);
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
Route.prototype._buildBuildFn = function(pattern) {
    pattern.buildFnSource = 'var h=({}).hasOwnProperty;return ' + this._buildBuildFnParts(pattern.parts) + ';';
    /*jshint evil:true */
    pattern.buildFn = new Function('p', pattern.buildFnSource);
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
        defaults = options.defaults,
        patterns = this._patterns,
        currentPattern,
        pattern,
        patternName;

    if (typeof path !== 'string' || (data && ! this._isDataMatched(data))) {
        return ret;
    }

    for (patternName in patterns) {
        if (has(patterns, patternName)) {
            pattern = patterns[patternName];
            matches = path.match(pattern.parseRegExp);

            if (matches) {
                currentPattern = pattern;
                break;
            }
        }
    }

    if (matches) {
        ret = {};

        for (i = 1, size = matches.length; i < size; ++i) {
            if (typeof matches[i] !== 'undefined' && /* for IE lt 9*/ matches[i] !== '') {
                paramName = currentPattern.params[i - 1];
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
                    if (currentPattern.mainParams[paramName] && isArray(paramValue)) {
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

Route.prototype._getPatternForBuild = function(params, isStrict) {
    var patterns = this._patterns,
        maxPatternWeight = 0,
        patternWeight,
        patternName,
        pattern,
        patternParams,
        requiredParams,
        requiredParamsCount,
        optionalParams,
        paramsIntersection,
        patternForBuild = null;

    for (patternName in patterns) {
        if (has(patterns, patternName)) {
            pattern = patterns[patternName];

            if (isStrict) {
                requiredParams = pattern.requiredParams;
                requiredParamsCount = requiredParams.length;
                paramsIntersection = this._getPatternParamsIntersection(requiredParams, params);

                if (requiredParamsCount !== paramsIntersection.length) {
                    continue;
                }

                optionalParams = pattern.optionalParams;
                paramsIntersection = this._getPatternParamsIntersection(optionalParams, params);
                patternWeight = paramsIntersection.length * OPTIONAL_PARAM_WEIGHT +
                    requiredParamsCount * REQUIRED_PARAM_WEIGHT;
            } else {
                patternParams = pattern.params;
                paramsIntersection = this._getPatternParamsIntersection(patternParams, params);
                
                patternWeight = paramsIntersection.length * REQUIRED_PARAM_WEIGHT;
            }

            if (! patternWeight) {
                patternWeight = MINIMAL_PATTERN_WEIGHT;
            }

            if (patternWeight > maxPatternWeight) {
                maxPatternWeight = patternWeight;
                patternForBuild = pattern;
            }
        }
    }

    return patternForBuild;
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
        pattern,
        paramName,
        paramValue,
        filter = options.preBuild,
        buildParams;

    buildParams = params || {};

    if (typeof filter === 'function') {
        buildParams = filter(buildParams);
    }

    pattern = this._getPatternForBuild(buildParams, isStrict);

    if (! pattern) {
        return null;
    }

    for (paramName in buildParams) {
        if (
            has(buildParams, paramName) &&
            buildParams[paramName] !== null &&
                typeof buildParams[paramName] !== 'undefined' &&
                (pattern.mainParams[paramName] || useQueryString)
        ) {
            paramValue = buildParams[paramName];
            if (isStrict && ! this._checkParamValue(paramName, paramValue)) {
                return null;
            }

            (pattern.mainParams[paramName] ? newParams : queryParams)[paramName] = paramValue;
        }
    }

    if (useQueryString) {
        queryString = querystring.stringify(queryParams);
        queryString && (newParams[QUERY_STRING_PARAM_NAME] = queryString);
    }

    return pattern.buildFn(newParams);
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
