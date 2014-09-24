var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    '`Route` must be function' : function(done) {
        assert.ok(typeof Route === 'function');

        done();
    },

    '`Route` must be constructor' : function(done) {
        var route = new Route({ pattern : '/opa' });

        assert.ok(route instanceof Route);

        done();
    },

    '`Route` can be called without "new"' : function(done) {
        var route = Route({ pattern : '/opa' });

        assert.ok(route instanceof Route);

        done();
    },

    '`options` is mandatory' : function(done) {
        try {
            Route();

            assert.ok(false);
        } catch (e) {
            assert.ok(true);
        }

        done();
    },

    '`options.pattern` property is mandatory' : function(done) {
        try {
            Route({ name : 'opa' });

            assert.ok(false);
        } catch (e) {
            assert.ok(true);
        }

        done();
    },

    '`options` can be string' : function(done) {
        try {
            Route('/opa');

            assert.ok(true);
        } catch (e) {
            assert.ok(false);
        }

        done();
    }

};
