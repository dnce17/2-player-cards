let username = document.querySelector('.username');
let input = document.querySelector('.input');
let sendBtn = document.querySelector('.send-btn');
let outputCtnr = document.querySelector('.output-ctnr');

let typing = document.querySelector('.typing');

sendBtn.addEventListener('click', function(e) {
    if (username.value.trim().length < 1) {

        username.setCustomValidity('Must add a username');
        username.reportValidity();
    }
    else if (input.value.trim().length < 1) {
        input.setCustomValidity('Message field blank');
        input.reportValidity();
    }
    else {
        socket.emit('send msg', [username.value, input.value]);
        username.disabled = true;
    }
});

input.addEventListener('keypress', function() {
    socket.emit('typing', username.value)
});

let timer = null;
input.addEventListener('keyup', function() {
    function notTyping() {
        socket.emit('not typing', '');
        // console.log('should only be activated once')
    }

    // Clears timeout if set already, preventing previous task from running
    clearTimeout(timer)
    timer = setTimeout(notTyping, 500);
});

socket.on('send msg', function(data) {
    let toSend = document.createElement("div");
    let name = data[0][0], msg = data[0][1];
    toSend.textContent =  name + ': ' + msg;

    toSend.classList.add('output');
    outputCtnr.appendChild(toSend);

    // console.log("scrolltop: " + outputCtnr.scrollTop);
    // console.log("scrollheight: " + outputCtnr.scrollHeight);
    // console.log("clientheight: " + outputCtnr.clientHeight);
    if (outputCtnr.scrollTop != outputCtnr.scrollHeight) {
        outputCtnr.scrollTop = outputCtnr.scrollHeight;
    }
});

socket.on('typing', function(data) {
    typing.textContent = `${data} is typing...`;
});

socket.on('not typing', function(data) {
    typing.textContent = data;
});

// Credit
// trim() - https://www.freecodecamp.org/news/check-if-string-is-empty-or-null-javascript/
// reportValidity() - https://forum.freecodecamp.org/t/setcustomvalidity-not-sending-error-message-to-html-despite-detecting-error/414917/3
// Got me started - https://stackoverflow.com/questions/25505778/automatically-scroll-down-chat-div
// mozilla on scrollTop, scrollHeight