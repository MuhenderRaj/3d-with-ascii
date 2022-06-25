import { Quaternion } from '../math/quaternion';
import { Vector3 } from '../math/vector';
import { Shape } from './interfaces';

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
                    .map(vertex => vertex.elementwiseProduct(this.scaling)
                        .rotate(this.rotation)
                        .add(this.position)
                    ) as [Vector3, Vector3, Vector3];
            
            returnValue.push(coordinates);
        }

        return returnValue;
    }

    public constructor(
        public position: Vector3,
        public rotation: Quaternion,
        public scaling: Vector3,
        public hidden: boolean,
        public vertices: Array<readonly [number, number, number]>,
        public triangles: Array<readonly [number, number, number]>
    ) {
        console.log(this);
    }

    public static async fromObj(
        filename: string,
        position: Vector3,
        rotation: Quaternion,
        scaling: Vector3,
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

        return new PolyShape(position, rotation, scaling, hidden, vertices, triangles);
    }
}