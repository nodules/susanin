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
            tmp, value, key,
            i, size;

        if (typeof query !== 'string' || query === '') {
            return params;
        }

        sep || (sep = '&');
        eq || (eq = '=');

        queryParams = query.split(sep);

        for (i = 0, size = queryParams.length; i < size; ++i) {
            tmp = queryParams[i].split(eq);
            value = typeof tmp[1] !== 'undefined' ? querystring.decode(tmp[1]) : '';
            key = querystring.decode(tmp[0]);

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
