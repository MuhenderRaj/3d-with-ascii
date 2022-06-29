import { Environment } from "./environment";
import { AsciiCamera } from "./builtins/cameras/AsciiCamera";
import { Vector3 } from "./math/vector";
import { Quaternion } from "./math/quaternion";
import { PolyShape } from "./builtins/shape";

const env = Environment.getEnvironment();


let mouseClickedX: number, mouseClickedY: number;

let initialCameraPosition: Vector3;
let initialCameraRotation: Quaternion;
let panning = false, rotating = false;

/**
 * The main method of the program
 */
async function main(): Promise<void> {
    await initScene();
    setInterval(mainLoop, 100);
}

async function initScene(): Promise<void> {
    env.getCanvas().height = document.body.clientHeight;

    env.addCamera(new AsciiCamera(
        "main camera",
        {
            position: new Vector3(0, 70, 60),
            rotation: Quaternion.fromEuler(Math.PI / 6, Math.PI, 0),
            scaling: new Vector3(1, 1, 1)
        },
        false,
        190,
        109,
        1,
        true,
        100,
        ['.', ',', ';', '0', '@'],
        4
    ));

    // Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI),

    env.addShape(await PolyShape.fromObj(
        "among us",
        "among us",
        {
            position: new Vector3(-20, 0, 0),
            rotation: Quaternion.identity.multiply(Quaternion.fromEuler(0, Math.PI / 4, 0)),
            scaling: new Vector3(0.3, 0.3, 0.3)
        },
        false
    ));

    env.addShape(await PolyShape.fromObj(
        "cube",
        "cube",
        {
            position: new Vector3(50, 0, 0),
            rotation: Quaternion.identity,
            scaling: new Vector3(15, 10, 15)
        },
        false
    ));

    env.addShape(await PolyShape.fromObj(
        "teapot",
        "teapot",
        {
            position: new Vector3(50, 12, 0),
            rotation: Quaternion.identity,
            scaling: new Vector3(8, 8, 8)
        },
        false
    ));


    env.getCanvas().addEventListener('wheel', zoom);

    env.getCanvas().addEventListener('mousedown', (ev) => { 
        [mouseClickedX, mouseClickedY] = [ev.offsetX, ev.offsetY];
        initialCameraPosition = env.getMainCamera().transform.position;
        initialCameraRotation = env.getMainCamera().transform.rotation;

        if (ev.altKey) {
            if (ev.ctrlKey) {
                panning = true;
            } else {
                rotating = true;
            }
        } 

    });
    
    env.getCanvas().addEventListener('mousemove', (ev) => { 
        const [mouseX, mouseY] = [ev.offsetX, ev.offsetY];
        const deltaX = mouseX - mouseClickedX;
        const deltaY = mouseY - mouseClickedY;
        const deltaR = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const camera = env.getMainCamera();
        const cameraTransform = camera.transform;
        if (panning) {
            cameraTransform.position = initialCameraPosition.subtract(camera.horizontal.multiplyByScalar(deltaX*0.1))
                .subtract(camera.vertical.multiplyByScalar(-deltaY*0.1));
        } else if (rotating) {

        }
    });

    env.getCanvas().addEventListener('mouseup', (ev) => {
        panning = false;
        rotating = false;
    });
}

function zoom(ev: WheelEvent) {
    ev.preventDefault();
    env.getMainCamera().zoom += ev.deltaY * 0.001;
}

function mainLoop(): void {
    env.render();
    const rot = env.getShapes()[0].transform.rotation;
    env.getShapes()[0].transform.rotation = rot.multiply(Quaternion.fromEuler(0, 0.1, 0));
}

main();