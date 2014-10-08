var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    'route.match(undefined)' : function(done) {
        var route = Route('/opa'),
            undef;

        assert.deepEqual(route.match(undef), null);

        done();
    },

    'route.match() with /opa' : function(done) {
        var route = Route('/opa');

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), {});
        assert.deepEqual(route.match('/opa?foo'), { foo : '' });
        assert.deepEqual(route.match('/opa?foo=bar'), { foo : 'bar' });
        assert.deepEqual(route.match('/opa?=bar'), { '' : 'bar' });
        assert.deepEqual(route.match('/opa?'), {});
        assert.deepEqual(route.match('/opa?foo=bar1&foo=bar2'), { foo : [ 'bar1', 'bar2' ] });

        done();
    },

    'route.match() with /opa with defaults' : function(done) {
        var route = Route({
            pattern : '/opa',
            defaults : {
                param : 'value'
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), { param : 'value' });
        assert.deepEqual(route.match('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa/<param>' : function(done) {
        var route = Route({
            pattern : '/opa/<param>'
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), null);
        assert.deepEqual(route.match('/opa/'), null);
        assert.deepEqual(route.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route.match('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa/<param> and defaults' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            defaults : {
                param : 'value3',
                param2  : 'value2'
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), null);
        assert.deepEqual(route.match('/opa/'), null);
        assert.deepEqual(route.match('/opa/value'), { param : 'value', param2 : 'value2' });
        assert.deepEqual(route.match('/opa/value?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', param2 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa/<param> and conditions like array' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            conditions : {
                param : [ 'value1', 'value2', 'value3' ]
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), null);
        assert.deepEqual(route.match('/opa/'), null);
        assert.deepEqual(route.match('/opa/opa'), null);
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa/<param> and conditions like RegExp' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            conditions : {
                param : 'value[0-9]'
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa'), null);
        assert.deepEqual(route.match('/opa/'), null);
        assert.deepEqual(route.match('/opa/opa'), null);
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/value1'), { param : 'value1' });
        assert.deepEqual(route.match('/opa/valuea'), null);
        assert.deepEqual(route.match('/opa/value1?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa(/opapa/<param>)' : function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)'
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa/'), {});
        assert.deepEqual(route.match('/opa'), {});
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/opapa/'), null);
        assert.deepEqual(route.match('/opa/opapa/value'), { param : 'value' });
        assert.deepEqual(route.match('/opa?foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa(/opapa/<param>) and defaults' : function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)',
            defaults : {
                param : 'value'
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa/'), { param : 'value' });
        assert.deepEqual(route.match('/opa'), { param : 'value' });
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/opapa/'), null);
        assert.deepEqual(route.match('/opa/opapa/value2'), { param : 'value2' });
        assert.deepEqual(route.match('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa(/opapa/<param>), conditions and defaults' : function(done) {
        var route = Route({
            pattern : '/opa(/opapa/<param>)',
            conditions : {
                param : 'value[0-9]'
            },
            defaults : {
                param : 'value1'
            }
        });

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa/'), { param : 'value1' });
        assert.deepEqual(route.match('/opa'), { param : 'value1' });
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/opapa/'), null);
        assert.deepEqual(route.match('/opa/opapa/value'), null);
        assert.deepEqual(route.match('/opa/opapa/valuea'), null);
        assert.deepEqual(route.match('/opa?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value1', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });
        assert.deepEqual(route.match('/opa/opapa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    },

    'route.match() with /opa/<param1>(/opapa/<param2>(/<param3>))(/)' : function(done) {
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

        assert.deepEqual(route.match('/opapa'), null);
        assert.deepEqual(route.match('/opa/'), null);
        assert.deepEqual(route.match('/opa/value'), null);
        assert.deepEqual(route.match('/opa/value0'), { param : 'value', param1 : 'value0' });
        assert.deepEqual(route.match('/opa/value0/'), { param : 'value', param1 : 'value0' });
        assert.deepEqual(route.match('/opa/value2/opapa'), null);
        assert.deepEqual(route.match('/opa/value2/opapa/value5'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        assert.deepEqual(route.match('/opa/value2/opapa/value5/'),
            { param : 'value', param1 : 'value2', param2 : 'value5' });
        assert.deepEqual(route.match('/opa/value2/opapa/value5/dalue/'), null);
        assert.deepEqual(route.match('/opa/value2/opapa/value5/Value'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        assert.deepEqual(route.match('/opa/value2/opapa/value5/Value/'),
            { param : 'value', param1 : 'value2', param2 : 'value5', param3 : 'Value' });
        assert.deepEqual(route.match('/opa/value2?param=value3&foo1=bar1&foo1=bar2&foo2=&=bar3'),
            { param : 'value', param1 : 'value2', foo1 : [ 'bar1', 'bar2' ], foo2 : '', '' : 'bar3' });

        done();
    }

};
