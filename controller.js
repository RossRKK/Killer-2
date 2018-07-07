/**
 * API for the Tron game. Handles requests concerning users.
 */

let model = undefined;
let controller = exports;

exports.newGame = function (req, res) {
    //kick off a new game
    let gameId = model.startGame();
    //return the new games id
    res.statusCode = 200;
    res.end(gameId);
}

/**
 * Module for handling the web socket.
 * @type {{handleMessage: exports.ws.handleMessage}}
 */
exports.ws = function () {

    /**
     * Handle incoming web socket messages.
     * @param ws The websocket the message is coming from.
     * @param msg The parsed JSON message.
     */
    function handleMessage(ws, msg) {
        //handle incoming messages from clients
        switch (msg.action) {
            case "pot":
                //the ball was potted
                ws.game.pot(msg.extraLives);
                break;
            case "miss":
                //the pot was missed
                ws.game.miss();
                break;
            case "replace":
                ws.game.replace();
                break;
            case "start":
                ws.game.start();
                break;
            case "addPlayer":
                ws.game.addPlayer(msg.player);
                break;
            default:
                console.log("Unsupported action: " + msg.action);
                break;
        }
    }



    return {
        handleMessage: handleMessage
    }
}();

/**
 * Initialise the API by setting the reference to the model
 * that is to be used (dependency injection).
 */
controller.init = function(modelArg) {
    model = modelArg;
};
