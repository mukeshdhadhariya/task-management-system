/// <reference path="./types/express/index.d.ts" />
import "dotenv/config";
import app from './app'
import http from "http"
import { initializeSocket } from "./socket";

const server=http.createServer(app);

const io = initializeSocket(server);

app.set("io",io);

server.listen(process.env.PORT,()=>{
    console.log("server is running")
})