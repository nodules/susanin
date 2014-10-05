var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    '/opa' : function(done) {
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
    },

    '/opa/<param>' : function(done) {
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
    },

    '/opa/<param> with preBuild function' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            preBuild : function(params) {
                if (params) {
                    params.foo = 'bar';
                }

                if (params && params.param === 'value1') {
                    return {
                        param : 'value2'
                    };
                }

                return params;
            }
        });

        assert.deepEqual(route.build(), '/opa/');
        assert.deepEqual(route.build({ param : 'value' }), '/opa/value?foo=bar');
        assert.deepEqual(route.build({ param : 'value1' }), '/opa/value2');
        assert.deepEqual(route.build({ param : 'value', foo : 'bar1' }), '/opa/value?foo=bar');

        done();
    },

    '/opa/<param' : function(done) {
        var route = Route('/opa/<param');

        assert.strictEqual(route.build(), '/opa/<param');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/<param?param=bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/<param?param=bar&foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    '/opa/<param> with defaults' : function(done) {
        var route = Route({
                pattern : '/opa/<param>',
                defaults : {
                    param : 'value'
                }
            });

        assert.strictEqual(route.build(), '/opa/value');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    '/opa(/opapa/<param>)' : function(done) {
        var route = Route('/opa(/opapa/<param>)');

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    '/opa(/opapa/<param>) with defaults' : function(done) {
        var route = Route({
                pattern : '/opa(/opapa/<param>)',
                defaults : {
                    param : 'value'
                }
            });

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    '/opa(/opapa/<param1>)(/<param2>)' : function(done) {
        var route = Route('/opa(/opapa/<param1>)(/<param2>)');

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        assert.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    '/opa(/opapa/<param1>)(/<param2>) with defaults' : function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param1>)(/<param2>)',
            defaults : {
                param1 : 'value1',
                param2 : 'value2'
            }
        });

        assert.strictEqual(route.build(), '/opa');
        assert.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        assert.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        assert.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        assert.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        done();
    },

    'Unsupported characters in params name' : function(done) {
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
    },

    'You musn\'t start params name with digit' : function(done) {
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
    }

};
