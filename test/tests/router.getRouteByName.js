var Susanin = require('../../');

module.exports = {

    '"getRouteByName" must return right instance of "Route"' : function(test) {
        var susanin = Susanin(),
            routeFoo = susanin.addRoute({ pattern : '/foo', data : { name : 'foo' } }),
            routeBar = susanin.addRoute({ pattern : '/bar', data : { name : 'bar' } });

        test.strictEqual(susanin.getRouteByName('bar'), routeBar);
        test.strictEqual(susanin.getRouteByName('foo'), routeFoo);
        test.strictEqual(susanin.getRouteByName('opa'), null);

        test.done();
    }

};