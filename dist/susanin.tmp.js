(function(global) {
    function require(key) {
        return ({
            './querystring' : function() {
                var module = {};

                /*borschik:include:../lib/querystring.js*/

                return module.exports;
            },
            './route' : function() {
                var module = {};

                /*borschik:include:../lib/route.js*/

                return module.exports;
            },
            './router' : function() {
                var module = {};

                /*borschik:include:../lib/router.js*/

                return module.exports;
            }
        })[key]();
    }

    var Router = require('./router'),
        defineAsGlobal = true;

    // CommonJS
    if (global.module && typeof module.exports === 'object') {
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
