/* global describe, it, Router, assert */

describe('route.match() with data', function() {
    var Route = Router.Route;

    it('routeData is absent', function(done) {
        var route = Route('/opa');

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), {});
        assert.deepEqual(route.match('/opa', {}), {});
        assert.deepEqual(route.match('/opa', { method : 'get' }), null);

        done();
    });

    it('data is an object', function(done) {
        function Data() {}
        Data.prototype = { method : 'post' };

        var routeData = {
                method : 'get',
                foo : [ 'bar1', 'bar2' ]
            },
            route = Route({
                pattern : '/opa',
                data : routeData
            });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), {});
        assert.deepEqual(route.match('/opa', null), {});
        assert.deepEqual(route.match('/opa', {}), {});
        assert.deepEqual(route.match('/opa', 1), {});
        assert.deepEqual(route.match('/opa', 'a'), {});
        assert.deepEqual(route.match('/opa', { method : 'post' }), null);
        assert.deepEqual(route.match('/opa', { method : 'get' }), {});
        assert.deepEqual(route.match('/opa', { foo : 'bar1' }), null);
        assert.deepEqual(route.match('/opa', { foo : 'bar2' }), null);
        assert.deepEqual(route.match('/opa', { foo : [ 'bar1', 'bar2' ] }), null);
        assert.deepEqual(route.match('/opa', { foo : routeData.foo }), {});
        assert.deepEqual(route.match('/opa', { method : 'get', foo : routeData.foo }), {});
        assert.deepEqual(route.match('/opa', { method : 'post', foo : routeData.foo }), null);
        assert.deepEqual(route.match('/opa', new Data()), {});

        done();
    });

    it('data is a function', function(done) {
        var routeData = {
                method : 'get',
                foo : [ 'bar1', 'bar2' ]
            },
            route = Route({
                pattern : '/opa',
                data : routeData
            }),
            undef;

        [ true, false, 0, 1, '', 'a', undef, {} ].forEach(function(value) {
            assert.deepEqual(route.match('/opa', function() {
                return value;
            }), Boolean(value) ? {} : null);
        });

        route.match('/opa', function(data) {
            assert.deepEqual(data, routeData);
        });

        done();
    });

});
