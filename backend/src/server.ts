import app from './app'
import {Server} from "socket.io";
import http from "http"

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:process.env.FRONTEND_URL,
        credentials:true
    }
})

app.set("io",io);

server.listen(process.env.PORT,()=>{
    console.log("server is running")
})