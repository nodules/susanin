var Susanin = require('../../');

module.exports = {

    setUp : function(callback) {
        var susanin = this.susanin = Susanin();

        susanin
            .addRoute({
                name : 'first',
                pattern : '/first'
            });

        susanin
            .addRoute({
                name : 'second',
                pattern : '/first(/<param>)',
                data : {
                    foo : 'bar'
                }
            });

        susanin.addRoute({
            name : 'third',
            pattern : '/first',
            data : {
                method : 'post'
            }
        });

        susanin.addRoute({
            name : 'fourth',
            pattern : '/fourth'
        });

        callback();
    },

    '"findFirst" method' : function(test) {
        var finded = this.susanin.findFirst('/first');

        test.strictEqual(finded[0], this.susanin.getRouteByName('first'));
        test.deepEqual(finded[1], {});
        test.strictEqual(this.susanin.findFirst({ path : '/first', method : 'post' })[0], this.susanin.getRouteByName('third'));
        test.strictEqual(this.susanin.findFirst('/f'), null);

        test.done();
    },

    '"find" method' : function(test) {
        var finded = this.susanin.find('/first');

        test.strictEqual(finded.length, 3);
        test.strictEqual(finded[0][0], this.susanin.getRouteByName('first'));
        test.strictEqual(finded[1][0], this.susanin.getRouteByName('second'));
        test.strictEqual(finded[2][0], this.susanin.getRouteByName('third'));
        test.deepEqual(finded[0][1], {});
        test.deepEqual(finded[1][1], {});
        test.deepEqual(finded[2][1], {});
        test.strictEqual(this.susanin.find({ path : '/first', method : 'post' })[0][0], this.susanin.getRouteByName('third'));
        test.deepEqual(this.susanin.find('/f'), []);

        test.done();
    }

};