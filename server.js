// BACKEND/Server

const express = require('express');
const socket = require('socket.io');

// App Setup
const app = express();
const server = app.listen(5500, function() {
    console.log('Listening to 5500');
});

// Static file
app.use(express.static('public'));

// Allows socket to work on the server
const io = socket(server);

playersID = {}

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

    // Was for card one - might delete later
    // socket.on('to hand', function(data) {
    //     io.emit('to hand', [data, playersID])
    // });

    socket.on('change location', function(data) {
        // io.emit('change location', [data, playersID])
        socket.broadcast.emit('change location', [data, playersID])
    });

});

// Credits
// https://stackoverflow.com/questions/32674391/io-emit-vs-socket-emit