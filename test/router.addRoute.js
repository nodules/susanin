/* global describe, it, Router, assert */

describe('route.addRoute()', function() {
    var Route = Router.Route;

    it('Instance of `Router` must have function `addRoute`', function(done) {
        assert.ok(typeof Router().addRoute === 'function');

        done();
    });

    it('`addRoute` must return instance of Route', function(done) {
        assert.ok(Router().addRoute({ name : 'first', pattern : '/opa' }) instanceof Route);

        done();
    });

    it('`addRoute` must add route to the beginning of route list if params.reverse passed', function(done) {
        var router = Router(),
            first = { name : 'first', pattern : '/foo' },
            second = { name : 'second', pattern : '/foo/bar' };

        router.addRoute(first);
        router.addRoute(second, { reverse : true });

        assert.equal(router._routes[0]._options.name, second.name);

        done();
    });

});
