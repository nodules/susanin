/* global describe, it, Router, assert */

describe('route.getName()', function() {
    var Route = Router.Route;

    it('route.getName() must return right data', function(done) {
        assert.strictEqual(Route('/opa').getName(), undefined);
        assert.strictEqual(Route({ pattern : '/opa', name : 'opa' }).getName(), 'opa');
        assert.strictEqual(Route({ pattern : '/opa', data : { name : 'opa' } }).getName(), 'opa');

        done();
    });

});
