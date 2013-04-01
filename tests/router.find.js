var Router = require('../susanin.min.js');

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
                pattern : '/firsttt'
            });

        router.addRoute({
            name : 'third',
            pattern : '/first',
            method : 'post'
        });

        router.addRoute({
            name : 'fourth',
            pattern : '/fourth'
        });

        callback();
    },

    '"find" method must return array' : function(test) {
        var finded = this.router.find('/first');

        test.strictEqual(finded[0], this.router.getRouteByName('first'));
        test.deepEqual(finded[1], {});
        test.strictEqual(this.router.find('/first', 'post')[0], this.router.getRouteByName('third'));
        test.strictEqual(this.router.find('/f'), null);

        test.done();
    }

};