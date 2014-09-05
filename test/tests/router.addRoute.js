var Router = require('../router'),
    Route = Router.Route;

module.exports = {

    'Instance of "Router" must have function "addRoute"' : function(test) {
        test.ok(typeof Router().addRoute === 'function');
        test.done();
    },

    '"addRoute" must return instance of Route' : function(test) {
        test.ok(Router().addRoute({ name : 'first', pattern : '/opa' }) instanceof Route);
        test.done();
    }

};
