/* global describe, it, Router, assert */

describe('isTrailingSlashOptional option', function() {
    var Route = Router.Route;

    it('isTrailingSlashOptional is true by default => trailing slash is not necessary', function(done) {
        var route1 = Route('/opa'),
            route2 = Route('/opa/<param>'),
            route3 = Route('/opa(/<param>)'),
            route4 = Route('/opa/(<param>)'),
            route5 = Route({
                pattern : '/opa/<param>',
                conditions : {
                    param : '[\\w\/]+'
                }
            });

        assert.deepEqual(route1.match('/opa'), {});
        assert.deepEqual(route1.match('/opa/'), {});
        assert.deepEqual(route1.match('/opa//'), null);

        assert.deepEqual(route2.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route2.match('/opa/value/'), { param : 'value' });
        assert.deepEqual(route2.match('/opa/value//'), null);

        assert.deepEqual(route3.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route3.match('/opa/value/'), { param : 'value' });
        assert.deepEqual(route3.match('/opa/value//'), null);
        assert.deepEqual(route3.match('/opa/'), {});
        assert.deepEqual(route3.match('/opa'), {});
        assert.deepEqual(route3.match('/opa//'), null);

        assert.deepEqual(route4.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route4.match('/opa/value/'), { param : 'value' });
        assert.deepEqual(route4.match('/opa/value//'), null);
        assert.deepEqual(route4.match('/opa/'), {});
        assert.deepEqual(route4.match('/opa'), null);
        assert.deepEqual(route4.match('/opa//'), null);

        assert.deepEqual(route5.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route5.match('/opa/value/'), { param : 'value/' });
        assert.deepEqual(route5.match('/opa/value//'), { param : 'value//' });
        assert.deepEqual(route5.match('/opa/'), null);

        done();
    });

    it('isTrailingSlashOptional === false', function(done) {
        var route1 = Route({ pattern : '/opa', isTrailingSlashOptional : false }),
            route2 = Route({ pattern : '/opa/<param>', isTrailingSlashOptional : false }),
            route3 = Route({ pattern : '/opa/<param>(/)', isTrailingSlashOptional : false });

        assert.deepEqual(route1.match('/opa'), {});
        assert.deepEqual(route1.match('/opa/'), null);

        assert.deepEqual(route2.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route2.match('/opa/value/'), null);

        assert.deepEqual(route3.match('/opa/value'), { param : 'value' });
        assert.deepEqual(route3.match('/opa/value/'), { param : 'value' });

        done();
    });

});
