/* global describe, it, Router, assert */

describe('router.getRouteByName()', function() {

    it('`getRouteByName` must return right instance of `Route`', function(done) {
        var router = Router(),
            routeFoo = router.addRoute({ pattern : '/foo', name : 'foo' }),
            routeBar = router.addRoute({ pattern : '/bar', name : 'bar' });

        assert.strictEqual(router.getRouteByName('bar'), routeBar);
        assert.strictEqual(router.getRouteByName('foo'), routeFoo);
        assert.strictEqual(router.getRouteByName('opa'), null);

        done();
    });

});
