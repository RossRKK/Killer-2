/**
 * Model for the game.
 */


let model = exports;

/**
 * A class representing a game of Killer.
 * @type {model.Game}
 */
model.Game = class {
    /**
     * Create a new game.
     * @param id The games unique id.
     */
    constructor(id) {
        this.id = id;

        //whether the game has started
        this.hasStarted = false;

        //the list of player in the game
        this.players = [];

        //list of websockets who are subscribed to updates in this game
        this.subscribers = [];
    }

    addPlayer(name) {

    }

    /**
     * Start the game.
     */
    start() {
        this.hasStarted = true;
    }

    draw() {

    }

    pot() {

    }

    miss() {

    }

    addLives(lives) {

    }

    /**
     * Determine which player won the game.
     */
    getWinner() {

    }

    /**
     *  Add a websocket to the list of subscribed websockets
     *  @param ws The websocket to add.
     */
    registerSubscription(ws) {
        this.subscribers.push(ws);
    }

    /**
     *  Remove a websocket from the list of subscribed websockets
     *  @param ws The websocket to remove.
     */
    deregisterSubscription(ws) {
        let index = this.subscribers.indexOf(5);
        if (index > -1) {
            this.subscribers.splice(index, 1);
        }
    }
};


/**
 *The model for the server.
 * @type {model.KIller}
 */
model.Model = class {

    constructor() {
        this.games = {};
    }

    /**
     * Start a new game.
     * @returns {model.Game} The new game.
     */
    startGame() {
        let id = genId();
        let game = new model.Game(id);

        this.games[id] = game;

        return game;
    }

    static genId() {
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (var i = 0; i < 5; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
    }

    getGame(id) {
        return this.games[id.toUpperCase()];
    }
};
