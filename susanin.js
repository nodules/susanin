(function(global) {

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
        parse : function (query, sep, eq) {
            var params = {},
                queryParams,
                tmp, value, key,
                i, size;

            arguments.length || (query = location.search.substr(1));

            if ( ! query) {
                return params;
            }

            sep || (sep = '&');
            eq || (eq = '=');

            queryParams = query.split(sep);

            for (i = 0, size = queryParams.length; i < size; ++i) {
                tmp = queryParams[i].split(eq);
                value = typeof tmp[1] !== 'undefined' ? querystring.decode(tmp[1]) : '';
                key = querystring.decode(tmp[0]);

                if (params.hasOwnProperty(key)) {
                    if ( ! isArray(params[key])) {
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
         * Build querystring from object
         * @link http://nodejs.org/api/querystring.html#querystring_querystring_stringify_obj_sep_eq
         * @param {Object} params
         * @param {String} [sep='&']
         * @param {String} [eq='=']
         * @returns {String}
         */
        stringify : function (params, sep, eq) {
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

    var escape = (function() {
        var SPECIAL_CHARS = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\' ],
            SPECIAL_CHARS_REGEXP = new RegExp('(\\' + SPECIAL_CHARS.join('|\\') + ')', 'g');

        return function(text) {
            return text.replace(SPECIAL_CHARS_REGEXP, '\\$1');
        };
    })();

    var PARAM_OPENED_CHAR = '<';
    var PARAM_CLOSED_CHAR = '>';

    var GROUP_OPENED_CHAR = '(';
    var GROUP_CLOSED_CHAR = ')';

    var PARAM_NAME_REGEXP_SOURCE = '[a-zA-Z_][\\w\\-]*';
    var PARAM_VALUE_REGEXP_SOURCE = '[\\w\\-\\.~]+';

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
     * Creates new Route
     * @constructor
     * @param {Object|String} options If it's a string it means pattern for path match
     *  @param {String} [options.name] Name of the route
     *  @param {String} options.pattern Pattern for path match
     *  @param {Object} [options.conditions] Conditions for params in pattern
     *  @param {Object} [options.defaults] Defaults values for params in pattern
     *  @param {Object} [options.data] Data that will be bonded with route
     * @param {Array} [_options] If you want to create instance from bundle made of bunle method
     */
    function Route(options, _options) {
        if ( ! (this instanceof Route)) {
            return new Route(options, _options);
        }

        if (_options) {
            this._defaults = _options[0];
            this._paramsMap = _options[1];
            this._parseRegExpSource = _options[2];
            this._buildFnSource = _options[3];
            this._data = _options[4];

            /*jshint evil:true */
            this._buildFn = new Function('p', this._buildFnSource);
            this._parseRegExp = new RegExp(this._parseRegExpSource);

            return;
        }

        typeof options === 'string' && (options = { pattern : options });

        if ( ! options || typeof options !== 'object') {
            throw new Error('You must specify options');
        }

        if (typeof options.pattern !== 'string') {
            throw new Error('You must specify the pattern of the route');
        }
        this._pattern = options.pattern;

        this._conditions = options.conditions && typeof options.conditions === 'object' ? options.conditions : {};
        this._defaults = options.defaults && typeof options.defaults === 'object' ? options.defaults : {};
        this._data = options.data && typeof options.data === 'object' ? options.data : {};
        typeof options.name === 'string' && (this._data.name = options.name);

        /* query_string */
        this._pattern += GROUP_OPENED_CHAR +
            '?' + PARAM_OPENED_CHAR + 'query_string' + PARAM_CLOSED_CHAR +
            GROUP_CLOSED_CHAR;
        this._conditions.query_string = '.*';
        /* /query_string */

        this._parts = this._parsePattern(this._pattern);
        this
            ._buildParseRegExp()
            ._buildBuildFn();
    }

    /**
     * @param {String} pattern
     * @returns {Array}
     * @private
     */
    Route.prototype._parsePattern = function(pattern) {
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
                    this._parseParams(part, parts);
                    part = '';
                    countOpened = 0;
                    isFindingClosed = true;
                }
            } else if (character === GROUP_CLOSED_CHAR) {
                /*jshint maxdepth:10*/
                if (isFindingClosed) {
                    if (countOpened === 0) {
                        part = {
                            what : 'optional',
                            dependOnParams : [],
                            parts : this._parsePattern(part)
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

        this._parseParams(part, parts);

        return parts;
    };

    /**
     * @param {String} pattern
     * @param {Array} parts
     * @private
     */
    Route.prototype._parseParams = function(pattern, parts) {
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
    };

    /**
     * @returns {Route}
     * @private
     */
    Route.prototype._buildParseRegExp = function() {
        this._paramsMap = [];
        this._parseRegExpSource = '^' + this._buildParseRegExpParts(this._parts) + '$';
        this._parseRegExp = new RegExp(this._parseRegExpSource);

        return this;
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
            } else if (part && part.what === 'param') {
                this._paramsMap.push(part.name);
                ret += '(' + this._buildParamValueRegExpSource(part.name) + ')';
            } else if (part && part.what === 'optional') {
                ret += '(?:' + this._buildParseRegExpParts(part.parts) + ')?';
            }
        }

        return ret;
    };

    /**
     * @param {String} paramName
     * @returns {String}
     * @private
     */
    Route.prototype._buildParamValueRegExpSource = function(paramName) {
        var ret,
            condition = this._conditions[paramName];

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
    };

    /**
     * @returns {Route}
     * @private
     */
    Route.prototype._buildBuildFn = function() {
        this._buildFnSource = 'var h=({}).hasOwnProperty;return ' + this._buildBuildFnParts(this._parts) + ';';
        /*jshint evil:true */
        this._buildFn = new Function('p', this._buildFnSource);

        return this;
    };

    /**
     * @param {Array} parts
     * @returns {String}
     * @private
     */
    Route.prototype._buildBuildFnParts = function(parts) {
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
                    (this._defaults && hasOwnProp.call(this._defaults, part.name) ?
                        '"' + escape(this._defaults[part.name]) +  '"' :
                        '""') +
                    ')';
            } else if (part && part.what === 'optional') {
                ret += '+((false';

                for (j = 0, sizeJ = part.dependOnParams.length; j < sizeJ; ++j) {
                    name = part.dependOnParams[j];

                    ret += '||(h.call(p,"' + escape(name) + '")' +
                        (this._defaults && hasOwnProp.call(this._defaults, name) ?
                            '&&p["' + escape(name) + '"]!=="' +
                                escape(this._defaults[name]) + '"' :
                            '') +
                        ')';
                }

                ret += ')?(' + this._buildBuildFnParts(part.parts) + '):"")';
            }
        }

        return ret;
    };

    /**
     * Matches object with route
     * @param {Object|String} matchObject
     * @returns {Object|null}
     */
    Route.prototype.match = function(matchObject) {
        var ret = null,
            matches,
            i, size,
            key,
            queryParams;

        if (typeof matchObject === 'string') {
            matchObject = { path : matchObject };
        } else if ( ! matchObject) {
            return ret;
        }

        for (key in matchObject) {
            if (hasOwnProp.call(matchObject, key) && key !== 'path') {
                if (this._data[key] !== matchObject[key]) {
                    return ret;
                }
            }
        }

        if (typeof matchObject.path === 'string') {
            matches = matchObject.path.match(this._parseRegExp);

            if (matches) {
                ret = {};

                for (i = 1, size = matches.length; i < size; ++i) {
                    if (typeof matches[i] !== 'undefined') {

                        // IE lt 9
                        if (matches[i] !== '') {
                            ret[this._paramsMap[i - 1]] = matches[i];
                        }
                    }
                }

                queryParams = querystring.parse(ret.query_string);
                for (key in queryParams) {
                    if (hasOwnProp.call(queryParams, key)) {
                        if ( ! hasOwnProp.call(ret, key)) {
                            ret[key] = queryParams[key];
                        } else {
                            // assumes that matched params never have multiple values (array)
                            ret[key] = [ ret[key] ].concat(queryParams[key]);
                        }
                    }
                }
                delete ret.query_string;

                for (key in this._defaults) {
                    if (hasOwnProp.call(this._defaults, key) && ! hasOwnProp.call(ret, key)) {
                        ret[key] = this._defaults[key];
                    }
                }
            }
        } else {
            ret = {};
        }

        return ret;
    };

    /**
     * Build path from params
     * @param {Object} params
     * @returns {String}
     */
    Route.prototype.build = function(params) {
        var newParams = {},
            queryParams = {},
            queryString,
            key,
            isMainParam,
            i, size;

        for (key in params) {
            if (
                hasOwnProp.call(params, key) &&
                params[key] !== null &&
                typeof params[key] !== 'undefined'
            ) {
                isMainParam = false;
                for (i = 0, size = this._paramsMap.length; i < size; ++i) {
                    if (this._paramsMap[i] === key) {
                        isMainParam = true;
                        break;
                    }
                }

                if (isMainParam) {
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
     * Returns binded with route data
     * @returns {*}
     */
    Route.prototype.getData = function() {
        return this._data;
    };

    /**
     * Returns name of the route
     * @returns {*}
     */
    Route.prototype.getName = function() {
        return this._data.name;
    };

    /**
     * Returns bundle
     * @returns {Array}
     */
    Route.prototype.bundle = function() {
        return [
            this._defaults,
            this._paramsMap,
            this._parseRegExpSource,
            this._buildFnSource,
            this._data
        ];
    };


    /**
     * Creates new Router
     * @constructor
     * @param {Array} [bundle]
     */
    function Router(bundle) {
        if ( ! (this instanceof Router)) {
            return new Router(bundle);
        }

        this._routes = [];
        this._routesByName = {};

        bundle && this.addRoutesFromBundle(bundle);
    }

    /**
     * Add route
     * @param {Object|String} options
     * @param [_options]
     * @returns {Route}
     */
    Router.prototype.addRoute = function(options, _options) {
        var route,
            name;

        route = new Route(options, _options);

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

    /**
     * Returns bundle of all routes
     * @returns {Array}
     */
    Router.prototype.bundle = function() {
        var ret = [],
            i, size,
            routes = this._routes;

        for (i = 0, size = routes.length; i < size; ++i) {
            ret.push(routes[i].bundle());
        }

        return ret;
    };

    /**
     * Add routes from bunle
     * @param bundle
     * @returns {Router}
     */
    Router.prototype.addRoutesFromBundle = function(bundle) {
        var i, size;

        for (i = 0, size = bundle.length; i < size; ++i) {
            this.addRoute(null, bundle[i]);
        }

        return this;
    };

    Router.Route = Route;

    if (typeof module !== 'undefined' && typeof module.exports === 'object') {
        module.exports = Router;
    } else {
        global.Susanin = Router;
    }

})(this);
