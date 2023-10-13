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
let deckCount = document.querySelector('.deck-count');

let endTurnBtn = document.querySelector('.turn-btn');
let whoseTurn = document.querySelector('.whose-turn');

let startingHandCount = 8;
let rematchBtn = document.querySelector('.rematch-btn');

// DEBUG purposes: To identify both players on browser
playersID = {}

// EVENTS

// Draw cards
deckCtnr.addEventListener('click', function() {
    socket.emit('draw', socket.id);
    socket.emit('show card back to opponent', socket.id);
    socket.emit('deck count');
    if (parseInt(deckCount.textContent) == 1) {
        let returnCards = [];

        // All cards except the top card of drop goes back to deck
        for (let i = 0; i < dropCtnr.children.length - 1; i++) {
            let cardImg = dropCtnr.children[i].src.split('/');
            returnCards.push(cardImg[cardImg.length - 1]);
        }

        console.log('Returned Cards: ' + returnCards);
        socket.emit('reshuffle to deck', returnCards);
    }
});

rematchBtn.addEventListener('click', function() {
    socket.emit('offer rematch');
});

// Give cards drag event
let startLocation = null;
function addDragEvt(card) {
    let start = null;
    card.addEventListener('dragstart', function() {
        card.classList.add('is-dragging');
        start = Array.prototype.indexOf.call(card.parentElement.children, card);

        startLocation = card.parentElement.className;
        
        // Remove hover if the hovered card is being dragged
        if (card.classList.contains('hovered')) {
            card.classList.remove('hovered');
        }
    })

    card.addEventListener('dragend', function(e) {
        card.classList.remove('is-dragging');

        let cardImg = this.src.split('/');

        if (movedToDeck == true) {
            socket.emit('return to deck', [cardImg[cardImg.length - 1], socket.id, startLocation]);
            deckCtnr.children[deckCtnr.children.length - 1].remove();
            movedToDeck = false;
        }
        else {
            socket.emit('change location', [
                socket.id, 
                start, 
                cardImg[cardImg.length - 1],
                startLocation, 
                target
            ]);
        }

        if (target.includes('hand')) {
            addHover(card);
        }
    });
}

function addHover(card) {
    card.addEventListener('mouseover', function() {
        if (card.parentElement.classList.contains('hand')) {
            card.classList.add('hovered');
        }
    });
    card.addEventListener('mouseout', function() {
        if (card.parentElement.classList.contains('hand')) {
            card.classList.remove('hovered');
        }
    });
}

let enemyDropSuccess = false;
let target = null;

// Allow certain areas to be drop zone
let movedToDeck = false;
function addDropEvt(dropZone) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    dropZone.addEventListener('drop', function(e) {
        const curTask = document.querySelector('.is-dragging');
        dropZone.appendChild(curTask);

        target = dropZone.className;

        // Send info that drop was success to server w/ true
        socket.emit('drop success check', true);

        if (this.classList.contains('deck-ctnr')) {
            // console.log('moved to deck');
            movedToDeck = true;
        }
    });
}
addDropEvt(dropCtnr);
addDropEvt(deckCtnr);

endTurnBtn.addEventListener('click', function() {
    whoseTurn.textContent = "Your opponent's turn";
    endTurnBtn.disabled = true;

    socket.emit('end turn');
});




// LISTEN FOR EVENTS EMITTED "FROM" THE SERVER (BACKEND)
// Get players who connect
socket.on('isPlayerA', function(data) {
    // No point adding to playersID b/c player B not in room yet, so would not get data
    self.id = data;
    playerAName.textContent = `Player A: ${data}`;
});

socket.on('isPlayerB', function(data) {
    self.id = data;
    playersID.playerA = data[0];
    playersID.playerB = data[1];

    playerAName.textContent = `Player A: ${playersID.playerA}`;
    playerBName.textContent = `Player B: ${playersID.playerB}`;
});

// Players' starting hand
// CAUTION: this is broadcast all when player B enters
function startingHand(playerHand, opponentHand, handCards) {
    // Add player's starting hand
    for (let i = 0; i < handCards.length; i++) {
        playerHand.innerHTML += `<img src="img/poker-cards/${handCards[i]}" draggable="true" class="card">`;
    }

    // Add drag evt to only the player's OWN cards
    for (let i = 0; i < playerHand.children.length; i++) {
        addDragEvt(playerHand.children[i]);
        addHover(playerHand.children[i]);
    }

    // Don't let player see opponent hand
    for (let i = 0; i < startingHandCount; i++) {
        opponentHand.innerHTML += '<img src="img/poker-back.png" draggable="false" class="card">';
    }
}
socket.on('player A starting hand', function(data) {
    startingHand(playerAHand, playerBHand, data);
});
socket.on('player B starting hand', function(data) {
    startingHand(playerBHand, playerAHand, data);
});
socket.on('starting drop card', function(data) {
    dropCtnr.innerHTML += `<img src="img/poker-cards/${data}" draggable="true" class="card">`;
});
socket.on('enable player A drop zone', function() {
    addDropEvt(playerAHand);
});
socket.on('enable player B drop zone', function() {
    addDropEvt(playerBHand);
});
socket.on('go second', function() {
    endTurnBtn.disabled = true;
    whoseTurn.textContent = "Your opponent's turn";
});

// Tell opponent it's their turn and enable their End Turn btn
socket.on('end turn', function() {
    endTurnBtn.disabled = false;
    whoseTurn.textContent = 'Your turn';
});

// Establish both player's view 
socket.on('board orienation', function() {
    playerB.classList.remove('top');
    playerB.className += ' bottom';
    playerA.classList.remove('bottom');
    playerA.className += ' top';
});

function changeLocation(destination, playerHand, playerHandClass, index, cardImg) {
    if (destination.includes('drop-ctnr')) {
        playerHand.removeChild(playerHand.children[index]);
        dropCtnr.innerHTML += `<img src="img/poker-cards/${cardImg}" draggable="true" class="card">`;
    }
    else if (destination.includes(playerHandClass)) {
        dropCtnr.removeChild(dropCtnr.children[dropCtnr.children.length - 1]);
        playerHand.innerHTML += '<img src="img/poker-back.png" draggable="false" class="card">';
    }
    enemyDropSuccess = false;
    console.log(destination);
}

socket.on('change location', function(data) {

    let origin = data[0][data[0].length - 2];
    let destination = data[0][data[0].length - 1];

    let playerID = data[0][0], cardIndex = data[0][1], cardImg = data[0][2];

    if (enemyDropSuccess && origin != destination) {
        // Compare ID to check who did the action
        if (playerID == data[1].playerA) {
            changeLocation(destination, playerAHand, 'player-a-hand', cardIndex, cardImg);

            // One player adding card to drop resets opponent's card drag evt in 
            // their drop, so this adds it back
            socket.emit('add back drag evt to cards in drop');
        }
        else {
            changeLocation(destination, playerBHand, 'player-b-hand', cardIndex, cardImg);
            socket.emit('add back drag evt to cards in drop');
        }
    }
});

// CHECKPOINT
// NEED TO add: move from drop to deck reflect in opponents
socket.on('return to deck', function(data) {
    console.log('return to deck');
    startLocation = data[1];

    // Do not need compare player ID b/c drop is shared
    if (startLocation.includes('drop-ctnr')) {
        dropCtnr.children[dropCtnr.children.length - 1].remove();
        startLocation = null;
    }
    if (data[0] == data[2].playerA) {
        console.log('alter A Hand');
        playerAHand.removeChild(playerAHand.children[playerAHand.children.length - 1]);
    }
    else if (data[0] == data[2].playerB) {
        console.log('alter B Hand');
        playerBHand.removeChild(playerBHand.children[playerBHand.children.length - 1]);
    }
});

socket.on('add back drag evt to cards in drop', function() {
    for (let i = 0; i <  dropCtnr.children.length; i++) {
        addDragEvt(dropCtnr.children[i]);
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
        for (let i = 0; i < playerAHand.children.length; i++) {
            addDragEvt(playerAHand.children[i]);
            addHover(playerAHand.children[i]);
        }
    }
    else {
        playerBHand.innerHTML += `<img src="img/poker-cards/${cardToDraw}" draggable="true" class="card">`
        for (let i = 0; i < playerBHand.children.length; i++) {
            addDragEvt(playerBHand.children[i]);
            addHover(playerBHand.children[i]);
        }
    }
});

socket.on('deck count', function(data) {
    deckCount.textContent = data;
})

// Opponent will see card back after draw
socket.on('show card back to opponent', function(data) {
    
    if (data[0] == data[1].playerA) {
        playerAHand.innerHTML += '<img src="img/poker-back.png" draggable="true" class="card">';
    }
    else {
        playerBHand.innerHTML += '<img src="img/poker-back.png" draggable="true" class="card">';
    }
});

socket.on('reshuffle to deck', function(data) {
    deckCount.textContent = data;

    let topCard = dropCtnr.children[dropCtnr.children.length - 1].src.split('/');
    while (dropCtnr.hasChildNodes()) {
        dropCtnr.removeChild(dropCtnr.firstChild);
    }
    dropCtnr.innerHTML += `<img src="img/poker-cards/${topCard[topCard.length - 1]}" draggable="true" class="card">`;
});

socket.on('display game materials', function() {
    let fieldCtnr = document.querySelector('.field-cards-ctnr');
    let turnCtnr = document.querySelector('.turn-ctnr');
    let msg = document.querySelector('.msg');

    fieldCtnr.classList.remove('hidden');
    turnCtnr.classList.remove('hidden');
    msg.classList.add('hidden');
    
});

socket.on('offer rematch', function() {
    let btnsCtnr = document.querySelector('.btns-ctnr');

    // CAUTION: Depending on what you add, this may need to be altered later
    if (btnsCtnr.children.length == 1) {
        let acceptBtn = document.createElement('button');
        acceptBtn.classList.add('accept-btn');
        acceptBtn.innerHTML = 'Accept Rematch';

        acceptBtn.addEventListener('click', function() {
            socket.emit('accept rematch', socket.id);
        });

        btnsCtnr.appendChild(acceptBtn);
    }
})

socket.on('accept rematch', function() {
    document.querySelectorAll('.card').forEach(function(card) {
        if (!card.classList.contains('card-back')) {
            card.remove();
        }
    });

    let btnsCtnr = document.querySelector('.btns-ctnr'); 
    for (let i = 0; i < btnsCtnr.children.length; i++) {
        if (btnsCtnr.children[i].classList.contains('accept-btn')) {
            btnsCtnr.children[i].remove();
        }
    }
    if (btnsCtnr.children.length > 1) {
        btnsCtnr.removeChild(btnsCtnr.children[btnsCtnr.children.length - 1]);
    }
});


// Credits
// https://stackoverflow.com/questions/66771371/how-to-get-index-of-div-in-parent-div
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // Note for above: Array.prototype.indexOf.call() is used to call indexOf on non-array object
    // Nodelist and HTMLCollection are both NOT an array
// https://www.youtube.com/watch?v=ecKw7FfikwI&t=1005s
// https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
// https://stackoverflow.com/questions/11515383/why-is-element-innerhtml-bad-code