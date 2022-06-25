import { Environment } from "./environment";
import { AsciiCamera } from "./builtins/cameras/AsciiCamera";
import { Vector3 } from "./math/vector";
import { Quaternion } from "./math/quaternion";
import { PolyShape } from "./builtins/shape";

/**
 * The main method of the program
 */
async function main(): Promise<void> {
    const env = Environment.getEnvironment();

    env.addCamera(new AsciiCamera(
        new Vector3(0, 40, 30),
        Quaternion.fromEuler(Math.PI / 6, Math.PI, 0),
        new Vector3(1, 1, 1),
        false,
        70,
        50,
        1,
        false,
        100,
        ['.', ',', ';', '0', '#', '@']
    ));

    // Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI),

    env.addShape(await PolyShape.fromObj(
        "among us",
        new Vector3(0, 0, 0),
        Quaternion.identity,
        new Vector3(0.3, 0.3, 0.3),
        false
    ));
    
    setInterval(() => {
        env.render();
        // const pos = env.getShapes()[0].position;
        // env.getShapes()[0].position = pos.add(Vector3.forward.multiplyByScalar(1));
        console.log("Cool");
    }, 1000);

    console.log("Cool");
}

main();