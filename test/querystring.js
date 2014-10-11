/* global describe, it, assert, querystring */

describe('querystring module', function() {
    var qs = querystring,
        undef;

    it('route.parse()', function(done) {
        assert.deepEqual(qs.parse(), {});
        assert.deepEqual(qs.parse(null), {});
        assert.deepEqual(qs.parse(undef), {});
        assert.deepEqual(qs.parse(0), {});
        assert.deepEqual(qs.parse(1), {});
        assert.deepEqual(qs.parse({}), {});
        assert.deepEqual(qs.parse([]), {});
        assert.deepEqual(qs.parse(''), {});
        assert.deepEqual(qs.parse('='), { '' : '' });
        assert.deepEqual(qs.parse('bla'), { bla : '' });
        assert.deepEqual(qs.parse('bla=foo'), { bla : 'foo' });
        assert.deepEqual(qs.parse('bla=%%D1'), { bla : '%%D1' });
        assert.deepEqual(qs.parse('bla=%D1%84%D1%83'), { bla : 'фу' });
        assert.deepEqual(qs.parse('bla=%D1%84%D1%83+%D1%84%D1%83'), { bla : 'фу фу' });
        assert.deepEqual(qs.parse('bla=%D1%84%D1%83%20%D1%84%D1%83'), { bla : 'фу фу' });
        assert.deepEqual(qs.parse('bla=foo1&bla'), { bla : [ 'foo1', '' ] });
        assert.deepEqual(qs.parse('bla=foo1&bla='), { bla : [ 'foo1', '' ] });
        assert.deepEqual(qs.parse('bla=foo1&bla=foo2'), { bla : [ 'foo1', 'foo2' ] });
        assert.deepEqual(qs.parse('bla=foo1&bla=foo2&bla=foo3'), { bla : [ 'foo1', 'foo2', 'foo3' ] });
        assert.deepEqual(qs.parse('bla=foo&bla1=foo1'), { bla : 'foo', bla1 : 'foo1' });

        done();
    });

    it('route.stringify()', function(done) {
        assert.strictEqual(qs.stringify(), '');
        assert.strictEqual(qs.stringify(null), '');
        assert.strictEqual(qs.stringify(undef), '');
        assert.strictEqual(qs.stringify(0), '');
        assert.strictEqual(qs.stringify(1), '');
        assert.strictEqual(qs.stringify(''), '');
        assert.strictEqual(qs.stringify(''), '');
        assert.strictEqual(qs.stringify({ '' : '' }), '=');
        assert.strictEqual(qs.stringify({ bla : '' }), 'bla=');
        assert.strictEqual(qs.stringify({ bla : null }), 'bla=');
        assert.strictEqual(qs.stringify({ bla : undef }), 'bla=');
        assert.strictEqual(qs.stringify({ bla : 0 }), 'bla=0');
        assert.strictEqual(qs.stringify({ bla : 'foo' }), 'bla=foo');
        assert.strictEqual(qs.stringify({ bla : 'фу' }), 'bla=%D1%84%D1%83');
        assert.strictEqual(qs.stringify({ bla : [ 'foo1', '' ] }), 'bla=foo1&bla=');
        assert.strictEqual(qs.stringify({ bla : [ 'foo1', 'foo2' ] }), 'bla=foo1&bla=foo2');
        assert.strictEqual(qs.stringify({ bla : 'foo', bla1 : 'foo1' }), 'bla=foo&bla1=foo1');
        assert.strictEqual(qs.stringify({ bla : 'foo', bla1 : 'foo1' }), 'bla=foo&bla1=foo1');
        assert.strictEqual(qs.stringify([ 1, 2, 3 ]), '0=1&1=2&2=3');

        done();
    });

});
