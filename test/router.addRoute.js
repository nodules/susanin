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

});
