import { Environment } from "./environment";
import { AsciiCamera } from "./builtins/cameras/AsciiCamera";
import { Vector3 } from "./math/vector";
import { Quaternion } from "./math/quaternion";

/**
 * The main method of the program
 */
function main(): void {
    const env = Environment.getEnvironment();

    env.addCamera(new AsciiCamera(
        Vector3.zero,
        Quaternion.identity,
        new Vector3(1, 1, 1),
        false,
        256,
        256,
        1,
        false,
        1,
        ['.', ',', ';', 'o', '0', '#', '@']
    ));
    
    setInterval(() => {
        env.render();
        console.log("Cool");
    }, 1000);

    console.log("Cool");
}

main();