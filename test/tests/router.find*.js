var Router = require('../router');

module.exports = {

    setUp : function(callback) {
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

        callback();
    },

    '"findFirst" method' : function(test) {
        var finded = this.router.findFirst('/first');

        test.strictEqual(finded[0], this.router.getRouteByName('first'));
        test.deepEqual(finded[1], {});
        test.strictEqual(this.router.findFirst({ path : '/first', method : 'post' })[0], this.router.getRouteByName('third'));
        test.strictEqual(this.router.findFirst('/f'), null);

        test.done();
    },

    '"find" method' : function(test) {
        var finded = this.router.find('/first');

        test.strictEqual(finded.length, 3);
        test.strictEqual(finded[0][0], this.router.getRouteByName('first'));
        test.strictEqual(finded[1][0], this.router.getRouteByName('second'));
        test.strictEqual(finded[2][0], this.router.getRouteByName('third'));
        test.deepEqual(finded[0][1], {});
        test.deepEqual(finded[1][1], {});
        test.deepEqual(finded[2][1], {});
        test.strictEqual(this.router.find({ path : '/first', method : 'post' })[0][0], this.router.getRouteByName('third'));
        test.deepEqual(this.router.find('/f'), []);

        test.done();
    }

};
