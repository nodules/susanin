/* global describe, it, Router, assert */

describe('route.getName()', function() {
    var Route = Router.Route;

    it('route.getName() must return right data', function(done) {
        var undef;

        assert.strictEqual(Route('/opa').getName(), undef);
        assert.strictEqual(Route({ pattern : '/opa', name : 'opa' }).getName(), 'opa');

        done();
    });

});
