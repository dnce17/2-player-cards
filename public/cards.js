// FRONTEND/Client

let socket = io.connect('http://localhost:5500');

let playerA = document.querySelector('.player-a-ctnr');
let playerB = document.querySelector('.player-b-ctnr');
let playerAName = document.querySelector('.player-a-name');
let playerBName = document.querySelector('.player-b-name');
let playerAHand = document.querySelector('.player-a-hand');
let playerBHand = document.querySelector('.player-b-hand');

let deckCtnr = document.querySelector('.deck-ctnr');
let dropCtnr = document.querySelector('.drop-ctnr');
let dropZones = document.querySelectorAll('.drop-zone');
let cards = document.querySelectorAll('.card');

// DEBUG purposes: To identify both players on browser
playersID = {}

// EVENTS

// Draw cards
deckCtnr.addEventListener('click', function() {
    socket.emit('draw', socket.id);
});

function addDragEvt(card) {
    let start = null;
    card.addEventListener('dragstart', function() {
        card.classList.add('is-dragging');
        start = Array.prototype.indexOf.call(card.parentElement.children, card);
    })

    card.addEventListener('dragend', function(e) {
        card.classList.remove('is-dragging');

        // Issue
        socket.emit('change location', [socket.id, start])
    })
}

// Drag cards
cards.forEach(function(card) {
    addDragEvt(card);
});

let enemyDropSuccess = false;
dropZones.forEach(function(dropZone) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
    })

    dropZone.addEventListener('drop', function(e) {
        const curTask = document.querySelector('.is-dragging');
        this.appendChild(curTask);

        // Send info that drop was success to server w/ true
        socket.emit('drop success check', true)
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

    // Compare ID to check who did the action
    if (playerID == data[1].playerA) {
        // Issue = you assuming its the drop
        // dropCtnr.appendChild(playerAHand.children[cardIndex]);
        if (enemyDropSuccess) {
            dropCtnr.appendChild(playerAHand.children[cardIndex]);
        }
        console.log(enemyDropSuccess);
        enemyDropSuccess = false;
        console.log(enemyDropSuccess);
    }
    else {
        if (enemyDropSuccess) {
            dropCtnr.appendChild(playerBHand.children[cardIndex]);
        }
        // dropCtnr.appendChild(playerBHand.children[cardIndex]);
        console.log(enemyDropSuccess);
        enemyDropSuccess = false;
        console.log(enemyDropSuccess);
    }
});

socket.on('drop success check', function(data) {
    enemyDropSuccess = data;
})

socket.on('draw', function(data) {
    // Compare ID to check who did the action
    cardToDraw = data[2]
    
    if (data[0] == data[1].playerA) {
        playerAHand.innerHTML += `<img src="img/poker-cards/${cardToDraw}" draggable="true" class="card">`
        // console.log(playerAHand.children)
        for (let i = 0; i < playerAHand.children.length; i++) {
            addDragEvt(playerAHand.children[i]);
        }
    }
    else {
        playerBHand.innerHTML += `<img src="img/poker-cards/${cardToDraw}" draggable="true" class="card">`
        for (let i = 0; i < playerBHand.children.length; i++) {
            addDragEvt(playerBHand.children[i]);
        }
    }
});

// let Deck = require('card-deck');

// var myDeck = new Deck([1, 2, 3, 4, 5]);
// myDeck.shuffle();
// console.log(myDeck.top());

// Credits
// https://stackoverflow.com/questions/66771371/how-to-get-index-of-div-in-parent-div
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // Note for above: Array.prototype.indexOf.call() is used to call indexOf on non-array object
    // Nodelist and HTMLCollection are both NOT an array
// https://www.youtube.com/watch?v=ecKw7FfikwI&t=1005s

// To use 
// https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element

// Ideas
// Send updates parent element to other player rather than the single element?