var Susanin = require('../../');

module.exports = {

    '"Susanin" must be function' : function(test) {
        test.ok(typeof Susanin === 'function');
        test.done();
    },

    '"Susanin" must be constructor' : function(test) {
        var susanin = new Susanin();

        test.ok(susanin instanceof Susanin);
        test.done();
    },

    '"Susanin" can be called without "new"' : function(test) {
        var susanin = Susanin();

        test.ok(susanin instanceof Susanin);
        test.done();
    }

};
