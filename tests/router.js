var Router = require('../susanin.min.js');

module.exports = {

    '"Router" must be function' : function(test) {
        test.ok(typeof Router === 'function');
        test.done();
    },

    '"Router" must be constructor' : function(test) {
        var router = new Router();

        test.ok(router instanceof Router);
        test.done();
    },

    '"Router" can be called without "new"' : function(test) {
        var router = Router();

        test.ok(router instanceof Router);
        test.done();
    },

    'Instance of "Router" must have function "addRoute"' : function(test) {
        test.ok(typeof Router().addRoute === 'function');
        test.done();
    },

    '"addRoute" must return instance of Router.Route' : function(test) {
        test.ok(Router().addRoute({ name : 'first', pattern : '/opa' }) instanceof Router.Route);
        test.done();
    },

    '"getRouteByName" must return right instance of "Route"' : function(test) {
        var router = Router(),
            routeFoo = router.addRoute({ name : 'foo', pattern : '/foo' }),
            routeBar = router.addRoute({ name : 'bar', pattern : '/bar' });

        test.strictEqual(router.getRouteByName('bar'), routeBar);
        test.strictEqual(router.getRouteByName('foo'), routeFoo);
        test.strictEqual(router.getRouteByName('opa'), null);

        test.done();
    }

};