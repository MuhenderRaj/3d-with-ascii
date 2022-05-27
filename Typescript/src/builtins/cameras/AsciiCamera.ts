import { Canvas } from "canvas";
import { Environment } from "../../environment";
import { Quaternion } from "../../math/quaternion";
import { Vector3 } from "../../math/vector";
import { Camera } from "../interfaces";

export class AsciiCamera implements Camera {
    private readonly zBuffer: Array<Array<number>>;

    public constructor(
        public position: Vector3,
        public rotation: Quaternion,
        public scaling: Vector3,
        public hidden: boolean,
        public width: number,
        public height: number,
        public zoom: number,
        public perspective: boolean,
        public depth: number) {
    
        this.zBuffer = new Array<number>(height)
            .map(el => new Array<number>(width).fill(Number.POSITIVE_INFINITY));
    }



    public render(env: Environment): HTMLCanvasElement {
        throw new Error("Method not implemented.");
    }

    
}