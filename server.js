//------------Initialize the express 'app' object--------
let express = require("express"); 
let app = express(); 

//----------Initialize HTTP server------
let http = require("http");
let server = http.createServer(app);

//------------Initialize socket.io---------
let io = require("socket.io");
io = new io.Server(server);

// ------Set the server to listen on port 3000 -------
let port = process.env.PORT || 3000;  
server.listen(port, () => {  
    console.log(`Server is running on port ${port}`);  
});


let cardPositions = {};

app.use("/", express.static("public"));
// app.use(express.static("public"));  

// Handle a new connection event
io.on("connection", (socket) => {  // Listen for clients connecting to the Socket.IO server
    console.log("A user connected:" + socket.id);  // Log when a user successfully connects to the server
    
    //send the current state to the new user
    socket.emit('initialize-cards',cardPositions);

    //----new version testing
    //set up initializing card for everyone
    socket.on('initialize-cards', (positions) => {
        cardPositions = positions;
        io.emit('initialize-cards', positions);
    });

   //listen for message from client
    socket.on('move-card', (data) => {
        cardPositions[data.id] = { x: data.x, y: data.y};
        //Send data to ALL clients, including this one
        io.emit('move-card',data);
        
    });

// Handle a disconnection event
    socket.on("disconnect", () => {  // Listen for the disconnection event when a user disconnects from the server
        console.log("A user disconnected"+ socket.id);  // Log when a user disconnects from the server
    });
});