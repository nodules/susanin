var Router = require('./lib/router'),
    assert = require('chai').assert;

module.exports = {

    '`Router` must be function' : function(done) {
        assert.ok(typeof Router === 'function');

        done();
    },

    '`Router` must be constructor' : function(done) {
        var router = new Router();

        assert.ok(router instanceof Router);

        done();
    },

    '`Router` can be called without "new"' : function(done) {
        var router = Router();

        assert.ok(router instanceof Router);

        done();
    }

};
