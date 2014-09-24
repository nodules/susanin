var Router = require('./lib/router'),
    Route = Router.Route,
    assert = require('chai').assert;

module.exports = {

    'Instance of `Router` must have function `addRoute`' : function(done) {
        assert.ok(typeof Router().addRoute === 'function');

        done();
    },

    '`addRoute` must return instance of Route' : function(done) {
        assert.ok(Router().addRoute({ name : 'first', pattern : '/opa' }) instanceof Route);

        done();
    }

};
