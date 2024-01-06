# Nonautomatic 2-Player Crazy Eights (Began on 9/30/23)

## How to run
Type **nodemon server.js** in the terminal. After running the command, have both players type http://localhost:5500/ into their browser to play. Make sure no more than two tabs are in http://localhost:5500/ or else error will occur; if error occurs, have both users exit the localhost and enter it again.

## Function
This game allows two players to play Crazy Eights together locally. Real-time chat function is also available for players to communicate. 

The game operates manually, in which users can
1) click the deck to draw cards
2) drag cards from hand to center or vice versa
    - When players drag a card to the center, a purple or pink border will surround the card to let players know who put that card down. Player A will be purple while B will be pink. 
3) drag cards from hand to deck
4) rematch after the game is done with the "Offer Rematch" button on the bottom right

Players can click the "End Turn" button when they are done with their turn. Below the button tells players whose turn it is. Players cannot draw or drag cards when it's not their turn.


#### Credits
##### - Provided assistance with Github troubles --> https://stackoverflow.com/questions/16330404/how-to-remove-remote-origin-from-a-git-repository
##### - Explantion of favicon --> https://www.webweaver.nu/html-tips/favicon.shtml found from https://stackoverflow.com/questions/31075893/how-to-fix-favicon-ico-error-failed-to-load-resource-neterr-empty-response