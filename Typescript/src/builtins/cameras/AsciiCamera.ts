import { Environment } from "../../environment";
import { Quaternion } from "../../math/quaternion";
import { Vector3 } from "../../math/vector";
import { Camera, Transform } from "../interfaces";

/**
 * A camera that renders objects as ascii acharacters
 */
export class AsciiCamera implements Camera<string> {
    public get viewingNormal(): Vector3 {
        return Vector3.forward.rotate(this.transform.rotation);
    }

    /**
     * The horizontal vector of the screen in world space
     */
    public get horizontal(): Vector3 {
        return Vector3.left.negate().rotate(this.transform.rotation);
    }

    /**
     * The vertical vector of the screen in world space
     */
    public get vertical(): Vector3 {
        return Vector3.up.rotate(this.transform.rotation);
    }

    public constructor(
        public transform: Transform,
        public hidden: boolean,
        public width: number,
        public height: number,
        public zoom: number,
        public perspective: boolean,
        public depth: number,
        public intensities: ReadonlyArray<string>) {

    }


    public render(env: Environment): void {
        // this.clearBuffer();
        const zBuffer: Array<Array<number>> = [];
        const screen: Array<Array<string>> = [];

        for (let i = 0; i < this.height; i++) {
            const zRow = new Array<number>(this.width).fill(Number.POSITIVE_INFINITY);
            const screenRow = new Array<string>(this.width).fill(' ');
            zBuffer.push(zRow);
            screen.push(screenRow);
        }

        
        for (const shape of env.getShapes()) {
            if (shape.hidden) continue;
            
            shape.renderShape(this, screen, zBuffer);
        }
        
        const canvas = env.getCanvas();
        this.drawOnCanvas(canvas, screen);
    }

    private drawOnCanvas(canvas: HTMLCanvasElement, screen: ReadonlyArray<Array<string>>): void {
        const text = screen.map(row => row.reduce((acc, val) => acc + val, ""))
        const ctx = canvas.getContext('2d');
        if (ctx === null)
            return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = "10px monospace";
        const width = ctx.measureText(text[0]).width;

        for (let i = 0; i < text.length; i++) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 7 * i - 2, width, 7);
            ctx.fillStyle = "white";
            ctx.fillText(text[i], 0, 5 + 7 * i);
        }
    }


    public worldSpaceToScreenSpace(point: Vector3): [number, number] {
        const viewingNormal = this.viewingNormal;

        // Basis vectors for the screen space
        const vecU = this.horizontal;
        const vecV = this.vertical;

        const pointPointer = point.subtract(this.transform.position);

        const vecD = (this.perspective)
            // d = -depth*b_hat + (depth/(p-a).b_hat) * (p-a)
            ? viewingNormal.direction.negate().multiplyByScalar(this.depth)
                .add(pointPointer.multiplyByScalar(
                    this.depth / pointPointer.dotProduct(viewingNormal.direction)
                ))
            
            // d = (p-a) - (p-a).b_hat * b_hat
            : pointPointer.subtract(
                viewingNormal.direction.multiplyByScalar(
                    pointPointer.dotProduct(viewingNormal.direction)
                ));

        const screenPerpendicular = vecU.crossProduct(vecV);

        let u: number, v: number;

        if (Math.abs(screenPerpendicular.x) >= 1e-4) {
            u = vecD.crossProduct(vecV).x / screenPerpendicular.x;
            v = vecU.crossProduct(vecD).x / screenPerpendicular.x;
        }
        else if (Math.abs(screenPerpendicular.y) >= 1e-4) {
            u = vecD.crossProduct(vecV).y / screenPerpendicular.y;
            v = vecU.crossProduct(vecD).y / screenPerpendicular.y;
        }
        else {
            u = vecD.crossProduct(vecV).z / screenPerpendicular.z;
            v = vecU.crossProduct(vecD).z / screenPerpendicular.z;
        }


        return [Math.round(this.width / 2 + this.zoom * u), Math.round(this.height / 2 - this.zoom * v)];
    }


    public isInBounds(point: readonly [number, number]): boolean {
        const [x, y] = point;
        return 0 <= x && x < this.width && 0 <= y && y < this.height;
    }

    public intensityFunction(t: number): string {
        return this.intensities[Math.floor(t * (this.intensities.length-0.001))];
    }
}