/**
 * API for the Tron game. Handles requests concerning users.
 */

let model = undefined;
let controller = exports;

exports.newGame = function (req, res) {
    //kick off a new game
    let game = model.startGame();
    //return the new games id
    res.statusCode = 200;
    res.end(game.id);
}

/**
 * Module for handling the web socket.
 * @type {{handleMessage: exports.ws.handleMessage}}
 */
exports.ws = function () {

    /**
     * Handle incoming web socket messages.
     * @param client The client the message is coming from.
     * @param msg The parsed JSON message.
     */
    function handleMessage(client, msg) {
        console.log(msg)
        //handle incoming messages from clients
        switch (msg.action) {
            case "pot":
                //the ball was potted
                client.game.pot(msg.extraLives);
                break;
            case "miss":
                //the pot was missed
                client.game.miss();
                break;
            case "replace":
                client.game.replace();
                break;
            case "start":
                client.game.start(msg.lives);
                break;
            case "addPlayer":
                client.game.addPlayer(msg.player);
                break;
            case "remove":
                client.game.remove(msg.player, msg.through);
                break;
            case "putThrough":
                client.game.putThrough(msg.player);
                break;
            case "demote":
                client.game.demote(msg.player);
                break;
            case "ping":
                //ignore ping messages
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
