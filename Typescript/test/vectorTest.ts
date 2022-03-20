import assert from 'assert';
import { describe, it } from 'mocha';
import { Vector3 } from '../src/math/vector';

describe('Vector3 tests', function() {
    it('dot product tests', function () {
        const vec1 = new Vector3(2, 3, 4);
        const vec2 = new Vector3(2, 3, 4);

        assert.strictEqual(vec1.dotProduct(vec2), 29, "Incorrect dot product");
        assert.strictEqual(vec1.dotProduct(Vector3.zero), 0, "Incorrect dot product");
    });

    it('cross product tests', function () {
        const vec1 = new Vector3(2, 3, 4);

        assert.deepStrictEqual(vec1.crossProduct(vec1), Vector3.zero, "Incorrect cross product");
        assert.deepStrictEqual(vec1.crossProduct(Vector3.zero), Vector3.zero, "Incorrect cross product");
        assert.deepStrictEqual(vec1.crossProduct(Vector3.left), new Vector3(0, 4, -3), "Incorrect cross product");
        assert.deepStrictEqual(Vector3.left.crossProduct(vec1), new Vector3(0, -4, 3), "Incorrect cross product");
    });

    it('element-wise product tests', function () {
        const vec1 = new Vector3(2, 3, 4);
        const vec2 = new Vector3(4, 3, -1);

        assert.deepStrictEqual(vec1.elementwiseProduct(vec1), new Vector3(4, 9, 16), "Incorrect element-wise product");
        assert.deepStrictEqual(vec1.elementwiseProduct(Vector3.zero), Vector3.zero, "Incorrect element-wise product");
        assert.deepStrictEqual(vec1.elementwiseProduct(Vector3.left), new Vector3(2, 0, 0), "Incorrect element-wise product");
        assert.deepStrictEqual(vec1.elementwiseProduct(vec2), new Vector3(8, 9, -4), "Incorrect element-wise product");
    });
});