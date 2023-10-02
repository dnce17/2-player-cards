// FRONTEND/Client

let socket = io.connect('http://localhost:5500');

let playerA = document.querySelector('.player-a-ctnr');
let playerB = document.querySelector('.player-b-ctnr');
let playerAName = document.querySelector('.player-a-name');
let playerBName = document.querySelector('.player-b-name');
let playerAHand = document.querySelector('.player-a-hand');
let playerBHand = document.querySelector('.player-b-hand');

let dropCtnr = document.querySelector('.drop-ctnr');

// DEBUG purposes: To identify both players on browser
playersID = {}

// EVENTS
// Drag cards
let dropZones = document.querySelectorAll('.drop-zone');
let cards = document.querySelectorAll('.card');

let start = null, end = null;
cards.forEach(function(card) {
    card.addEventListener('dragstart', function() {
        card.classList.add('is-dragging');
        start = Array.prototype.indexOf.call(this.parentElement.children, this);
    })

    card.addEventListener('dragend', function() {
        card.classList.remove('is-dragging');
        socket.emit('change location', [socket.id, start])
        console.log(socket.id);
    })
});

dropZones.forEach(function(dropZone) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        const curTask = document.querySelector('.is-dragging');
        dropZone.appendChild(curTask);
    })
});

// LISTEN FOR EVENTS EMITTED "FROM" THE SERVER (BACKEND)
// Get players who connect
socket.on('isPlayerA', function(data) {
    // No point adding to playersID b/c player B not in room yet, so would not get data
    self.id = data;
    playerAName.textContent = `Player A: ${data}`;

    // This causes player A's hand to be undraggable for some reason that Idk
    // playerA.innerHTML += `<p>Player A: ${data}</p>`;
});

socket.on('isPlayerB', function(data) {
    self.id = data;
    playersID.playerA = data[0];
    playersID.playerB = data[1];

    playerAName.textContent = `Player A: ${playersID.playerA}`;
    playerBName.textContent = `Player B: ${playersID.playerB}`;

    // console.log(playersID);

    // This causes player B's hand to be undraggable for some reason that Idk
    // playerB.innerHTML += `<p>Player B: ${data[0]}</p>`;
    // playerA.innerHTML += `<p>Player A: ${data[1]}</p>`;
});

// Establish both player's view 
socket.on('board orienation', function() {
    playerB.classList.remove('top');
    playerB.className += ' bottom';
    playerA.classList.remove('bottom');
    playerA.className += ' top';
});

socket.on('change location', function(data) {

    let playerID = data[0][0], cardIndex = data[0][1];

    // console.log(playerID, cardIndex, data[1].playerA);

    if (playerID == data[1].playerA) {
        dropCtnr.appendChild(playerAHand.children[cardIndex]);
        console.log('A');
        console.log(data[1].playerA);
        console.log(playerID + ' did it ');
    }
    else {
        dropCtnr.appendChild(playerBHand.children[cardIndex]);
        console.log('B');
        console.log(data[1].playerB);
        console.log(playerID + ' did it ');
    }
});




// -----

// let cardOne = document.querySelector('.card-one');
// cardOne.addEventListener('click', function() {
//     socket.emit('to hand', [socket.id, Array.prototype.indexOf.call(deckCtnr.children, this)]);

//     // console.log(Array.prototype.indexOf.call(deckCtnr.children, this));
// });

// socket.on('to hand', function(data) {
//     console.log(data[0][0]);

//     let playerID = data[0][0], cardIndex = data[0][1];


//     if (playerID == data[1].playerA) {
//         playerA.appendChild(deckCtnr.children[0]);
//         console.log(data[0] + ' did it ');
//     }
//     else {
//         playerB.appendChild(deckCtnr.children[0]);
//         console.log(data[0] + ' did it ');
//     }
// });

// Credits
// https://stackoverflow.com/questions/66771371/how-to-get-index-of-div-in-parent-div
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // Note for above: Array.prototype.indexOf.call() is used to call indexOf on non-array object
    // Nodelist and HTMLCollection are both NOT an array
// https://www.youtube.com/watch?v=ecKw7FfikwI&t=1005s