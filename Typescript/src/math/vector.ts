import { Quaternion } from "./quaternion";

/**
 * A class representing an immutable 3-dimensional vector.
 */
export class Vector3 {
    public static readonly left: Vector3 = new Vector3(1, 0, 0);
    public static readonly up: Vector3 = new Vector3(0, 1, 0);
    public static readonly forward: Vector3 = new Vector3(0, 0, 1);
    public static readonly zero: Vector3 = new Vector3(0, 0, 0);

    /**
     * Construct a new Vector3 object
     * 
     * @param x the x-component of the vector
     * @param y the y-component of the vector
     * @param z the z-component of the vector
     */
    public constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number) {
        
    }

    /// VECTOR PRODUCTS ///

    /**
     * 
     * @param other the other vector to compute the dot product
     * @returns the dot product of the vectors
     */
    public dotProduct(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    /**
     * 
     * @param other the other vector to compute the cross product
     * @returns the cross product of the vectors
     */
    public crossProduct(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    /**
     * 
     * @param other the other vector to compute the element-wise product
     * @returns the element-wise product of the vectors
     */
    public elementwiseProduct(other: Vector3) {
        return new Vector3(
            this.x * other.x,
            this.y * other.y,
            this.z * other.z
        );
    }

    /// VECTOR PROPERTIES ///

    /**
     * The squared magnitude of the vector
     */
    public get squareMagnitude(): number {
        return this.dotProduct(this);
    }
    /**
     * The magnitude of the vector
     */
    public get magnitude(): number {
        return Math.sqrt(this.squareMagnitude);
    }

    /**
     * The direction of the vector as a unit vector.
     * The zero vector if the vector is a zero vector.
     */
    public get direction(): Vector3 {
        const magnitude = this.magnitude;

        if (magnitude === 0) {
            return Vector3.zero;
        }

        return this.divideByScalar(magnitude);
    }


    /// SCALAR OPERATIONS ///

    /**
     * 
     * @param num the number to be multiplied to the vector
     * @returns a new vector with its components scaled by `number`
     */
    public multiplyByScalar(num: number): Vector3 {
        return new Vector3(this.x * num, this.y * num, this.z * num);
    }

    /**
     * 
     * @param num the numeber to divide the vector by
     * @returns a new vector with its components divided by `number`
     * @throws Error if num is zero
     */
    public divideByScalar(num: number): Vector3 {
        if (num === 0) {
            throw new Error("Attempted to divide by zero");
        }

        return new Vector3(this.x / num, this.y / num, this.z / num);
    }

    /// VECTOR LINEAR OPERATIONS ///

    /**
     * 
     * @param other the other vector to add
     * @returns the sum of the vectors `this` and `other` as a new vector
     */
    public add(other: Vector3): Vector3 {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    
    /**
     * 
     * @param other the vector to subtract from `this`
     * @returns the difference of the vectors `this` and `other` as a new vector
     */
    public subtract(other: Vector3): Vector3 {
        return this.add(other.negate());
    }

    /**
     * 
     * @returns the negation of the components of `this` as a new vector
     */
    public negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    /// QUATERNION OPERATIONS ///

    /**
     * 
     * @param quaternion the half-angle quaternion to rotate the vector by
     * @returns A new vector that is the rotated version of the original vector
     */
    public rotate(quaternion: Quaternion): Vector3 {
        return quaternion
            .multiply(new Quaternion(0, this))
            .multiply(quaternion.inverse())
            .vec;
    }

    /// VECTOR REPRESENTATION ///

    /**
     * @inheritdoc
     */
    public toString(): string {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }

    public static fromArray(array: readonly [number, number, number]): Vector3 {
        return new Vector3(array[0], array[1], array[2]);
    }

    /**
     * 
     * @returns an array of the components of the vector, in order x, y, z
     */
    public asArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}