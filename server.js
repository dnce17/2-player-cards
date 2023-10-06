// BACKEND/Server

const express = require('express');
const socket = require('socket.io');
let Deck = require('card-deck');
const cardDeck = require('./public/poker-cards.js');

// App Setup
const app = express();
const server = app.listen(5500, function() {
    console.log('Listening to 5500');
});

// Static file
app.use(express.static('public'));

// Allows socket to work on the server
const io = socket(server);

// Get the two players fighting
playersID = {}

// Get the poker card deck
let pokerDeck = new Deck(cardDeck());
pokerDeck.draw();
pokerDeck.draw();
console.log(pokerDeck.remaining());
pokerDeck = new Deck(cardDeck());
console.log(pokerDeck.remaining());

// Get both players starting hand
function startingHand() {
    // Reset deck
    pokerDeck = new Deck(cardDeck());

    let counter = 0;
    let startHandA = [], startHandB = [];
    pokerDeck.shuffle();

    // Alternate the card added to each player's hand
    for (let i = 0; i < 16; i++) {
        let startCard = pokerDeck.draw();
        if (counter % 2 == 0) {
            startHandA.push(startCard);
        }
        else {
            startHandB.push(startCard);
        }
        counter++;
    }
    
    return [startHandA, startHandB];
}

// console.log("A: " + startHandA, startHandA.length);
// console.log("B: " + startHandB, startHandB.length);
// console.log(pokerDeck.remaining());

io.on('connection', function(socket) {
    console.log('A user has connected');
    // console.log(`User Count: ${io.engine.clientsCount}, ${socket.id}`);

    if (io.engine.clientsCount == 1) {
        playersID.playerA = socket.id;
        io.emit('isPlayerA',  playersID.playerA);
    } 
    else {
        playersID.playerB = socket.id;
        io.emit('isPlayerB', [playersID.playerA, playersID.playerB]);

        // socket.emit NOT broadcast so it only affects the owner of this socket
        socket.emit('board orienation');

        // Add 8 cards from deck to both players' starting hand
        let startHand = startingHand();
        socket.broadcast.emit('player A starting hand', startHand[0]);
        socket.emit('player B starting hand', startHand[1]);
    }

    socket.on('change location', function(data) {
        // io.emit('change location', [data, playersID])
        socket.broadcast.emit('change location', [data, playersID])
    });

    socket.on('drop success check', function(data) {
        socket.broadcast.emit('drop success check', data)
    });

    socket.on('draw', function(data) {
        socket.emit('draw', [data, playersID, pokerDeck.draw()]);
        // console.log(pokerDeck.remaining());
    });

    socket.on('show card back to opponent', function(data) {
        socket.broadcast.emit('show card back to opponent', [data, playersID]);
    })

});

// Credits
// https://stackoverflow.com/questions/32674391/io-emit-vs-socket-emit

// to do
// starting hand
// reshuffle drop oile into deck after deck runs out