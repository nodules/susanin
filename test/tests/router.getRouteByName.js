var Router = require('../router');

module.exports = {

    '"getRouteByName" must return right instance of "Route"' : function(test) {
        var router = Router(),
            routeFoo = router.addRoute({ pattern : '/foo', data : { name : 'foo' } }),
            routeBar = router.addRoute({ pattern : '/bar', data : { name : 'bar' } });

        test.strictEqual(router.getRouteByName('bar'), routeBar);
        test.strictEqual(router.getRouteByName('foo'), routeFoo);
        test.strictEqual(router.getRouteByName('opa'), null);

        test.done();
    }

};
