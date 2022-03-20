import assert from 'assert';
import { describe, it } from 'mocha';
import { Vector3 } from '../src/math/vector';

describe('Vector3 tests', function () {
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

    it('square magnitude tests', function () {
        const vec1 = new Vector3(4, 3, 1);

        assert.strictEqual(vec1.squareMagnitude, 26, "Incorrect square magnitude");
        assert.strictEqual(Vector3.zero.squareMagnitude, 0, "Incorrect square magnitude for zero vector");
    });

    it('magnitude tests', function () {
        const vec1 = new Vector3(4, 3, 0);

        assert.strictEqual(vec1.magnitude, 5, "Incorrect magnitude");
        assert.strictEqual(Vector3.zero.magnitude, 0, "Incorrect magnitude for zero vector");
    });

    it('direction tests', function () {
        const vec1 = new Vector3(4, 3, 0);

        assert.deepStrictEqual(vec1.direction, new Vector3(0.8, 0.6, 0), "Incorrect direction");
        assert.deepStrictEqual(Vector3.zero.direction, Vector3.zero, "Incorrect direction for zero vector");
    });

    it('multiply and divide tests', function () {
        const vec1 = new Vector3(8, 14, 6);

        assert.deepStrictEqual(vec1.multiplyByScalar(5), new Vector3(40, 70, 30), "Incorrect result of scaling");
        assert.deepStrictEqual(vec1.multiplyByScalar(0), Vector3.zero, "Incorrect result of scaling by 0");

        assert.deepStrictEqual(vec1.divideByScalar(2), new Vector3(4, 7, 3), "Incorrect result of dividing by scalar");

        assert.throws(function () {
            vec1.divideByScalar(0);
        }, "Dividing by zero should throw error");
    });

    it('add, subtract, and negate tests', function () {
        const vec1 = new Vector3(9, 5, 3);
        const vec2 = new Vector3(8, 1, -1);

        assert.deepStrictEqual(vec1.add(vec2), new Vector3(17, 6, 2), "Incorrect sum of vectors");
        assert.deepStrictEqual(vec1.add(Vector3.zero), vec1, "Incorrect sum with zero vector");

        assert.deepStrictEqual(vec1.subtract(vec2), new Vector3(1, 4, 4), "Incorrect difference of vectors");
        assert.deepStrictEqual(vec1.subtract(Vector3.zero), vec1, "Incorrect difference with zero vector");

        assert.deepStrictEqual(vec1.negate(), new Vector3(-9, -5, -3), "Incorrect negation of vector");
    });
});