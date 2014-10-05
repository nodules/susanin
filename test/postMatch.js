var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    'postMatch is not a function' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            postMatch : true
        });

        assert.deepEqual(route.match('/opa/value'), { param : 'value' });

        done();
    },

    '/opa/<param> with postMatch function' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            postMatch : function(params) {
                params.foo = 'bar';

                if (params.param === 'value1') {
                    return null;
                }

                if (params.param === 'value2') {
                    return;
                }

                if (params.param === 'value3') {
                    return 1;
                }

                if (params.param === 'value4') {
                    return 'a';
                }

                return params;
            }
        });

        assert.deepEqual(route.match('/opa'), null);
        assert.deepEqual(route.match('/opa/value'), { param : 'value', foo : 'bar' });
        assert.deepEqual(route.match('/opa/value1'), null);
        assert.deepEqual(route.match('/opa/value2'), null);
        assert.deepEqual(route.match('/opa/value3'), null);
        assert.deepEqual(route.match('/opa/value4'), null);
        assert.deepEqual(route.match('/opa/value?foo=bar1&foo1=bar2'),
            { param : 'value', foo1 : 'bar2', foo : 'bar' });

        done();
    }

};
