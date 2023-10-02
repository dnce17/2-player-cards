// FRONTEND/Client

let socket = io.connect('http://localhost:5500');

let playerA = document.querySelector(".player-a");
let playerB = document.querySelector(".player-b");

// DEBUG purposes: To identify both players on browser
playersID = {}

// EVENTS
let deckCtnr = document.querySelector('.deck-ctnr')

let cardOne = document.querySelector('.card-one');
cardOne.addEventListener('click', function() {
    socket.emit('to hand', [socket.id, Array.prototype.indexOf.call(deckCtnr.children, this)]);

    // console.log(Array.prototype.indexOf.call(deckCtnr.children, this));
});

// LISTEN FOR EVENTS EMITTED "FROM" THE SERVER (BACKEND)
socket.on('isPlayerA', function(data) {
    // No point adding to playersID b/c player B not in room yet, so would not get data
    self.id = data;
    playerA.innerHTML += `<p>Player A: ${data}</p>`;
});

socket.on('isPlayerB', function(data) {
    self.id = data;
    playersID.playerA = data[0];
    playersID.playerB = data[1];
    playerB.innerHTML += `<p>Player B: ${data[0]}</p>`;
    playerA.innerHTML += `<p>Player A: ${data[1]}</p>`;

    // console.log(playersID);
});

socket.on('board orienation', function() {
    playerB.classList.remove('top');
    playerB.className += ' bottom';
    playerA.classList.remove('bottom');
    playerA.className += ' top';
});

socket.on('to hand', function(data) {
    console.log(data[0][0]);

    let playerID = data[0][0], cardIndex = data[0][1];


    if (playerID == data[1].playerA) {
        playerA.appendChild(deckCtnr.children[0]);
        console.log(data[0] + ' did it ');
    }
    else {
        playerB.appendChild(deckCtnr.children[0]);
        console.log(data[0] + ' did it ');
    }
});

// Credits
// https://stackoverflow.com/questions/66771371/how-to-get-index-of-div-in-parent-div
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // Note for above: Array.prototype.indexOf.call() is used to call indexOf on non-array object
    // Nodelist and HTMLCollection are both NOT an array