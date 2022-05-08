import { Vector3 } from './vector';

/**
 * A class representing an immutable quaternion object.
 */
export class Quaternion {
    public static readonly identity: Quaternion = new Quaternion(1, Vector3.zero);

    /// CREATORS ///

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

    /// QUATERNION SCALAR OPERATIONS ///

    /**
     * 
     * @param num the number to be multiplied to the quaternion
     * @returns a new quaternion with its components scaled by `number`
     */
    public multiplyByScalar(num: number): Quaternion { }

    /**
     * 
     * @param num the number to divide the quaternion by
     * @returns a new quaternion with its components divided by `number`
     * @throws Error if num is zero
     */
    public divideByScalar(num: number): Quaternion { }
    
    /// QUATERNION LINEAR OPERATIONS ///

    /**
     * 
     * @param other the other quaternion to add
     * @returns the sum of the quaternions `this` and `other` as a new quaternion
     */
    public add(other: Quaternion): Quaternion { }
    
    /**
     * 
     * @param other the other quaternion to subtract from `this`
     * @returns the difference of the quaternions `this` and `other` as a new quaternion
     */
    public subtract(other: Quaternion): Quaternion { }

    /**
     * @returns the negation of the components of `this` as a new quaternion
     */
    public negate(): Quaternion { }
    
    /// QUATERNION MULTIPLICATION AND DIVISION ///

    /**
     * 
     * @param other the other quaternion to compute the quaternion product
     * @returns the quaternion product `this`*`other`
     */
    public multiply(other: Quaternion): Quaternion { }
    
    /**
     * 
     * @param other the other quaternion to divide the quaternion by
     * @returns the quaternion division result of `this`/`other`
     * @throws Error if `other` is the zero quaternion
     */
    public divideBy(other: Quaternion): Quaternion { }
    
    /**
     * @returns a new quaternion that is the inverse of `this`, 
     *      such that this*this.inverse() = 1
     * @throws Error if `this` is the zero quaternion
     */
    public inverse(): Quaternion { }

    /// QUATERNION REPRESENTATION ///

    /**
     * @inheritdoc
     */
    public toString(): string { }
    
    /**
     * @returns an array of the components of the quaternion, in order real, i, j, k
     */
    public asArray(): [number, number, number, number] { }
    
    /**
     * @returns a record type of the axis and angle of rotation encoded by this quaternion
     */
    public asAxisAngle(): { axis: number, angle: number } { }
    
    /**
     * @returns the Euler angles associated with this quaternion as a record type
     */
    public asEuler(): { rotX: number, rotY: number, rotZ: number } { }
    
}