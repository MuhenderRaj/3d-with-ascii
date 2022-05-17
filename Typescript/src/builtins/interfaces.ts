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
}

export interface Camera extends Entity {
    width: number;
    height: number;
    zoom: number;
    perspective: boolean;
    depth: number;

    /**
     * Returns a canvas of the rendered view
     * 
     * @param env the environment the camera is in
     */
    render(env: Environment): Canvas;
}

export interface Light extends Entity {
    brightness: number;
    dropoffMultiplierFunction(distance: number): number;
}