/* global describe, it, Router, assert */

describe('Router', function() {

    it('`Router` must be function', function(done) {
        assert.ok(typeof Router === 'function');

        done();
    });

    it('`Router` must be constructor', function(done) {
        var router = new Router();

        assert.ok(router instanceof Router);

        done();
    });

    it('`Router` can be called without "new"', function(done) {
        var router = Router();

        assert.ok(router instanceof Router);

        done();
    });

});
