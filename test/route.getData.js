var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    'route.getData() must return right data' : function(done) {
        assert.deepEqual(Route('/opa').getData(), {});
        assert.deepEqual(Route({ pattern : '/opa' }).getData(), {});
        assert.deepEqual(Route({ pattern : '/opa', data : { foo : 'bar' } }).getData(), { foo : 'bar' });

        done();
    }

};
