import assert from 'assert';

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
}