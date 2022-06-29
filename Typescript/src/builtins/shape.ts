import { Quaternion } from '../math/quaternion';
import { Vector3 } from '../math/vector';
import { zip } from '../util';
import { Camera, PixelType, Shape, Transform } from './interfaces';

/**
 * A shape with triangular polygonal faces
 */
export class PolyShape implements Shape {
    public get normals(): Array<Vector3> {
        const normals: Array<Vector3> = [];

        for (const triangle of this.triangleCoords) {
            const normal = triangle[1].subtract(triangle[0])
                .crossProduct(triangle[2].subtract(triangle[0])).direction;
            
            normals.push(normal);
        }

        return normals;
    }

    public get triangleCoords(): Array<readonly [Vector3, Vector3, Vector3]> {
        const returnValue: Array<readonly [Vector3, Vector3, Vector3]> = [];

        for (const triangle of this.triangles) {
            const coordinates = triangle.map(index => new Vector3(...this.vertices[index]))
                    .map(vertex => vertex.elementwiseProduct(this.transform.scaling)
                        .rotate(this.transform.rotation)
                        .add(this.transform.position)
                    ) as [Vector3, Vector3, Vector3];
            
            returnValue.push(coordinates);
        }

        return returnValue;
    }

    public renderShape(camera: Camera<PixelType>, screen: readonly number[][], zBuffer: readonly number[][]): void {
        for (const [triangle, normal] of zip(this.triangleCoords, this.normals)) {
            const cosViewingNormal = -normal.dotProduct(camera.viewingNormal.direction);
            
            if (camera.perspective) {
                // Face is facing away
                if (triangle[0].subtract(camera.transform.position).dotProduct(normal) >= 0)
                    continue;   
            }  // Orthographic
            // Face is facing away
            if (cosViewingNormal <= 0) continue;

            PolyShape.renderTriangle(
                cosViewingNormal,
                triangle,
                normal,
                zBuffer,
                screen,
                camera,
            );
        }
    }

    private static renderTriangle(
        pixelIntensity: number,
        triangle: readonly [Vector3, Vector3, Vector3],
        triangleNormal: Vector3,
        zBuffer: ReadonlyArray<Array<number>>,
        screen: ReadonlyArray<Array<number>>,
        camera: Camera<PixelType>): void {
        
        const triangle2D = triangle.map(vertex => camera.worldSpaceToScreenSpace(vertex));

        const rectBounds = {
            minX: Math.min(...triangle2D.map(value => value[0])),
            minY: Math.min(...triangle2D.map(value => value[1])),
            maxX: Math.max(...triangle2D.map(value => value[0])),
            maxY: Math.max(...triangle2D.map(value => value[1])),
        };

        const depthNormal = camera.viewingNormal.direction.multiplyByScalar(camera.depth);

        for (let y = rectBounds.minY; y <= rectBounds.maxY; y++) {
            for (let x = rectBounds.minX; x <= rectBounds.maxX; x++) {
                if (!camera.isInBounds([x, y])) continue;

                const vertexDistances = triangle2D.map(vertex => [x - vertex[0], y - vertex[1]]);

                const abChirality = vertexDistances[0][0] * vertexDistances[1][1]
                    - vertexDistances[1][0] * vertexDistances[0][1];
                const bcChirality = vertexDistances[1][0] * vertexDistances[2][1]
                    - vertexDistances[2][0] * vertexDistances[1][1];
                const caChirality = vertexDistances[2][0] * vertexDistances[0][1]
                    - vertexDistances[0][0] * vertexDistances[2][1];
                
                if (abChirality <= 0 && bcChirality <= 0 && caChirality <= 0
                    || abChirality >= 0 && bcChirality >= 0 && caChirality >= 0) {
                    
                    const u = Math.round(x - camera.width / 2);
                    const v = Math.round(camera.height / 2 - y);
                    
                    const pointPointer = camera.horizontal.multiplyByScalar(u)
                        .add(camera.vertical.multiplyByScalar(v))
                        .add(depthNormal);
                    
                    const pointDistance = triangle[0].subtract(camera.transform.position).dotProduct(triangleNormal)
                        / pointPointer.direction.dotProduct(triangleNormal);
                    
                    if (pointDistance < zBuffer[y][x]) {
                        screen[y][x] = pixelIntensity;
                        zBuffer[y][x] = pointDistance;
                    }
                }
            }
        }
    }

    // Creators

    public constructor(
        public name: string,
        public transform: Transform,
        public hidden: boolean,
        public vertices: Array<readonly [number, number, number]>,
        public triangles: Array<readonly [number, number, number]>
    ) {

    }

    public static async fromObj(
        filename: string,
        name: string,
        transform: Transform,
        hidden: boolean
    ): Promise<PolyShape> {
        const vertices: Array<readonly [number, number, number]> = [];
        const triangles: Array<readonly [number, number, number]> = [];
        
        const file = await fetch(`/shapes/${filename}.obj`);
        const contents = await file.text();
        const lines = contents.split(/\r?\n/);
        for (const line of lines) {
            const rawLine = line.trim();
            const tokens = rawLine.split(/\s+/).filter(token => token !== "");

            if (tokens.length === 0) continue;
            
            switch (tokens[0]) {
                case "#":
                    continue;

                case 'v':
                    vertices.push([Number(tokens[1]), Number(tokens[2]), Number(tokens[3])]);
                    break;
                
                case 'f':
                    const faceIndices = tokens.splice(1).map(token => Number(token.split("/")[0]));

                    if (faceIndices.length === 3) {
                        const [first, second, third] = faceIndices;

                        triangles.push([first - 1, second - 1, third - 1]);
                    } else if (faceIndices.length === 4) {
                        const [first, second, third, fourth] = faceIndices;
                        triangles.push([first - 1, second - 1, third - 1]);
                        triangles.push([third - 1, fourth - 1, first - 1]);
                    }
                    break;
                
                default:
                    //console.log("ignored line " + line + " with token " + tokens[0]);
            }
        }

        return new PolyShape(name, transform, hidden, vertices, triangles);
    }
}

