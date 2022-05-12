import assert from 'assert';
import { describe, it } from 'mocha';
import { Quaternion } from '../src/math/quaternion';
import { Vector3 } from '../src/math/vector';

function checkQuaternionEquality(q1: Quaternion, q2: Quaternion) {
    return (floatsAreEqual(q1.real, q2.real)
        && floatsAreEqual(q1.vec.x, q2.vec.x)
        && floatsAreEqual(q1.vec.y, q2.vec.y)
        && floatsAreEqual(q1.vec.z, q2.vec.z));
}

function floatsAreEqual(f1: number, f2: number) {
    return Math.abs(f1 - f2) < 1e-10;
}

describe('Quaternion tests', function () {
    it('fromAxisAngle tests', function () {
        const q = Quaternion.fromAxisAngle(new Vector3(1, 0, 0), Math.PI);

        assert(checkQuaternionEquality(q, new Quaternion(0, new Vector3(1, 0, 0))), "Wrong quaternion");
    });

    it('fromEuler tests', function () {
        const q_x = Quaternion.fromEuler(Math.PI, 0, 0);
        const q_y = Quaternion.fromEuler(0, Math.PI, 0);
        const q_z = Quaternion.fromEuler(0, 0, Math.PI);
        const q = Quaternion.fromEuler(Math.PI, Math.PI, Math.PI);

        assert(checkQuaternionEquality(q_x, new Quaternion(0, Vector3.left)), "Wrong quaternion");
        assert(checkQuaternionEquality(q_y, new Quaternion(0, Vector3.up)), "Wrong quaternion");
        assert(checkQuaternionEquality(q_z, new Quaternion(0, Vector3.forward)), "Wrong quaternion");
        assert(checkQuaternionEquality(q, new Quaternion(1, Vector3.zero)), "Wrong quaternion");
    });

    it('multiply and divide tests', function () {
        const q1 = new Quaternion(2, new Vector3(0, 0, 0));
        const q2 = new Quaternion(0, new Vector3(0, 2, 3));

        assert(checkQuaternionEquality(q1.multiply(q2), new Quaternion(0, new Vector3(0, 4, 6))), "Incorrect result of multiplication");
        assert(checkQuaternionEquality(q2.multiplyByScalar(3), new Quaternion(0, new Vector3(0, 6, 9))), "Incorrect result of multiplication by scalar");
        assert(checkQuaternionEquality(q1.multiply(new Quaternion(0, Vector3.zero)) , new Quaternion(0, Vector3.zero)), "Incorrect result of multiplying by 0");

        assert(checkQuaternionEquality(q2.divideByScalar(2), new Quaternion(0, new Vector3(0, 1, 1.5))), "Incorrect result of dividing by scalar");
        assert(checkQuaternionEquality(q2.divideBy(new Quaternion(0, new Vector3(1, 0, 0))), new Quaternion(0, new Vector3(0, -3, 2))), "Incorrect result of dividing by quaternion");

        assert.throws(function () {
            q1.divideByScalar(0);
        }, "Dividing by zero should throw error");

        assert.throws(function () {
            q1.divideBy(new Quaternion(0, Vector3.zero));
        }, "Dividing by zero should throw error");
    });

    it('add, subtract, and negate tests', function () {
        const q1 = new Quaternion(4, new Vector3(9, 5, 3));
        const q2 = new Quaternion(4, new Vector3(8, 1, -1));

        assert(checkQuaternionEquality(q1.add(q2), new Quaternion(8, new Vector3(17, 6, 2))), "Incorrect sum of quaternions");
        assert(checkQuaternionEquality(q1.add(new Quaternion(0, Vector3.zero)), q1), "Incorrect sum with zero quaternion");

        assert(checkQuaternionEquality(q1.subtract(q2), new Quaternion(0, new Vector3(1, 4, 4))), "Incorrect difference of quaternions");
        assert(checkQuaternionEquality(q1.subtract(new Quaternion(0, Vector3.zero)), q1), "Incorrect difference with zero quaternion");

        assert(checkQuaternionEquality(q1.negate(), new Quaternion(-4, new Vector3(-9, -5, -3))), "Incorrect negation of quaternion");
    });
});