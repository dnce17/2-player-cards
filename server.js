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


io.on('connection', function(socket) {
    console.log('A user has connected');
    // console.log(`User Count: ${io.engine.clientsCount}, ${socket.id}`);

    if (io.engine.clientsCount == 1) {
        playersID.playerA = socket.id;
        io.emit('isPlayerA',  playersID.playerA);

        socket.emit('disable player B drop zone');

        // test purpose
        pokerDeck = new Deck(cardDeck());
    }
    else {
        playersID.playerB = socket.id;
        io.emit('isPlayerB', [playersID.playerA, playersID.playerB]);

        // socket.emit NOT broadcast so it only affects the owner of this socket
        socket.emit('board orienation');


        // Add 8 cards from deck to both players' starting hand + place card in drop to start
        let startHand = startingHand();
        io.emit('display game materials');
        socket.broadcast.emit('player A starting hand', startHand[0]);
        socket.emit('player B starting hand', startHand[1]);
        io.emit('starting drop card', pokerDeck.draw());

        // Prevents player A from accessing player B's drop-zone
        socket.broadcast.emit('enable player A drop zone');
        // Vice versa
        socket.emit('enable player B drop zone');

        // Determine who go first
        let num = Math.floor(Math.random() * 2);
        // A go first if 0, B first if 1
        if (num == 0) {
            // HTML is adjusted by default for going first, so this emit only required
            socket.emit('go second');
        }
        else {
            socket.broadcast.emit('go second');
        }
    }

    socket.on('end turn', function(){
        socket.broadcast.emit('end turn');
    });

    socket.on('change location', function(data) {
        socket.broadcast.emit('change location', [data, playersID]);
    });

    socket.on('return to deck', function(data) {
        pokerDeck.addToTop([data[0]]);
        io.emit('deck count', pokerDeck.remaining());
        socket.broadcast.emit('return to deck', [data[1], data[2], playersID]);
    });

    socket.on('add back drag evt to cards in drop', function() {
        socket.emit('add back drag evt to cards in drop');
    });

    socket.on('drop success check', function(data) {
        socket.broadcast.emit('drop success check', data);
    });

    socket.on('draw', function(data) {
        socket.emit('draw', [data, playersID, pokerDeck.draw()]);
    });
    
    socket.on('draw audio', function() {
        io.emit('draw audio');
    });

    socket.on('indicate card owner in drop', function(data) {
        io.emit('indicate card owner in drop', data);
    });

    socket.on('show card back to opponent', function(data) {
        socket.broadcast.emit('show card back to opponent', [data, playersID]);
    });

    socket.on('deck count', function() {
        io.emit('deck count', pokerDeck.remaining());
    });

    socket.on('reshuffle to deck', function(data) {
        pokerDeck = new Deck(data);
        pokerDeck.shuffle();
        console.log(pokerDeck);
        io.emit('reshuffle to deck', pokerDeck.remaining());
    });

    socket.on('offer rematch', function() {
        socket.broadcast.emit('offer rematch');
    });

    socket.on('accept rematch', function(data) {
        io.emit('accept rematch');

        // Reset everything for the rematch
        let startHand = startingHand();
        if (data == playersID.playerA) {
            socket.emit('player A starting hand', startHand[0]);
            socket.broadcast.emit('player B starting hand', startHand[1]);
        }
        else {
            socket.broadcast.emit('player A starting hand', startHand[0]);
            socket.emit('player B starting hand', startHand[1]);
        }
        io.emit('starting drop card', pokerDeck.draw());
        io.emit('deck count', pokerDeck.remaining());
    })

    // CHAT-RELATED sockets
    socket.on('send msg', function(data) {
        io.emit('send msg', [data, playersID]);
    });

    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data)
    });

    socket.on('not typing', function(data) {
        socket.broadcast.emit('not typing', data)
    });
});

// To restart game
// all we need is to gather all cards to the deck and redistribute the starting hand

// Credits
// https://stackoverflow.com/questions/32674391/io-emit-vs-socket-emit

// to do
// starting hand - CHECK
// reshuffle drop oile into deck after deck runs out
// add count to deck - CHECK