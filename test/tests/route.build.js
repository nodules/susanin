var Route = require('../router').Route;

module.exports = {

    '/opa' : function(test) {
        var route = Route('/opa');

        test.strictEqual(route.build(), '/opa');
        test.strictEqual(route.build({}), '/opa');
        test.strictEqual(route.build({ foo : 'bar' }), '/opa?foo=bar');
        test.strictEqual(route.build({ foo : undefined }), '/opa');
        test.strictEqual(route.build({ foo : null }), '/opa');
        test.strictEqual(route.build({ foo : [ 'bar1', 'bar2' ] }), '/opa?foo=bar1&foo=bar2');
        test.strictEqual(route.build({ '' : [ 'bar1', 'bar2' ] }), '/opa?=bar1&=bar2');
        test.strictEqual(route.build({ '' : '' }), '/opa?=');
        test.strictEqual(route.build({ foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa/<param>' : function(test) {
        var route = Route('/opa/<param>');

        test.strictEqual(route.build(), '/opa/');
        test.strictEqual(route.build({}), '/opa/');
        test.strictEqual(route.build({ param : 'bar' }), '/opa/bar');
        test.strictEqual(route.build({ param : [ 'bar1', 'bar2' ] }), '/opa/bar1,bar2');
        test.strictEqual(route.build({ param : { foo : 'bar' } }), '/opa/[object Object]');
        test.strictEqual(route.build({ param : undefined }), '/opa/');
        test.strictEqual(route.build({ param : null }), '/opa/');
        test.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa/<param' : function(test) {
        var route = Route('/opa/<param');

        test.strictEqual(route.build(), '/opa/<param');
        test.strictEqual(route.build({ param : 'bar' }), '/opa/<param?param=bar');
        test.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/<param?param=bar&foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa/<param> with defaults' : function(test) {
        var route = Route({
                pattern : '/opa/<param>',
                defaults : {
                    param : 'value'
                }
            });

        test.strictEqual(route.build(), '/opa/value');
        test.strictEqual(route.build({ param : 'bar' }), '/opa/bar');
        test.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa(/opapa/<param>)' : function(test) {
        var route = Route('/opa(/opapa/<param>)');

        test.strictEqual(route.build(), '/opa');
        test.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        test.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa(/opapa/<param>) with defaults' : function(test) {
        var route = Route({
                pattern : '/opa(/opapa/<param>)',
                defaults : {
                    param : 'value'
                }
            });

        test.strictEqual(route.build(), '/opa');
        test.strictEqual(route.build({ param : 'bar' }), '/opa/opapa/bar');
        test.strictEqual(route.build({ param : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa(/opapa/<param1>)(/<param2>)' : function(test) {
        var route = Route('/opa(/opapa/<param1>)(/<param2>)');

        test.strictEqual(route.build(), '/opa');
        test.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        test.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        test.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        test.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    '/opa(/opapa/<param1>)(/<param2>) with defaults' : function(test) {
        var route = Route({
            pattern : '/opa(/opapa/<param1>)(/<param2>)',
            defaults : {
                param1 : 'value1',
                param2 : 'value2'
            }
        });

        test.strictEqual(route.build(), '/opa');
        test.strictEqual(route.build({ param1 : 'bar' }), '/opa/opapa/bar');
        test.strictEqual(route.build({ param2 : 'bar' }), '/opa/bar');
        test.strictEqual(route.build({ param1 : 'bar1', param2 : 'bar2' }), '/opa/opapa/bar1/bar2');
        test.strictEqual(route.build({ param1 : 'bar', foo1 : [ 'bar1', 'bar2' ], foo2 : [ 'bar3' ] }),
            '/opa/opapa/bar?foo1=bar1&foo1=bar2&foo2=bar3');

        test.done();
    },

    'Unsupported characters in params name' : function(test) {
        [ '+', '.', ',', ' ' ].forEach(function(character) {
            var paramName = 'param' + character,
                pattern = '/opa<' + paramName + '>',
                route = Route(pattern),
                obj = {};

            obj[paramName] = 'value';
            test.strictEqual(route.build(), pattern);
            test.strictEqual(route.build(obj), pattern + '?' + encodeURIComponent(paramName) + '=value');
        });

        test.done();
    },

    'You musn\'t start params name with digit' : function(test) {
        [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ].forEach(function(character) {
            var paramName = character + 'param',
                pattern = '/opa<' + paramName + '>',
                route = Route(pattern),
                obj = {};

            obj[paramName] = 'value';
            test.strictEqual(route.build(), pattern);
            test.strictEqual(route.build(obj), pattern + '?' + encodeURIComponent(paramName) + '=value');
        });

        test.done();
    }

};
