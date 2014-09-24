var Router = require('./lib/router'),
    assert = require('chai').assert;

module.exports = {

    setUp : function(done) {
        var router = this.router = Router();

        router
            .addRoute({
                name : 'first',
                pattern : '/first'
            });

        router
            .addRoute({
                name : 'second',
                pattern : '/first(/<param>)',
                data : {
                    foo : 'bar'
                }
            });

        router.addRoute({
            name : 'third',
            pattern : '/first',
            data : {
                method : 'post'
            }
        });

        router.addRoute({
            name : 'fourth',
            pattern : '/fourth'
        });

        done();
    },

    '`findFirst` method' : function(done) {
        var finded = this.router.findFirst('/first');

        assert.strictEqual(finded[0], this.router.getRouteByName('first'));
        assert.deepEqual(finded[1], {});
        assert.strictEqual(this.router.findFirst({ path : '/first', method : 'post' })[0], this.router.getRouteByName('third'));
        assert.strictEqual(this.router.findFirst('/f'), null);

        done();
    },

    '`find` method' : function(done) {
        var finded = this.router.find('/first');

        assert.strictEqual(finded.length, 3);
        assert.strictEqual(finded[0][0], this.router.getRouteByName('first'));
        assert.strictEqual(finded[1][0], this.router.getRouteByName('second'));
        assert.strictEqual(finded[2][0], this.router.getRouteByName('third'));
        assert.deepEqual(finded[0][1], {});
        assert.deepEqual(finded[1][1], {});
        assert.deepEqual(finded[2][1], {});
        assert.strictEqual(this.router.find({ path : '/first', method : 'post' })[0][0], this.router.getRouteByName('third'));
        assert.deepEqual(this.router.find('/f'), []);

        done();
    }

};
