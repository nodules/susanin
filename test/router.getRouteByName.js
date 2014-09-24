var Router = require('./lib/router'),
    assert = require('chai').assert;

module.exports = {

    '`getRouteByName` must return right instance of `Route`' : function(done) {
        var router = Router(),
            routeFoo = router.addRoute({ pattern : '/foo', data : { name : 'foo' } }),
            routeBar = router.addRoute({ pattern : '/bar', data : { name : 'bar' } });

        assert.strictEqual(router.getRouteByName('bar'), routeBar);
        assert.strictEqual(router.getRouteByName('foo'), routeFoo);
        assert.strictEqual(router.getRouteByName('opa'), null);

        done();
    }

};
