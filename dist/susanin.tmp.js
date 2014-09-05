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

    global.Susanin = require('./router');
})(this);
