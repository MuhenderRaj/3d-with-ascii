import { Environment } from "./environment";
import { AsciiCamera } from "./builtins/cameras/AsciiCamera";
import { Vector3 } from "./math/vector";
import { Quaternion } from "./math/quaternion";
import { PolyShape } from "./builtins/shape";

const env = Environment.getEnvironment();

const cameraControls = {
    mouseClickedX: NaN,
    mouseClickedY: NaN,
    initialCameraPosition: Vector3.zero,
    initialCameraRotation: Quaternion.identity,
    initialCameraHorizontal: Vector3.zero,
    initialCameraVertical: Vector3.zero,
    cameraFocusPoint: Vector3.zero,
    
    panning: false,
    rotating: false
}
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
            position: new Vector3(0, 0, 5),
            rotation: Quaternion.fromEuler(0, Math.PI, 0),
            scaling: new Vector3(1, 1, 1)
        },
        false,
        140,
        62,
        1,
        true,
        100,
        [".", ",", "-", "~", ":", ";", "=", "!", "*", "#", "$", "@"],
        4
    ));

    // Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI),

    // env.addShape(await PolyShape.fromObj(
    //     "among us",
    //     "among us",
    //     {
    //         position: new Vector3(-20, 0, 0),
    //         rotation: Quaternion.identity.multiply(Quaternion.fromEuler(0, Math.PI / 4, 0)),
    //         scaling: new Vector3(0.3, 0.3, 0.3)
    //     },
    //     false
    // ));

    // env.addShape(await PolyShape.fromObj(
    //     "cube",
    //     "cube",
    //     {
    //         position: new Vector3(50, 0, 0),
    //         rotation: Quaternion.identity,
    //         scaling: new Vector3(15, 10, 15)
    //     },
    //     false
    // ));

    // env.addShape(await PolyShape.fromObj(
    //     "teapot",
    //     "teapot",
    //     {
    //         position: new Vector3(50, 12, 0),
    //         rotation: Quaternion.identity,
    //         scaling: new Vector3(8, 8, 8)
    //     },
    //     false
    // ));

        env.addShape(await PolyShape.fromObj(
        "cube",
        "default cube",
        {
            position: new Vector3(0, 0, 0),
            rotation: Quaternion.identity,
            scaling: new Vector3(1, 1, 1)
        },
        false
    ));


    env.getCanvas().addEventListener('wheel', zoom);

    env.getCanvas().addEventListener('mousedown', (ev) => { 
        [cameraControls.mouseClickedX, cameraControls.mouseClickedY] = [ev.offsetX, ev.offsetY];
        cameraControls.initialCameraPosition = env.getMainCamera().transform.position;
        cameraControls.initialCameraRotation = env.getMainCamera().transform.rotation;
        cameraControls.initialCameraHorizontal = env.getMainCamera().horizontal;
        cameraControls.initialCameraVertical = env.getMainCamera().vertical;

        if (ev.altKey) {
            if (ev.ctrlKey) {
                cameraControls.panning = true;
            } else {
                cameraControls.rotating = true;
            }
        } 

    });
    
    env.getCanvas().addEventListener('mousemove', (ev) => { 
        const [mouseX, mouseY] = [ev.offsetX, ev.offsetY];
        const deltaX = mouseX - cameraControls.mouseClickedX;
        const deltaY = mouseY - cameraControls.mouseClickedY;
        const deltaR = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const camera = env.getMainCamera();
        const cameraTransform = camera.transform;
        if (cameraControls.panning) {
            cameraTransform.position = cameraControls.initialCameraPosition.subtract(camera.horizontal.multiplyByScalar(deltaX * 0.1))
                .subtract(camera.vertical.multiplyByScalar(-deltaY * 0.1));
            cameraControls.cameraFocusPoint = cameraControls.cameraFocusPoint.subtract(camera.horizontal.multiplyByScalar(deltaX * 0.1))
                .subtract(camera.vertical.multiplyByScalar(-deltaY * 0.1));
        } else if (cameraControls.rotating) {
            const tilt = Quaternion.fromAxisAngle(cameraControls.initialCameraHorizontal, -deltaY * 0.005);
            const turn = Quaternion.fromAxisAngle(cameraControls.initialCameraVertical, -deltaX * 0.005);
            const rotation = tilt.multiply(turn);
            cameraTransform.rotation = rotation.multiply(cameraControls.initialCameraRotation);
            cameraTransform.position = cameraControls.cameraFocusPoint
                .add(cameraControls.initialCameraPosition.subtract(cameraControls.cameraFocusPoint).rotate(rotation));
        }
    });

    env.getCanvas().addEventListener('mouseup', (ev) => {
        cameraControls.panning = false;
        cameraControls.rotating = false;
    });
}

function zoom(ev: WheelEvent) {
    ev.preventDefault();
    // env.getMainCamera().depth += ev.deltaY * 0.1;
    const camera = env.getMainCamera();
    const newPos = camera.transform.position.add(camera.viewingNormal.multiplyByScalar(ev.deltaY * 0.1));
    if (newPos.subtract(cameraControls.cameraFocusPoint).dotProduct(camera.viewingNormal) < 0)
        camera.transform.position = camera.transform.position.add(camera.viewingNormal.multiplyByScalar(ev.deltaY * 0.1))
}

function mainLoop(): void {
    env.render();
    console.log(env.getMainCamera().viewingNormal)

    // console.log(new Quaternion(0, new Vector3(-1 / Math.sqrt(3), -1 / Math.sqrt(3), -1 / Math.sqrt(3))).divideBy(new Quaternion(0, new Vector3(0, 0, 1))));
    // const rot = env.getShapes()[0].transform.rotation;
    // console.log(env.getMainCamera().worldSpaceToScreenSpace(env.getMainCamera().pointOfFocus))
    // env.getShapes()[0].transform.rotation = rot.multiply(Quaternion.fromEuler(0, 0.1, 0));

    console.log(env.getMainCamera().transform)
    // new Quaternion(-1/Math.sqrt(3), new Vector3(1/Math.sqrt(3), -1/Math.sqrt(3), 0))
}

main();