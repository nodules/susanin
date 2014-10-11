/* global describe, it, Router, assert */

describe('Route', function() {
    var Route = Router.Route;

    it('`Route` must be function', function(done) {
        assert.ok(typeof Route === 'function');

        done();
    });

    it('`Route` must be constructor', function(done) {
        var route = new Route({ pattern : '/opa' });

        assert.ok(route instanceof Route);

        done();
    });

    it('`Route` can be called without "new"', function(done) {
        var route = Route({ pattern : '/opa' });

        assert.ok(route instanceof Route);

        done();
    });

    it('`options` is mandatory', function(done) {
        try {
            Route();

            assert.ok(false);
        } catch (e) {
            assert.ok(true);
        }

        done();
    });

    it('`options.pattern` property is mandatory', function(done) {
        try {
            Route({ name : 'opa' });

            assert.ok(false);
        } catch (e) {
            assert.ok(true);
        }

        done();
    });

    it('`options` can be string', function(done) {
        try {
            Route('/opa');

            assert.ok(true);
        } catch (e) {
            assert.ok(false);
        }

        done();
    });

});
