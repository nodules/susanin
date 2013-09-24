var Susanin = require('../../'),
    Route = Susanin.Route;

module.exports = {

    '"Route" must be function' : function(test) {
        test.ok(typeof Route === 'function');
        test.done();
    },

    '"Route" must be constructor' : function(test) {
        var route = new Route({ pattern : '/opa' });

        test.ok(route instanceof Route);
        test.done();
    },

    '"Route" can be called without "new"' : function(test) {
        var route = Route({ pattern : '/opa' });

        test.ok(route instanceof Route);
        test.done();
    },

    '"options" is mandatory' : function(test) {
        try {
            Route();

            test.ok(false);
        } catch (e) {
            test.ok(true);
        }
        test.done();
    },

    '"options.pattern" property is mandatory' : function(test) {
        try {
            Route({ name : 'opa' });

            test.ok(false);
        } catch (e) {
            test.ok(true);
        }
        test.done();
    },

    '"options" can be string' : function(test) {
        try {
            Route('/opa');

            test.ok(true);
        } catch (e) {
            test.ok(false);
        }
        test.done();
    }

};
