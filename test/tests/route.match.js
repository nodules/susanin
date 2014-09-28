var Susanin = require('../../'),
    Route = Susanin.Route;

module.exports = {

    'undefined' : function(test, undefined) {
        var route = Route('/opa');

        test.deepEqual(route.match(undefined), null);

        test.done();
    },

    '/opa' : function(test) {
        var route = Route('/opa');

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), {});
        test.deepEqual(route.match('/opa?foo'), { foo : '' });
        test.deepEqual(route.match('/opa?foo=bar'), { foo : 'bar' });
        test.deepEqual(route.match('/opa?=bar'), { '' : 'bar' });
        test.deepEqual(route.match('/opa?'), {});
        test.deepEqual(route.match('/opa?foo=bar1&foo=bar2'), { foo : [ 'bar1', 'bar2' ]});

        test.done();
    },

    '/opa with defaults' : function(test) {
        var route = Route({
            pattern : '/opa',
            defaults : {
                param : 'value'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), { param : 'value' });
        test.deepEqual(route.match('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param>' : function(test) {
        var route = Route({
            pattern : '/opa/<param>'
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa/value'), { param : 'value' });
        test.deepEqual(route.match('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with defaults' : function(test) {
        var route = Route({
            pattern : '/opa/<param>',
            defaults : {
                param : 'value3',
                param2  : 'value2'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa/value'), { param : 'value', param2 : 'value2' });
        test.deepEqual(route.match('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', param2 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with conditions like array' : function(test) {
        var route = Route({
            pattern : '/opa/<param>',
            conditions : {
                param : [ 'value1', 'value2', 'value3' ]
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa/opa'), null);
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with conditions like RegExp' : function(test) {
        var route = Route({
            pattern : '/opa/<param>',
            conditions : {
                param : 'value[0-9]'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa/opa'), null);
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/value1'), { param : 'value1' });
        test.deepEqual(route.match('/opa/valuea'), null);
        test.deepEqual(route.match('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>)' : function(test) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)'
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa'), {});
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/opapa/'), null);
        test.deepEqual(route.match('/opa/opapa/value'), { param : 'value' });
        test.deepEqual(route.match('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>) with defaults' : function(test) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)',
            defaults : {
                param : 'value'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa'), { param : 'value' });
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/opapa/'), null);
        test.deepEqual(route.match('/opa/opapa/value2'), { param : 'value2' });
        test.deepEqual(route.match('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>) with conditions and defaults' : function(test) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)',
            conditions : {
                param : 'value[0-9]'
            },
            defaults : {
                param : 'value1'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa'), { param : 'value1' });
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/opapa/'), null);
        test.deepEqual(route.match('/opa/opapa/value'), null);
        test.deepEqual(route.match('/opa/opapa/valuea'), null);
        test.deepEqual(route.match('/opa?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value3', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });
        test.deepEqual(route.match('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param1>(/opapa/<param2>(/<param3>))(/)' : function(test) {
        var route = Route({
            pattern : '/opa/<param1>(/opapa/<param2>(/<param3>))(/)',
            conditions : {
                param1 : 'value[0-2]',
                param2 : [ 'value5', 'value7' ],
                param3 : '[Vv]alue'
            },
            defaults : {
                param : 'value',
                param1 : 'value1'
            }
        });

        test.deepEqual(route.match('/opapa'), null);
        test.deepEqual(route.match('/opa/'), null);
        test.deepEqual(route.match('/opa/value'), null);
        test.deepEqual(route.match('/opa/value0'), { param : 'value', param1 : 'value0' });
        test.deepEqual(route.match('/opa/value0/'), { param : 'value', param1 : 'value0' });
        test.deepEqual(route.match('/opa/value2/opapa'), null);
        test.deepEqual(route.match('/opa/value2/opapa/value5'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        test.deepEqual(route.match('/opa/value2/opapa/value5/'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        test.deepEqual(route.match('/opa/value2/opapa/value5/dalue/'), null);
        test.deepEqual(route.match('/opa/value2/opapa/value5/Value'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        test.deepEqual(route.match('/opa/value2/opapa/value5/Value/'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        test.deepEqual(route.match('/opa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value3', param1 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    }

};
