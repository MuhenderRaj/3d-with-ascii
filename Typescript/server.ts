// TODO stub implementation, change to use a class later

import express, { Application } from 'express';
import { Server, createServer } from 'http';
import * as fs from 'fs';

class AppServer {
    private readonly app: Application;
    private readonly server: Server;

    /**
     * Create a new server that runs on the specified port
     * 
     * @param port the port on which to run the server
     */
    public constructor(private readonly port: number) {
        this.app = express();

        // Enable cross-site requests
        this.app.use((request, response, next) => {
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });

        this.server = createServer(this.app);
    }

    public async initEndpoints(): Promise<void> {
        // Endpoints:
        this.app.use(express.static('public'));

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
    public start(): void {
        this.server.listen(this.port);

        console.log(`Server running on port ${this.port}`);
        console.log(`Navigate to http://localhost:${this.port}`);
    }

    /**
     * Stop the server
     */
    public stop(): void {
        this.server.close();
        console.log("Server stopped listening");
    }
}

if (require.main === module) {
    const server: AppServer = new AppServer(3000);
    server.initEndpoints();
    server.start();
}