/* global describe, it, Router, assert */

describe('route.build()', function() {
    var Route = Router.Route;

    it('/opa', function(done) {
        var route = Route('/opa');

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({}), '/opa');
        assert.strictEqual(route.build({ foo : 'bar' }), '/opa?foo=bar');
        assert.strictEqual(route.build({ foo : undefined }), '/opa');
        assert.strictEqual(route.build({ foo : null }), '/opa');
        assert.strictEqual(route.build({ foo : [ 'bar1', 'bar2' ] }), '/opa?foo=bar1&foo=bar2');
        assert.strictEqual(route.build({ '' : [ 'bar1', 'bar2' ] }), '/opa?=bar1&=bar2');
        assert.strictEqual(route.build({ '' : '' }), '/opa?=');
        assert.strictEqual(route.build({ foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa/<param>', function(done) {
        var route = Route('/opa/<param>');

        assert.strictEqual(route.build(), '/opa/');
        assert.strictEqual(route.build({}), '/opa/');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param : [ 'bar1', 'bar2' ] }), '/opa/bar1,bar2');
        assert.strictEqual(route.build({ param : { foo : 'bar' } }), '/opa/[object Object]');
        assert.strictEqual(route.build({ param : undefined }), '/opa/');
        assert.strictEqual(route.build({ param : null }), '/opa/');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa/<param', function(done) {
        var route = Route('/opa/<param');

        assert.strictEqual(route.build(), '/opa/<param');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/<param?param=bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/<param?param=bar&foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa/<param> and defaults', function(done) {
        var route = Route({
                pattern : '/opa/<param>',
                defaults : {
                    param : 'value'
                }
            });

        assert.strictEqual(route.build(), '/opa/value');
        assert.strictEqual(route.build({ param : 'value' }), '/opa/value');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa(/opapa/<param>)', function(done) {
        var route = Route('/opa(/opapa/<param>)');

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa(/opapa/<param>) and defaults', function(done) {
        var route = Route({
                pattern : '/opa(/opapa/<param>)',
                defaults : {
                    param : 'value'
                }
            });

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param : 'value' }), '/opa');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa(/opapa/<param1>)(/<param2>)', function(done) {
        var route = Route('/opa(/opapa/<param1>)(/<param2>)');

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        assert.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa(/opapa/<param1>)(/<param2>) and defaults', function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param1>)(/<param2>)',
            defaults : {
                param1 : 'value1',
                param2 : 'value2'
            }
        });

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param1 : 'value1' }), '/opa');
        assert.strictEqual(route.build({ param2 : 'value2' }), '/opa');
        assert.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param1 : 'value1', param2 : 'value2' }), '/opa');
        assert.strictEqual(route.build({ param1 : 'value1', param2 : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param1 : 'bar', param2 : 'value2' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        assert.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('/opa(/opapa/<param1>(/<param2>)) and defaults', function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param1>(/<param2>))',
            defaults : {
                param1 : 'value1',
                param2 : 'value2'
            }
        });

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param1 : 'value1' }), '/opa');
        assert.strictEqual(route.build({ param2 : 'value2' }), '/opa');
        assert.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param2 : 'bar' }), '/opa/opapa/value1/bar');
        assert.strictEqual(route.build({ param1 : 'value1', param2 : 'value2' }), '/opa');
        assert.strictEqual(route.build({ param1 : 'value1', param2 : 'bar' }), '/opa/opapa/value1/bar');
        assert.strictEqual(route.build({ param1 : 'bar', param2 : 'value2' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    });

    it('Unsupported characters in params name', function(done) {
        [ '+', '.', ',', ' ' ].forEach(function(character) {
            var paramName = 'param' + character,
                pattern = '/opa<' + paramName + '>',
                route = Route(pattern),
                obj = {};

            obj[paramName] = 'value';
            assert.strictEqual(route.build(), pattern);
            assert.strictEqual(route.build(obj), pattern + '?' + encodeURIComponent(paramName) + '=value');
        });

        done();
    });

    it('You musn\'t start params name with digit', function(done) {
        [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ].forEach(function(character) {
            var paramName = character + 'param',
                pattern = '/opa<' + paramName + '>',
                route = Route(pattern),
                obj = {};

            obj[paramName] = 'value';
            assert.strictEqual(route.build(), pattern);
            assert.strictEqual(route.build(obj), pattern + '?' + encodeURIComponent(paramName) + '=value');
        });

        done();
    });

});

describe('route.build(): Support of multiple patterns', function() {
    var Route = Router.Route;

    it('non strict', function() {
        var route = Route({
            patterns : [
                {
                    pattern : '/search/mark-<mark>(/<model>)/year-<year>'
                },
                '/search/mark-<mark>/price-<price>',
                '/search/mark-<mark>(/<model>)',
                '/search'
            ]
        });

        var route2 = Route({
            patterns : [
                '/search/mark-<mark>/model-<model>',
                '/search/mark-<mark>/year-<year>',
            ]
        });

        assert.strictEqual(route.build(), '/search');
        assert.strictEqual(route2.build(), '/search/mark-/year-');
        assert.strictEqual(route2.build({ mark : 'vaz', model : '2106' }), '/search/mark-vaz/model-2106');
        assert.strictEqual(route2.build({ mark : 'vaz', year : '2000' }), '/search/mark-vaz/year-2000');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106' }), '/search?foo=bar&model=2106');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz' }), '/search/mark-vaz/2106?foo=bar');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', year : '1812' }), '/search/mark-vaz/2106/year-1812?foo=bar');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', year : '1812', price : 100500 }), '/search/mark-vaz/2106/year-1812?foo=bar&price=100500');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', price : 100500 }), '/search/mark-vaz/price-100500?foo=bar&model=2106');
    });

    it('strict', function() {
        var route = Route({
            patterns : [
                '/search/mark-<mark>(/<model>)/year-<year>',
                '/search/mark-<mark>/price-<price>',
                '/search/mark-<mark>(/<model>)',
            ]
        });

        assert.strictEqual(route.build({}, true), null);
        assert.strictEqual(route.build({ foo : 'bar', model : '2106' }, true), null);
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz' }, true), '/search/mark-vaz/2106?foo=bar');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', year : '1812' }, true), '/search/mark-vaz/2106/year-1812?foo=bar');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', year : '1812', price : 100500 }, true), '/search/mark-vaz/2106/year-1812?foo=bar&price=100500');
        assert.strictEqual(route.build({ foo : 'bar', model : '2106', mark : 'vaz', price : 100500 }, true), '/search/mark-vaz/price-100500?foo=bar&model=2106');
    });

    it('defaults in sub pattern', function() {
        var route = Route({
            defaults : {
                mark : 'default-mark'
            },
            patterns : [
                {
                    pattern : '/search/mark-<mark>/year-<year>',
                    defaults : {
                        mark : 'default-sub-mark'
                    }
                },
                '/search/mark-<mark>/price-<price>',
            ]
        });

        assert.strictEqual(route.build({ year : 2000 }), '/search/mark-default-sub-mark/year-2000');
        assert.strictEqual(route.build({ price : 100500 }), '/search/mark-default-mark/price-100500');
    });

    it('conditions in sub pattern', function() {
        var route = Route({
            conditions : {
                year : '\\d\\d',
                'sub-year' : '\\d'
            },
            patterns : [
                {
                    pattern : '/search/year-sub-<sub-year>',
                    conditions : {
                        'sub-year' : '\\d\\d\\d\\d'
                    }
                },
                '/search/year-<year>',
            ]
        });

        assert.strictEqual(route.build({ 'sub-year' : 2000 }), '/search/year-sub-2000');
        assert.strictEqual(route.build({ 'sub-year' : 20 }), '/search/year-?sub-year=20');
        assert.strictEqual(route.build({ 'sub-year' : 40 }, true), null);
        assert.strictEqual(route.build({ year : 10 }, true), '/search/year-10');
    });
});
