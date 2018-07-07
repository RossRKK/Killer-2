"use strict";

var model = (function() {
    /**
     * The websocket this client uses to communicate to the server.
     */
    var ws;

    $(document).ready(function () {

        view.init();
        controller.init();
    });


    /**
     * Handle incoming messages from the server.
     */
    function handleMessage(event) {
        var msg = JSON.parse(event.data);

        console.log(msg);

        view.render(msg.status);

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

    /**
     * Tell the server to add another player.
     * @param player The name of the player to add.
     */
    function addPlayer(player) {
        ws.send(JSON.stringify({
            action: "addPlayer",
            player: player
        }));
    }

    /**
     * Tell the server that the player potted.
     * @param extraLives The number of extra lives the player should recieve.
     */
    function pot(extraLives) {
        ws.send(JSON.stringify({
            action: "pot",
            extraLives: extraLives
        }));
    }

    /**
     * Tell the server that the player missed.
     */
    function miss() {
        ws.send(JSON.stringify({
            action: "miss",
        }));
    }

    /**
     * Tell the server to replace the current player.
     */
    function replace() {
        ws.send(JSON.stringify({
            action: "replace",
        }));
    }

    /**
     * Tell the server to start the game.
     */
    function start(lives) {
        ws.send(JSON.stringify({
            action: "start",
            lives: lives
        }));
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
        new_uri += loc.pathname + gameId;
        ws = new WebSocket(new_uri);
        //ws = new WebSocket("ws://echo.websocket.org");
        ws.addEventListener("open", function () {
            console.log("socket opended");
        });

        ws.addEventListener("message", handleMessage);

        ws.addEventListener("close", function () {
            console.log("socket closed")
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
    }
})();
