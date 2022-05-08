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
});