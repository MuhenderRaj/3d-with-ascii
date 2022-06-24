import { Vector3 } from '../math/vector';
import { Quaternion } from '../math/quaternion';
import { Canvas } from 'canvas';
import { Environment } from '../environment';

export interface Entity {
    position: Vector3;
    rotation: Quaternion;
    scaling: Vector3;
    hidden: boolean;
}

export interface Shape extends Entity {
    vertices: Array<readonly [number, number, number]>;
    triangles: Array<readonly [number, number, number]>;
    normals: Array<Vector3>;

    /**
     * The absolute coordinates of the vertices of the triangle in 
     * world space
     */
    triangleCoords: Array<readonly [Vector3, Vector3, Vector3]>;
}

export interface Camera extends Entity {
    width: number;
    height: number;
    zoom: number;
    perspective: boolean;
    depth: number;

    /**
     * Modifies the canvas with the rendered view
     */
    render(env: Environment): void;
}

export interface Light extends Entity {
    brightness: number;
    dropoffMultiplierFunction(distance: number): number;
}