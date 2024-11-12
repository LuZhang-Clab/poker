//Open and connect socket
let socket = io();

const cards = document.querySelectorAll(".poker-card");

function addDragFunctionality(card){
    let isDragging = false; // To track if the card is currently being dragged
    let offsetX, offsetY; // To store the offset of the mouse position relative to the card

    // Mouse down event: Start dragging
    card.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent default behavior
        isDragging = true;

        // Calculate the offset of the mouse position relative to the card
        offsetX = e.clientX - card.getBoundingClientRect().left;
        offsetY = e.clientY - card.getBoundingClientRect().top;

        // Set cursor to indicate dragging
        card.style.cursor = 'grabbing';

        // Bring the card to the front
        card.style.zIndex = 1000;

        // Add a mousemove event listener to the document
        document.addEventListener("mousemove", moveCard);
    });

    // Move the card function
    const moveCard = (e) => {
        if (isDragging) {
            // Calculate the new position of the card
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            // Set the card's position to the new coordinates
            card.style.position = "absolute";
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
            socket.emit("move-card", { id: card.id, x, y});
        }
    };

    // Mouse up event: Stop dragging
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;

            // Reset the cursor
            card.style.cursor = 'grab';

            // Remove the mousemove event listener to stop dragging
            document.removeEventListener("mousemove", moveCard);
        }
    });
};



// New function added to randomize the position of each puzzle card
function setup() {
    const positions = [];
    cards.forEach(card => {
        // Get the width and height of the browser window
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Generate random x and y coordinates ensuring card stay within the screen
        const randomX = Math.random() * (windowWidth - card.clientWidth);
        const randomY = Math.random() * (windowHeight - card.clientHeight);

        // Set the card's CSS to place it at a random position
        card.style.position = "absolute";
        card.style.left = `${randomX}px`;
        card.style.top = `${randomY}px`;

        positions.push({ id: card.id, x: randomX, y: randomY});
    });
    socket.emit('initialize-s',positions);
}

//Only run setup if it is the first load
if (!sessionStorage.getItem('hasLoaded')){
    setup();
    sessionStorage.setItem('hasLoaded','true');
}

socket.on('initialize-cards', (positions)=>{
    for (let id in positions){
        const card =document.getElementById(id);
        if(card){
            card.style.position = "absolute"; 
            card.style.left = `${positions[id].x}px`; 
            card.style.top = `${positions[id].y}px`;
        }
    }
});



socket.on("move-card", (data) => {
    const card = document.getElementById(data.id);
    if (card) {
        card.style.position = "absolute";
        card.style.left = `${data.x}px`;
        card.style.top = `${data.y}px`;
    }
});

// Call the function for each card
cards.forEach(card => addDragFunctionality(card));

//Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");
});

//Listen for an event named 'message-share' from the server
socket.on('message-share', (data) => {
    console.log(data);
    addDragFunctionality(document.getElementById(data.id));

});