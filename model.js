/**
 * Model for the game.
 */


let model = exports;

/**
 * A class that represents a client connected to this server.
 */
model.Client = class {
    constructor(ws) {
        this.ws = ws;
    }

    /**
     * Inform the client that some event occurred.
     * @param evt the event that occured.
     */
    pushEvent(evt) {
        this.ws.send(JSON.stringify({
            type: "event",
            evt: evt
        }));
    }
}

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

        //the number of lives each player will recieve
        this.lifeCount = 3;

        //how many rounds have been played
        this.roundCount = 0;

        //how many players have been drawn
        this.drawCount = 0;

        //whether the game has started
        this.hasStarted = false;

        //the list of players that will be added to the game
        this.players = [];

        //the index of player who is currently drawn
        this.currentPlayer = -1;

        //the list of lives that haven't been drawn yet
        this.toBeDrawn = [];

        //the list of players who are through to the next round
        this.through = [];

        //the list of players who were knocked out this round
        this.losers = [];

        //list of websockets who are subscribed to updates in this game
        this.subscribers = [];
    }

    /**
     * Add a player to the game.
     */
    addPlayer(name) {
        if (this.hasStarted) {
            //add a player to the game that has alreay started
            this.current.push(name);
        } else {
            //add a player to the list of players who will be in the game
            this.players.push(name);
        }
    }

    /**
     * Start the game.
     */
    start() {
        this.hasStarted = true;

        //add lifeCount lives for each player
        this.players.forEach((player) -> {
            for (let i = 0; i < this.lifeCount; i++) {
                this.current.push(player);
            }
        });

        //inform the subsribers of the start of the game
        subscribers.forEach((sub) -> {
            sub.pushEvent({
                type: "start",
                status: this.status()
            });
        });
    }

    /**
     * Randomly draw a new player.
     */
    draw() {
        let winner = this.determineWinner();
        if (winner) {
            //inform the players that a player has won
            subscribers.forEach((sub) -> {
                sub.pushEvent({
                    type: "win",
                    player: winner,
                    status: this.status()
                });
            });
        } else {
            if (this.toBeDrawn.length > 0) {
                //select a random player from the to be drawn de

    			this.currentPlayer = math.floor(Math.random() * this.toBeDrawn.length);

                //increment the draw counter
                this.drawCount++;

                //inform the players that a player was drawn
                subscribers.forEach((sub) -> {
                    sub.pushEvent({
                        type: "draw",
                        player: this.toBeDrawn[this.currentPlayer],
                        status: this.status()
                    });
                });

    		} else if (this.through.length > 0) {
                //redraw
    			this.redraw();
    			this.draw();
    		} else {
    			//No one is through, reset the round
    			this.current = this.losers;
    			this.losers = [];

                //inform the clients that the round was reset
                subscribers.forEach((sub) -> {
                    sub.pushEvent({
                        type: "reset",
                        status: this.status()
                    });
                });

                //increment the round count
                roundCount++;

                //draw a new player
    			this.draw();
    		}
        }
    }

    /**
     * Draw the next round.
     */
    redraw() {
        this.toBeDrawn = this.through;
        this.through = [];
        this.losers = [];

        //inform the subscribers that the next round has been drawn
        subscribers.forEach((sub) -> {
            sub.pushEvent({
                type: "draw",
                player: this.toBeDrawn[this.currentPlayer],
                status: this.status()
            });
        });

        //increment the round count
        this.roundCount++;
    }

    /**
     * Say that a player has potted.
     */
    pot(extraLives) {
        if (this.currentPlayer !== -1) {
            extraLives = extraLives ? extraLives : 0;
            //add the player to the through list
            for (let i = 0; i <= extraLives; i++) {
                this.through.push(this.toBeDrawn[this.currentPlayer]);
            }

            //remove the player from the current list
    	    this.toBeDrawn.splice(index, 1);
    	}

        //push back the new status of the game
        subscribers.forEach((sub) -> {
            sub.pushEvent({
                type: "pot",
                player: this.toBeDrawn[this.currentPlayer],
                extraLives: extraLives,
                status: this.status()
            });
        });


        //draw the next player
        this.draw();
    }

    /**
     * The current player missed.
     */
    miss() {
        if (this.currentPlayer !== -1) {
            //add the player to the losers list
            this.losers.push(this.toBeDrawn[this.currentPlayer]);

            //remove the player from the current list
    	    this.toBeDrawn.splice(index, 1);
    	}

        subscribers.forEach((sub) -> {
            sub.pushEvent({
                type: "miss",
                player: this.toBeDrawn[this.currentPlayer],
                status: this.status()
            });
        });

        //draw the next player
        this.draw();
    }

    /**
     * Draw another player to replace the current one with no consequence.
     */
    replace() {
        this.currentPlayer = math.floor(Math.random() * this.toBeDrawn.length);

        //inform the subscribers of the event
        subscribers.forEach((sub) -> {
            sub.pushEvent({
                type: "replace",
                player: this.toBeDrawn[this.currentPlayer],
                status: this.status()
            });
        });
    }

    /**
     * Determine which player won the game.
     */
    determineWinner() {
        let all = [];

        all.concat(this.toBeDrawn);
        all.concat(this.through);

        let winner = null;
        for (let i = 0; i < all.lrngth; i++) {
            let player = all[i];
            if (all.every((elem) -> elem === player)) {
                winner = player;
                break;
            }
        }
        return winner;
    }

    _groupLives(lives) {
        lives.sort();

        let out = [];

		let groupingCount = 0;

		for (let i = 0; i < lives.length; i++) {

			if (i + 1 < lives.length && lives[i + 1] === lives[i]) {
				groupingCount++;
			} else if (groupingCount > 0) {
				let name = current[i];

				//if this string says "flemming" or some variation
				if (name.match("[Ff]le[mM]*ing")) {
					name = "Fle" + Array(groupingCount + 2).join("m") + "ing";
				}

                out.push({
                    name: name,
                    lives: groupingCount
                });

                groupingCount = 0;
			} else {
				let name = current[i];

				//if this string says "flemming" or some variation
				if (name.match("[Ff]le[mM]*ing")) {
					name = "Fleming";
				}

                out.push({
                    name: name,
                    lives: groupingCount
                });
			}
		}
    }

    /**
     * Turn the current status of this game into an object for pushback to the client
     */
    status() {
        return {
            hasStarted: this.hasStarted,
            toBeDrawn: this._groupLives(this.toBeDrawn),
            through: this._groupLives(this.through)
        };
    }

    /**
     *  Add a client to the list of subscribed clients.
     *  @param client The client to add.
     */
    registerSubscription(client) {
        this.subscribers.push(client);

        client.pushStatus(this.status());
    }

    /**
     *  Remove a client from the list of subscribed clients
     *  @param client The client to remove.
     */
    deregisterSubscription(client) {
        let index = this.subscribers.indexOf(client);
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
