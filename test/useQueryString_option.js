/* global describe, it, Router, assert */

describe('useQueryString option', function() {
    var Route = Router.Route;

    describe('useQueryString is true by default => query string is parsed', function() {
        var route1 = Route('/opa'),
            route2 = Route('/opa/<param>'),
            route3 = Route({
                pattern : '/opa(/<param>)',
                conditions : {
                    param : '\\d\\d',
                    foo : '\\d'
                }
            });

        it('match()', function(done) {
            assert.deepEqual(route1.match('/opa'), {});
            assert.deepEqual(route1.match('/opa?foo=bar'), { foo : 'bar' });
            assert.deepEqual(route1.match(
                '/opa?foo=bar1&foo=bar2&param=value'),
                {
                    foo : [ 'bar1', 'bar2' ],
                    param : 'value'
                });

            assert.deepEqual(route2.match('/opa/value'), { param : 'value' });
            assert.deepEqual(route2.match('/opa/value?foo=bar'), { param : 'value', foo : 'bar' });
            assert.deepEqual(
                route2.match('/opa/value?foo=bar1&foo=bar2&param=value2'),
                {
                    param : 'value',
                    foo : [ 'bar1', 'bar2' ]
                });

            assert.deepEqual(route3.match('/opa'), {});
            assert.deepEqual(route3.match('/opa/value'), null);
            assert.deepEqual(route3.match('/opa/12'), { param : '12' });
            assert.deepEqual(route3.match('/opa/12?param=34'), { param : '12' });
            assert.deepEqual(route3.match('/opa?param=value'), {});
            assert.deepEqual(route3.match('/opa?param=12'), { param : '12' });
            assert.deepEqual(route3.match('/opa?param=12&param=value'), { param : '12' });
            assert.deepEqual(route3.match('/opa?param=12&param=34'), { param : '12' });
            assert.deepEqual(route3.match('/opa?foo=12&foo=3&param=value&param=12'), { foo : '3' });

            done();
        });

        it('build()', function(done) {
            done();
        });

    });

    describe('useQueryString === false', function() {
        var route1 = Route({ pattern : '/opa', useQueryString : false }),
            route2 = Route({ pattern : '/opa/<param>', useQueryString : false }),
            route3 = Route({ pattern : '/opa(/<param>)', useQueryString : false });

        it('match()', function(done) {
            assert.deepEqual(route1.match('/opa'), {});
            assert.deepEqual(route1.match('/opa?foo=bar'), null);

            assert.deepEqual(route2.match('/opa/value'), { param : 'value' });
            assert.deepEqual(route2.match('/opa/value?param=bar'), null);

            assert.deepEqual(route3.match('/opa'), {});
            assert.deepEqual(route3.match('/opa?param=value'), null);
            assert.deepEqual(route3.match('/opa/value'), { param : 'value' });
            assert.deepEqual(route3.match('/opa/value?param=value1'), null);

            done();
        });

        it('build()', function(done) {
            assert.deepEqual(route1.build(), '/opa');
            assert.deepEqual(route1.build({ foo : 'bar' }), '/opa');

            assert.deepEqual(route2.build(), '/opa/');
            assert.deepEqual(route2.build({ param : 'value' }), '/opa/value');
            assert.deepEqual(route2.build({ param : 'value', foo : 'bar' }), '/opa/value');

            assert.deepEqual(route3.build(), '/opa');
            assert.deepEqual(route2.build({ param : 'value' }), '/opa/value');
            assert.deepEqual(route2.build({ param : 'value', foo : 'bar' }), '/opa/value');

            done();
        });

    });

});
