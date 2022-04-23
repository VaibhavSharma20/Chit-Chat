const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages")
const {userJoin,getCurrentUser, userLeave, getRoomUsers} = require("./utils/users")
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

server.listen(PORT,function(){
    console.log("Chat Server Running on port "+PORT);
});