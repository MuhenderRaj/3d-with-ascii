import { Shape, Camera, Light, Entity } from './builtins/interfaces';

/**
 * Singleton class representing the environment
 */
export class Environment {
    private static environment: Environment | undefined;

    private readonly shapes: Array<Shape> = [];
    private readonly cameras: Array<Camera> = [];
    private readonly lights: Array<Light> = [];

    private mainCamera: Camera | undefined;

    private constructor() { }

    public static getEnvironment(): Environment {
        if (Environment.environment === undefined)
            Environment.environment = new Environment();
        
        return Environment.environment;
    }

    /**
     * Adds a shape to the environment
     * 
     * @param shape the shape to be added
     */
    public addShape(shape: Shape): void {
        this.shapes.push(shape);
    }

    /**
     * Adds a camera to the environment. The first camera added 
     * is by default the main camera
     * 
     * @param camera the camera to be added
     */
    public addCamera(camera: Camera): void {
        this.cameras.push(camera);
        if (this.mainCamera === undefined) {
            this.mainCamera = camera;
        }
    }

    /**
     * Adds a light to the environment
     * 
     * @param light the light to be added
     */
    public addLight(light: Light): void {
        this.lights.push(light);
    }

    /**
     * Returns all Entities in the environment
     * 
     * @returns an array of all entities in the environment
     */
    public getObjects(): Array<Entity> {
        return (new Array<Entity>()
            .concat(this.shapes)
            .concat(this.cameras)
            .concat(this.lights));
    }

    /**
     * @returns an array of the shape objects in the environment
     */
    public getShapes(): Array<Shape> {
        return this.shapes.slice();
    }

    /**
     * 
     * @returns an array of the light objects in the environment
     */
    public getLights(): Array<Light> {
        return this.lights.slice();
    }

    public render(): HTMLCanvasElement {
        if (this.mainCamera)
            return this.mainCamera.render(this);
        
        return new HTMLCanvasElement();
    }
}