var Susanin = require('../../');

module.exports = {

    'Instance of "Susanin" must have function "addRoute"' : function(test) {
        test.ok(typeof Susanin().addRoute === 'function');
        test.done();
    },

    '"addRoute" must return instance of Susanin.Route' : function(test) {
        test.ok(Susanin().addRoute({ name : 'first', pattern : '/opa' }) instanceof Susanin.Route);
        test.done();
    }

};