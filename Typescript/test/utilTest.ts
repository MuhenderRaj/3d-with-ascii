import assert from 'assert';
import { describe, it } from 'mocha';
import { zip } from '../src/util';

describe('util tests', function () {
    it('zip tests', function () {
        const res = zip([1, 2], [3, 4]);
        assert.deepStrictEqual(res[0], [1, 3]);
        assert.deepStrictEqual(res[1], [2, 4]);
        assert.strictEqual(res[2], undefined);

        const res2 = zip([1, 2], [3, 4, 5]);
        assert.deepStrictEqual(res2[0], [1, 3]);
        assert.deepStrictEqual(res2[1], [2, 4]);
        assert.strictEqual(res2[2], undefined);

        const res3 = zip([1, 2, 5, 6], [3, 4, 5]);
        assert.deepStrictEqual(res3[0], [1, 3]);
        assert.deepStrictEqual(res3[1], [2, 4]);
        assert.deepStrictEqual(res3[2], [5, 5]);
        assert.strictEqual(res3[3], undefined);
    });
});