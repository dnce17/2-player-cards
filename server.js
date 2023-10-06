// BACKEND/Server

const express = require('express');
const socket = require('socket.io');
let Deck = require('card-deck');
const {deck} = require('./public/poker-cards.js');

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
let pokerDeck = new Deck(deck);
pokerDeck.shuffle();

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
    }

    socket.on('change location', function(data) {
        // io.emit('change location', [data, playersID])
        socket.broadcast.emit('change location', [data, playersID])
        console.log(data);
    });

    socket.on('drop success check', function(data) {
        socket.broadcast.emit('drop success check', data)
        console.log(data);
    });

    socket.on('draw', function(data) {
        // io.emit('draw', [data, playersID, pokerDeck.draw()]);
        socket.emit('draw', [data, playersID, pokerDeck.draw()]);
        // console.log(pokerDeck.remaining());
    });

    socket.on('show card back to opponent', function(data) {
        socket.broadcast.emit('show card back to opponent', [data, playersID]);
    })

});

// Credits
// https://stackoverflow.com/questions/32674391/io-emit-vs-socket-emit