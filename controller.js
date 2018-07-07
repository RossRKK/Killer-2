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
        //TODO verify that the websocket belongs to the admin
        //handle incoming messages from clients
        switch (msg.action) {
            case "pot":
                //TODO the ball was potted
                break;
            case "miss":
                //TODO the pot was missed
                break;
            case "addLives":
                //TODO the black or multiple balls were potted
                break;
        }
    }

    /**
     * Push the updated state of a cycle to the client.
     * @param ws Thw ebsocket to push back on.
     * @param cycle The cycle to describe
     */
    function pushDrawnPlayer(ws, player) {
        ws.send(JSON.stringify({
                type: "draw",
                player: player
        }));
    }

    /**
     * Push back that an event occurred
     * @param ws The websocket to push back on.
     * @param event The event that occured.
     */
    function pushEvent(ws, event) {
        ws.send(JSON.stringify({
            type: "event",
            action: won,
        }));
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
