"use strict";

var update = true;

var model = (function() {
    /**
     * The websocket this client uses to communicate to the server.
     */
    var ws;

    /**
     * Whether the controls should be enabled.
     */
    var controlEnabled = true;

    /**
     * The current status of the game.
     */
    var currentStatus;

    $(document).ready(function () {

        view.init();
        controller.init();
    });

    function disableControls() {
        controlEnabled = false;

        view.disableControls();
    }

    function enableControls() {
        controlEnabled = true;

        view.enableControls();
    }

    function toggleControls() {
        controlEnabled = !controlEnabled;

        controlEnabled ? view.enableControls() : view.disableControls();
    }

    /**
     * Handle incoming messages from the server.
     */
    function handleMessage(event) {
        var msg = JSON.parse(event.data);

        console.log(msg);

        currentStatus = msg.status;

        promptRender(msg.status);

        if (msg.status.hasStarted) {
            view.start();
        }

        switch (msg.type) {
            case "draw":
                view.draw(msg.player);
                break;
            case "win":
                view.winner(msg.player);
                break;
            case "start":
                view.start();
                break;
            case "redraw":
                view.redraw();
                break;
            case "reset":
                view.reset();
                break;
        }
    }

    function promptRender(status) {
        view.render(status, controlEnabled);
    }

    /**
     * Tell the server to add another player.
     * @param player The name of the player to add.
     */
    function addPlayer(player) {
        ws.send(JSON.stringify({
            action: "addPlayer",
            player: player
        }));

        view.clearPlayer();
    }

    /**
     * Tell the server that the player potted.
     * @param extraLives The number of extra lives the player should recieve.
     */
    function pot(extraLives) {
        view.fadeOut();

        ws.send(JSON.stringify({
            action: "pot",
            extraLives: extraLives
        }));
    }

    /**
     * Tell the server that the player missed.
     */
    function miss() {
        view.fadeOut();

        ws.send(JSON.stringify({
            action: "miss",
        }));
    }

    /**
     * Tell the server to replace the current player.
     */
    function replace() {
        view.fadeOut();

        ws.send(JSON.stringify({
            action: "replace",
        }));
    }

    /**
     * Tell the server to start the game.
     */
    function start(lives) {
        //check that there is at least 2 players
        if (currentStatus.players.length > 1) {
            ws.send(JSON.stringify({
                action: "start",
                lives: lives
            }));
        } else {
            alert("There must be players to start a game");
        }
    }

    function remove(player, through) {
        ws.send(JSON.stringify({
            action: "remove",
            player: player,
            through: through
        }));
    }

    function putThrough(player) {
        ws.send(JSON.stringify({
            action: "putThrough",
            player: player
        }));
    }

    function demote(player) {
        ws.send(JSON.stringify({
            action: "demote",
            player: player
        }));
    }

    function newGame() {
        return $.ajax({
            url: "/newgame",
            method: "POST"
        });
    }

    //30s ping
    var pingInterval = 30000;

    var pingId;

    function ping() {
        ws.send(JSON.stringify({
            action: "ping"
        }));
    }

    /**
     * Initialise the web socket connection.
     */
    function init(gameId) {
        var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += loc.pathname +'ws/' + gameId;
        ws = new WebSocket(new_uri);
        //ws = new WebSocket("ws://echo.websocket.org");
        ws.addEventListener("open", function () {
            console.log("socket opended");
            pingId = setInterval(ping, pingInterval);
        });

        ws.addEventListener("message", handleMessage);

        ws.addEventListener("close", function () {
            console.log("socket closed");
            clearInterval(pingId);
            view.init();
        });

        ws.addEventListener("error", function () {
            console.err("socket error")
        });


    }

    return {
        init: init,
        addPlayer: addPlayer,
        pot: pot,
        miss: miss,
        replace: replace,
        start: start,
        newGame: newGame,
        putThrough: putThrough,
        demote: demote,
        remove: remove,

        disableControls: disableControls,
        enableControls: enableControls,
        toggleControls: toggleControls,
        promptRender: promptRender,
    }
})();
