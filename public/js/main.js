const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages=document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");


//username and room 
const{ username,room }= Qs.parse(location.search,{
    ignoreQueryPrefix: true
});

//join chat
socket.emit('joinRoom',{username,room});

//Get room and users
socket.on("roomUsers",function({room,users}){
    outputRoomName(room);
    outputUsers(users);
});

//messsage from Server
socket.on("message", function (message) {
    console.log(message);
    outputMessage(message);

    //Scrool
    chatMessages.scrollTop=chatMessages.scrollHeight;   
});

//Message Submit
chatForm.addEventListener("submit", function (e) {
    e.preventDefault();

    //Get msg text and emit to server
    const msg = e.target.elements.msg.value;
    socket.emit("chatMessage", msg);

    //clear input
    e.target.elements.msg.value="";
    e.target.elements.msg.focus(); 
});

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = "<p class='meta'> "+message.user+" <span> "+message.time+" </span></p> <p class='text'>"+message.text+"</p>";
    document.querySelector('.chat-messages').appendChild(div);
};

//Add room name to dom 
function outputRoomName(room){
    roomName.innerHTML=room;
}

//Add users to dom 
function outputUsers(users){
    const joinedUsers=users.map(user=>"<li>"+user.username+"</li>").join("")
    userList.innerHTML = joinedUsers;
}