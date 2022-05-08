import { Vector3 } from './vector';

/**
 * A class representing an immutable quaternion object.
 */
export class Quaternion {
    public static readonly identity: Quaternion = new Quaternion(1, Vector3.zero);

    /**
     * Construct a new Quaternion object
     * 
     * @param real the real part of the quaternion
     * @param vec the vector part of the quaternion
     */
    public constructor(
        public readonly real: number, 
        public readonly vec: Vector3) {

    }

    /**
     * 
     * @param rotX the rotation about the x axis in radians
     * @param rotY the rotation about the y axis in radians
     * @param rotZ the rotation about the z axis in radians
     * @returns a new quaternion encoding the rotation about the z axis, 
     *          then x axis, then y axis by the specified amounts
     */
    public static fromEuler(rotX: number, rotY: number, rotZ: number): Quaternion {
        throw new Error("Not implemented yet!");
    }

    /**
     * 
     * @param axis the axis of rotation. The rotation is determined by the right hand rule
     * @param angle the angle in radians by which to rotate
     * @returns a new quaternion encoding the rotation about `axis` by `angle`
     */
    public static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
        const realPart = Math.cos(angle / 2);
        const vectorMagnitude = Math.abs(Math.sin(angle / 2));

        const vectorPart = axis.direction.multiplyByScalar(vectorMagnitude);

        return new Quaternion(realPart, vectorPart);
    }


}