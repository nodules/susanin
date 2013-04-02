var Susanin = require('../../'),
    Route = Susanin.Route;

module.exports = {

    '"Route" must be function' : function(test) {
        test.ok(typeof Route === 'function');
        test.done();
    },

    '"Route" must be constructor' : function(test) {
        var route = new Route({ name : 'opa', pattern : '/opa' });

        test.ok(route instanceof Route);
        test.done();
    },

    '"Route" can be called without "new"' : function(test) {
        var route = Route({ name : 'opa', pattern : '/opa' });

        test.ok(route instanceof Route);
        test.done();
    },

    '"options" is mandatory' : function(test) {
        try {
            var route = Route();

            test.ok(false);
        } catch (e) {
            test.ok(true);
        }
        test.done();
    },

    '"options.name" property is mandatory' : function(test) {
        try {
            var route = Route({ pattern : '/opa' });

            test.ok(false);
        } catch (e) {
            test.ok(true);
        }
        test.done();
    },

    '"options.pattern" property is mandatory' : function(test) {
        try {
            var route = Route({ name : 'opa' });

            test.ok(false);
        } catch (e) {
            test.ok(true);
        }
        test.done();
    },

    'route.bind() must return right data' : function(test) {
        var route = Route({ name : 'opa', pattern : '/opa' }),
            data = {
                foo : 'bar'
            };

        route.bind(data);
        test.strictEqual(route.bind(), data);
        test.done();
    },

    'route.getName() must return the name of the route' : function(test) {
        var route = Route({ name : 'opa', pattern : '/opa' });

        test.strictEqual(route.getName(), 'opa');
        test.done();
    }

};