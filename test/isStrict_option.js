/* global describe, it, Router, assert */

describe('isStrict option', function() {
    var Route = Router.Route,
        route1 = Route({
            pattern : '/opa/<param1>(/<param2>)',
            conditions : {
                param : '\\d',
                param1 : '\\d\\d',
                param2 : '\\d\\d\\d'
            }
        }),
        route2 = Route({
            pattern : '/opa/<param1>(/<param2>)',
            useQueryString : false,
            conditions : {
                param : '\\d',
                param1 : '\\d\\d',
                param2 : '\\d\\d\\d'
            }
        });

    it('isStrict is false by default => validation params is not applicable', function(done) {
        assert.deepEqual(route1.build({}), '/opa/');
        assert.deepEqual(route1.build({ param : 'value' }), '/opa/?param=value');
        assert.deepEqual(route1.build({ param1 : 'value1' }), '/opa/value1');
        assert.deepEqual(route1.build({ param1 : 'value1', param2 : 'value2' }), '/opa/value1/value2');

        done();
    });

    it('isStrict === true', function(done) {
        assert.deepEqual(route1.build({}, true), null);
        assert.deepEqual(route1.build({ param1 : 'value1' }, true), null);
        assert.deepEqual(route1.build({ param1 : '12' }, true), '/opa/12');
        assert.deepEqual(route1.build({ param2 : 'value2' }, true), null);
        assert.deepEqual(route1.build({ param2 : '123' }, true), null);
        assert.deepEqual(route1.build({ param1 : '12', param2 : 'value2' }, true), null);
        assert.deepEqual(route1.build({ param1 : '12', param2 : '123' }, true), '/opa/12/123');
        assert.deepEqual(route1.build({ param1 : '12', param : '12' }, true), null);
        assert.deepEqual(route1.build({ param1 : '12', param : '1' }, true), '/opa/12?param=1');
        assert.deepEqual(route2.build({ param1 : '12', param : '12' }, true), '/opa/12');
        assert.deepEqual(route2.build({ param1 : '12', param : '1' }, true), '/opa/12');

        done();
    });

});
