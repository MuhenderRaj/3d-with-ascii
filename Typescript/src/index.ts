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
        {
            position: new Vector3(0, 70, 60),
            rotation: Quaternion.fromEuler(Math.PI / 6, Math.PI, 0),
            scaling: new Vector3(1, 1, 1)
        },
        false,
        140,
        100,
        1,
        true,
        100,
        ['.', ',', ';', '0', '@']
    ));

    // Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI),

    env.addShape(await PolyShape.fromObj(
        "among us",
        {
            position: new Vector3(0, 0, 0),
            rotation: Quaternion.identity.multiply(Quaternion.fromEuler(0, Math.PI / 4, 0)),
            scaling: new Vector3(0.3, 0.3, 0.3)
        },
        false
    ));
    
    setInterval(() => {
        env.render();
        const rot = env.getShapes()[0].transform.rotation;
        env.getShapes()[0].transform.rotation = rot.multiply(Quaternion.fromEuler(0, 0.1, 0));
        console.log("Cool");
    }, 100);

    console.log("Cool");
}

main();