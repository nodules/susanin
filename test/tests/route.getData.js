var Susanin = require('../../'),
    Route = Susanin.Route;

module.exports = {

    'route.getData() must return right data' : function(test) {
        test.deepEqual(Route('/opa').getData(), {});
        test.deepEqual(Route({ pattern : '/opa' }).getData(), {});
        test.deepEqual(Route({ pattern : '/opa', data : { foo : 'bar' } }).getData(), { foo : 'bar' });
        test.done();
    }

};