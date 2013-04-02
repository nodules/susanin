var Susanin = require('../../');

module.exports = {

    '"Susanin" must be function' : function(test) {
        test.ok(typeof Susanin === 'function');
        test.done();
    },

    '"Susanin" must be constructor' : function(test) {
        var susanin = new Susanin();

        test.ok(susanin instanceof Susanin);
        test.done();
    },

    '"Susanin" can be called without "new"' : function(test) {
        var susanin = Susanin();

        test.ok(susanin instanceof Susanin);
        test.done();
    },

    'Instance of "Susanin" must have function "addRoute"' : function(test) {
        test.ok(typeof Susanin().addRoute === 'function');
        test.done();
    },

    '"addRoute" must return instance of Susanin.Route' : function(test) {
        test.ok(Susanin().addRoute({ name : 'first', pattern : '/opa' }) instanceof Susanin.Route);
        test.done();
    },

    '"getRouteByName" must return right instance of "Route"' : function(test) {
        var susanin = Susanin(),
            routeFoo = susanin.addRoute({ name : 'foo', pattern : '/foo' }),
            routeBar = susanin.addRoute({ name : 'bar', pattern : '/bar' });

        test.strictEqual(susanin.getRouteByName('bar'), routeBar);
        test.strictEqual(susanin.getRouteByName('foo'), routeFoo);
        test.strictEqual(susanin.getRouteByName('opa'), null);

        test.done();
    }

};