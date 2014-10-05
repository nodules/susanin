var Route = require('./lib/router').Route,
    assert = require('chai').assert;

module.exports = {

    'preBuild is not a function' : function(done) {
        var route = Route({
            pattern : '/opa/<param>',
            preBuild : true
        });

        assert.deepEqual(route.build({ param : 'value' }), '/opa/value');

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

        assert.deepEqual(route.build({ param : 'value' }), '/opa/value?foo=bar');
        assert.deepEqual(route.build({ param : 'value1' }), '/opa/value2');
        assert.deepEqual(route.build({ param : 'value', foo : 'bar1' }), '/opa/value?foo=bar');

        done();
    }

};
