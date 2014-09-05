var Router = require('../router');

module.exports = {

    '"Router" must be function' : function(test) {
        test.ok(typeof Router === 'function');
        test.done();
    },

    '"Router" must be constructor' : function(test) {
        var router = new Router();

        test.ok(router instanceof Router);
        test.done();
    },

    '"Router" can be called without "new"' : function(test) {
        var router = Router();

        test.ok(router instanceof Router);
        test.done();
    }

};
