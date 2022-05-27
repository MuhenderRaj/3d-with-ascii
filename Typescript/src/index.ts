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
        1
    ));
    
    setInterval(() => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        const img = env.render();
        ctx?.drawImage(img, img.width, img.height);
        console.log("Cool");
    }, 1000);

    console.log("Cool");
}

main();