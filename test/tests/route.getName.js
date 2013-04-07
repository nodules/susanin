var Susanin = require('../../'),
    Route = Susanin.Route;

module.exports = {

    'route.getName() must return right data' : function(test) {
        test.strictEqual(Route('/opa').getName(), undefined);
        test.strictEqual(Route({ pattern : '/opa', name : 'opa' }).getName(), 'opa');
        test.strictEqual(Route({ pattern : '/opa', data : { name : 'opa' } }).getName(), 'opa');
        test.done();
    }

};