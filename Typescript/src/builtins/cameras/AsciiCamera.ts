import { Canvas, createCanvas } from "canvas";
import { Environment } from "../../environment";
import { Quaternion } from "../../math/quaternion";
import { Vector3 } from "../../math/vector";
import { zip } from "../../util";
import { Camera } from "../interfaces";

/**
 * A camera that renders objects as ascii acharacters
 */
export class AsciiCamera implements Camera {
    public get viewingNormal(): Vector3 {
        return Vector3.forward.rotate(this.rotation);
    }

    /**
     * The horizontal vector of the screen in world space
     */
    public get horizontal(): Vector3 {
        return this.position.crossProduct(Vector3.up).direction;
    }

    /**
     * The vertical vector of the screen in world space
     */
    public get vertical(): Vector3 {
        return this.horizontal.crossProduct(this.viewingNormal).direction;
    }

    public constructor(
        public position: Vector3,
        public rotation: Quaternion,
        public scaling: Vector3,
        public hidden: boolean,
        public width: number,
        public height: number,
        public zoom: number,
        public perspective: boolean,
        public depth: number,
        public intensities: ReadonlyArray<string>) {

    }

    // /**
    //  * Clears the zBuffer by setting each entry to positive infinity
    //  */
    // private clearBuffer() {
    //     this.zBuffer.forEach(row => row.fill(Number.POSITIVE_INFINITY));
    // }


    public render(env: Environment): void {
        // this.clearBuffer();
        const zBuffer: ReadonlyArray<Array<number>> = new Array<number>(this.height)
            .map(row => new Array<number>(this.width).fill(Number.POSITIVE_INFINITY));
        
        const screen: ReadonlyArray<Array<string>> = new Array<string>(this.height)
            .map(row => new Array<string>(this.width).fill(this.intensities[0]));
        
        const canvas = env.getCanvas();
        
        const viewingNormal = this.viewingNormal;

        for (const shape of env.getShapes()) {
            if (shape.hidden) continue;

            for (const [triangle, normal] of zip(shape.triangleCoords, shape.normals)) {
                const cosViewingNormal = normal.dotProduct(viewingNormal.direction);

                if (this.perspective) {
                    // Face is facing away
                    if (triangle[0].subtract(this.position).dotProduct(normal) >= 0) 
                        continue
                } else { // Orthographic
                    // Face is facing away
                    if (cosViewingNormal <= 0) continue
                }

                this.renderTriangle(
                    this.intensities[Math.floor(cosViewingNormal * (this.intensities.length - 0.01))],
                    triangle,
                    normal,
                    zBuffer,
                    screen
                );
            }
        }

        this.drawOnCanvas(canvas, screen);
    }

    private drawOnCanvas(canvas: HTMLCanvasElement, screen: ReadonlyArray<Array<string>>): void {
        const text = screen.map(row => row.reduce((acc, val) => acc + val, ""))
            .reduce((acc, val) => acc + val + '\n', "")
            .trimEnd();
        
        canvas.getContext('2d')?.fillText(text, 0, 0);
    }

    private renderTriangle(
        character: string,
        triangle: readonly [Vector3, Vector3, Vector3],
        triangleNormal: Vector3,
        zBuffer: ReadonlyArray<Array<number>>,
        screen: ReadonlyArray<Array<string>>): void {

        const triangle2D = triangle.map(vertex => {
            return this.worldSpaceToScreenSpace(vertex);
        });

        const rectBounds = {
            minX: Math.min(...triangle2D.map(value => value[0])),
            minY: Math.min(...triangle2D.map(value => value[1])),
            maxX: Math.max(...triangle2D.map(value => value[0])),
            maxY: Math.max(...triangle2D.map(value => value[1])),
        };

        const depthNormal = this.viewingNormal.direction.multiplyByScalar(this.depth);
    
        for (let y = rectBounds.minY; y <= rectBounds.maxY; y++) {
            for (let x = rectBounds.minX; y <= rectBounds.maxX; x++) {
                if (!this.isInBounds([x, y])) continue;

                const vertexDistances = triangle2D.map(vertex => [x - vertex[0], y - vertex[1]]);

                const abChirality = vertexDistances[0][0] * vertexDistances[1][1]
                    - vertexDistances[1][0] * vertexDistances[0][1];
                const bcChirality = vertexDistances[1][0] * vertexDistances[2][1]
                    - vertexDistances[2][0] * vertexDistances[1][1];
                const caChirality = vertexDistances[2][0] * vertexDistances[0][1]
                    - vertexDistances[0][0] * vertexDistances[2][1];
                
                if (abChirality <= 0 && bcChirality <= 0 && caChirality <= 0
                    || abChirality >= 0 && bcChirality >= 0 && caChirality >= 0) {
                        
                    const u = x - this.width / 2;
                    const v = this.height / 2 - y;

                    const pointPointer = this.horizontal.multiplyByScalar(u)
                        .add(this.vertical.multiplyByScalar(v))
                        .add(depthNormal);
                    
                    const pointDistance = triangle[0].subtract(this.position).dotProduct(triangleNormal)
                        / pointPointer.direction.dotProduct(triangleNormal);
                    
                    if (pointDistance < zBuffer[y][x]) {
                        screen[y][x] = character;
                        zBuffer[y][x] = pointDistance;
                    }
                }
            }
        }
    }

    private worldSpaceToScreenSpace(point: Vector3): [number, number] {
        const viewingNormal = this.viewingNormal;

        // Basis vectors for the screen space
        const vecU = this.horizontal;
        const vecV = this.vertical;

        const pointPointer = point.subtract(this.position);

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

        return [this.width / 2 + this.zoom * u, this.height / 2 - this.zoom * v];
    }

    // /**
    //  * 
    //  * @param triangle an array of indeces of the three vertices of the triangle
    //  * @param vertices an array of coordinates of vertices indexed by the triangle indices
    //  * @returns an array of the triangle vertex coordinate vectors
    //  */
    // private triangleIndexToCoords(
    //     triangle: readonly [number, number, number],
    //     vertices: ReadonlyArray<readonly [number, number, number]>): [Vector3, Vector3, Vector3] {

    //     return triangle.map(index => Vector3.fromArray(vertices[index])) as [Vector3, Vector3, Vector3];
    // }

    private isInBounds(point: readonly [number, number]): boolean {
        const [x, y] = point;
        return 0 <= x && x < this.width && 0 <= y && y < this.height;
    }
}