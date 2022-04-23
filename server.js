const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require(__dirname+"/utils/messages")
const {userJoin,getCurrentUser, userLeave, getRoomUsers} = require(__dirname+"/utils/users")
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = 3000||process.env.PORT;
const bot="Chit-Chat"
app.use(express.static(path.join(__dirname,"public")));

//when client connects
io.on('connection',function(socket){
    socket.on("joinRoom",function({username,room}){
        
        //joining user to room
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);

        //Welcome user
        socket.emit("message",formatMessage(bot,"Welcome to Chat App!"));

        //Brodcast connection msg in room
        socket.broadcast.to(user.room).emit("message",formatMessage(bot, user.username+" has joined the chat"));

        //Send user list and room info 
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers(user.room)
        });
    });

    //Client Disconnect
    socket.on("disconnect",function(){
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message",formatMessage(bot,user.username+" has left the chat"));
            //Send user list and room info 
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users:getRoomUsers(user.room)
             });
        }   
    });

    // Listen for msg
    socket.on('chatMessage',function(msg){
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
});

let port = process.env.PORT;
if(port==null || port==""){
    port=3000;
}
server.listen(port,function(){
    console.log("Chit-Chat server started on port 3000");
});