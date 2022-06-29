import { Vector3 } from '../math/vector';
import { Quaternion } from '../math/quaternion';
import { Environment } from '../environment';

export type PixelType = number | [number, number, number] | string;


export interface Transform {
    position: Vector3;
    rotation: Quaternion;
    scaling: Vector3;
}

export interface Entity {
    name: string
    transform: Transform;
    hidden: boolean;

    // attributes: Array<Attribute>;
}

export interface Attribute {
    entity: Entity;
}

export interface Shape extends Entity {

    // TODO: Maybe some rendering-related attributes??

    /**
     * 
     * @param camera the camera object
     * @param screen the array which is mutated by the rendering of this shape
     * @param zBuffer the buffer of already existing pixel distances from the camera
     */
    renderShape(camera: Camera<PixelType>, screen: readonly number[][], zBuffer: readonly number[][]): void;
}


export interface Camera<PixelType> extends Entity {
    width: number;
    height: number;
    zoom: number;
    perspective: boolean;
    depth: number;

    viewingNormal: Vector3;
    horizontal: Vector3;
    vertical: Vector3;

    /**
     * 
     * @param point the point in world space coordinates
     * @returns the same point in screen space coordinates
     */
    worldSpaceToScreenSpace(point: Vector3): [number, number];
    
    /**
     * 
     * @param point the point to check against the screen
     * @returns true if the point is within the bounds of the screen
     */
    isInBounds(point: [number, number]): boolean;

    intensityFunction(t: number): PixelType;

    /**
     * Modifies the canvas with the rendered view
     */
    render(env: Environment): void;
}

export interface Light extends Entity {
    brightness: number;
    dropoffMultiplierFunction(distance: number): number;
}

export interface Behavior extends Attribute {
    /**
     * The current time as a number
     */
    timestamp: number;

    /**
     * Called when the script starts
     */
    start(): void;

    /**
     * Called every loop update iteration
     */
    update(): void;
}