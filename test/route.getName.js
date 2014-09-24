var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    'route.getName() must return right data' : function(done) {
        assert.strictEqual(Route('/opa').getName(), undefined);
        assert.strictEqual(Route({ pattern : '/opa', name : 'opa' }).getName(), 'opa');
        assert.strictEqual(Route({ pattern : '/opa', data : { name : 'opa' } }).getName(), 'opa');

        done();
    }

};
