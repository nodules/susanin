var Route = require('../susanin.min.js').Route;

module.exports = {

    '/opa' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa'
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), {});
        test.deepEqual(route.parse('/opa?foo'), { foo : '' });
        test.deepEqual(route.parse('/opa?foo=bar'), { foo : 'bar' });
        test.deepEqual(route.parse('/opa?=bar'), { '' : 'bar' });
        test.deepEqual(route.parse('/opa?'), {});
        test.deepEqual(route.parse('/opa?foo=bar1&foo=bar2'), { foo : [ 'bar1', 'bar2' ]});

        test.done();
    },

    '/opa with defaults' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa',
            defaults : {
                param : 'value'
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), { param : 'value' });
        test.deepEqual(route.parse('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param>' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa/<param>'
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa/value'), { param : 'value' });
        test.deepEqual(route.parse('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with defaults' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa/<param>',
            defaults : {
                param : 'value3',
                param2  : 'value2'
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa/value'), { param : 'value', param2 : 'value2' });
        test.deepEqual(route.parse('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', param2 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with conditions like array' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa/<param>',
            conditions : {
                param : [ 'value1', 'value2', 'value3' ]
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa/opa'), null);
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param> with conditions like RegExp' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa/<param>',
            conditions : {
                param : 'value[0-9]'
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa/opa'), null);
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/value1'), { param : 'value1' });
        test.deepEqual(route.parse('/opa/valuea'), null);
        test.deepEqual(route.parse('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>)' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa(/opapa/<param>)'
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa'), {});
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/opapa/'), null);
        test.deepEqual(route.parse('/opa/opapa/value'), { param : 'value' });
        test.deepEqual(route.parse('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>) with defaults' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa(/opapa/<param>)',
            defaults : {
                param : 'value'
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa'), { param : 'value' });
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/opapa/'), null);
        test.deepEqual(route.parse('/opa/opapa/value2'), { param : 'value2' });
        test.deepEqual(route.parse('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa(/opapa/<param>) with conditions and defaults' : function(test) {
        var route = Route({
            name : 'opa',
            pattern : '/opa(/opapa/<param>)',
            conditions : {
                param : 'value[0-9]'
            },
            defaults : {
                param : 'value1'
            }
        });

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa'), { param : 'value1' });
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/opapa/'), null);
        test.deepEqual(route.parse('/opa/opapa/value'), null);
        test.deepEqual(route.parse('/opa/opapa/valuea'), null);
        test.deepEqual(route.parse('/opa?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });
        test.deepEqual(route.parse('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    },

    '/opa/<param1>(/opapa/<param2>(/<param3>))(/)' : function(test) {
        var route = Route({
            name : 'opa',
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

        test.deepEqual(route.parse('/opapa'), null);
        test.deepEqual(route.parse('/opa/'), null);
        test.deepEqual(route.parse('/opa/value'), null);
        test.deepEqual(route.parse('/opa/value0'), { param : 'value', param1 : 'value0' });
        test.deepEqual(route.parse('/opa/value0/'), { param : 'value', param1 : 'value0' });
        test.deepEqual(route.parse('/opa/value2/opapa'), null);
        test.deepEqual(route.parse('/opa/value2/opapa/value5'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        test.deepEqual(route.parse('/opa/value2/opapa/value5/'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        test.deepEqual(route.parse('/opa/value2/opapa/value5/dalue/'), null);
        test.deepEqual(route.parse('/opa/value2/opapa/value5/Value'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        test.deepEqual(route.parse('/opa/value2/opapa/value5/Value/'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        test.deepEqual(route.parse('/opa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', param1 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        test.done();
    }

};