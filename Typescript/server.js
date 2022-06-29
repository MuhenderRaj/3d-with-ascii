"use strict";
// TODO stub implementation, change to use a class later
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
class AppServer {
    /**
     * Create a new server that runs on the specified port
     *
     * @param port the port on which to run the server
     */
    constructor(port) {
        this.port = port;
        this.app = (0, express_1.default)();
        // Enable cross-site requests
        this.app.use((request, response, next) => {
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });
        this.server = (0, http_1.createServer)(this.app);
    }
    async initEndpoints() {
        // Endpoints:
        this.app.use(express_1.default.static('public'));
        // GET /
        this.app.get("/", (request, response) => {
            response.status(200)
                .type("text/html")
                .sendFile(__dirname + '/public/index.html');
        });
        this.app.get("/shapes/:shapeName.obj", (request, response) => {
            response.sendFile(__dirname + `/shapes/${request.params.shapeName}.obj`);
        });
        this.app.get("/dist/bundle.js", (request, response) => {
            response.sendFile(__dirname + "/dist/bundle.js");
        });
        // this.app.get("/getShapes", (request, response) => {
        //     response.type('application/json').send([...effects].filter(effect => effect !== ".DS_Store"));
        // });
    }
    /**
     * Start the server
     */
    start() {
        this.server.listen(this.port);
        console.log(`Server running on port ${this.port}`);
    }
    /**
     * Stop the server
     */
    stop() {
        this.server.close();
        console.log("Server stopped listening");
    }
}
if (require.main === module) {
    const server = new AppServer(3000);
    server.initEndpoints();
    server.start();
}
//# sourceMappingURL=server.js.map