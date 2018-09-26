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
        this.ws.send(JSON.stringify(evt));
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
    constructor(id, m) {
        this.id = id;
        this.model = m;


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
            let curPlayer = this.toBeDrawn[this.currentPlayer];
            //add a player to the game that has alreay started
            this.toBeDrawn.push(name);

            //it is necessary to call replace, as the currentPlayer index
            //will now be wrong
            //this.replace();
            this.restoreDrawnPlayer(curPlayer);
        } else {
            //add a player to the list of players who will be in the game
            this.players.push(name);
            this.players.sort();
        }

        //inform the subsribers of the start of the game
        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "addPlayer",
                status: this.status()
            });
        });
    }

    /**
     * Start the game.
     */
    start(lives) {
        this.hasStarted = true;

        //add lives for each player
        this.players.forEach((player) => {
            for (let i = 0; i < lives; i++) {
                this.toBeDrawn.push(player);
            }
        });

        //inform the subsribers of the start of the game
        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "start",
                status: this.status()
            });
        });

        this.draw();
    }

    /**
     * Randomly draw a new player.
     */
    draw() {
        let winner = this.determineWinner();
        if (winner) {
            //inform the players that a player has won
            this.subscribers.forEach((sub) => {
                sub.pushEvent({
                    type: "win",
                    player: winner,
                    status: this.status()
                });
            });
        } else {
            if (this.toBeDrawn.length > 0) {
                //select a random player from the to be drawn de

    			this.currentPlayer = Math.floor(Math.random() * this.toBeDrawn.length);

                //increment the draw counter
                this.drawCount++;

                //inform the players that a player was drawn
                this.subscribers.forEach((sub) => {
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
    		} else if (this.losers.length > 0){
    			//No one is through, reset the round
    			this.toBeDrawn = this.losers;
    			this.losers = [];

                //inform the clients that the round was reset
                this.subscribers.forEach((sub) => {
                    sub.pushEvent({
                        type: "reset",
                        status: this.status()
                    });
                });

                //increment the round count
                this.roundCount++;

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
        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "redraw",
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
    	    this.toBeDrawn.splice(this.currentPlayer, 1);
    	}

        //push back the new status of the game
        this.subscribers.forEach((sub) => {
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
    	    this.toBeDrawn.splice(this.currentPlayer, 1);
    	}

        this.subscribers.forEach((sub) => {
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
        this.currentPlayer = Math.floor(Math.random() * this.toBeDrawn.length);

        //inform the subscribers of the event
        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "draw",
                player: this.toBeDrawn[this.currentPlayer],
                status: this.status()
            });
        });
    }

    restoreDrawnPlayer(player) {
        this.currentPlayer = this.toBeDrawn.indexOf(player);

        //if the operation performed removed the last instance of that player
        //do a replace
        if (this.currentPlayer === -1) {
            this.replace();
        }
    }

    /**
     * Determine which player won the game.
     */
    determineWinner() {
        let all = [];

        this.toBeDrawn.forEach((player) => all.push(player));
        this.through.forEach((player) => all.push(player));

        //if no one is through then we have to count the losers as well
        if (this.through.length === 0) {
            this.losers.forEach((player) => all.push(player));
        }

        console.log(all);

        if (all.length > 0) {
            let winner = all[0];

            for (let i = 1; i < all.length; i++) {
                let player = all[i];
                if (all[i] !== winner) {
                    return null;
                }
            }
            return winner;
            console.log(winner);
        }
        console.log("No winner");
    }

    _groupLives(lives) {
        lives = lives.slice();
        lives.sort();

        let out = [];

		let groupingCount = 0;

		for (let i = 0; i < lives.length; i++) {

			if (i + 1 < lives.length && lives[i + 1] === lives[i]) {
				groupingCount++;
			} else if (groupingCount > 0) {
				let name = lives[i];

				//if this string says "flemming" or some variation
				if (name && name.match("[Ff]le[mM]*ing")) {
					name = "Fle" + Array(groupingCount + 2).join("m") + "ing";
				}

                out.push({
                    name: name,
                    lives: groupingCount + 1
                });

                groupingCount = 0;
			} else {
				let name = lives[i];

				//if this string says "flemming" or some variation
				if (name && name.match("[Ff]le[mM]*ing")) {
					name = "Fleming";
				}

                out.push({
                    name: name,
                    lives: groupingCount + 1
                });
			}
		}

        return out;
    }

    /**
     * Turn the current status of this game into an object for pushback to the client
     */
    status() {
        return {
            drawn: this.toBeDrawn[this.currentPlayer],
            hasStarted: this.hasStarted,
            toBeDrawn: this._groupLives(this.toBeDrawn),
            through: this._groupLives(this.through),
            players: this.players,
        };
    }

    /**
     *  Add a client to the list of subscribed clients.
     *  @param client The client to add.
     */
    registerSubscription(client) {
        this.subscribers.push(client);

        client.game = this;

        client.pushEvent({
            type: "subscribe",
            status: this.status()
        });
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

        //remove the game if no one is playing anymore
        if (this.subscribers.length === 0) {
            this.model.disposeGame(this.id);
        }
    }

    remove(player, through) {
        try {
            if (this.hasStarted) {
                if (through) {
                    let index = this.through.indexOf(player);
                    //remove the player from the list
            	    this.through.splice(index, 1);
                } else {
                    let curPlayer = this.toBeDrawn[this.currentPlayer];
                    let index = this.toBeDrawn.indexOf(player);
                    //remove the player from the list
            	    this.toBeDrawn.splice(index, 1);

                    //it is necessary to call replace, as the currentPlayer index
                    //will now be wrong
                    //this.replace();
                    this.restoreDrawnPlayer(curPlayer);
                }
            } else {
                let index = this.players.indexOf(player);
                //remove the player from the list
                this.players.splice(index, 1);
            }
        } catch (e) {}

        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "admin",
                status: this.status()
            });
        });
    }

    putThrough(player) {
        try {
            let curPlayer = this.toBeDrawn[this.currentPlayer];
            let index = this.toBeDrawn.indexOf(player);
            //remove the player from the list
    	    this.toBeDrawn.splice(index, 1);

            //it is necessary to call replace, as the currentPlayer index
            //will now be wrong
            //this.replace();
            this.restoreDrawnPlayer(curPlayer);
        } catch (e) {}

        this.through.push(player);

        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "admin",
                status: this.status()
            });
        });
    }

    demote(player) {
        try {
            let index = this.through.indexOf(player);
            //remove the player from the list
    	    this.through.splice(index, 1);
        } catch (e) {}
        let curPlayer = this.toBeDrawn[this.currentPlayer];
        this.toBeDrawn.push(player);

        //it is necessary to call replace, as the currentPlayer index
        //will now be wrong
        //this.replace();

        this.restoreDrawnPlayer(curPlayer);

        this.subscribers.forEach((sub) => {
            sub.pushEvent({
                type: "admin",
                status: this.status()
            });
        });
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
        let id = this.genId();
        let game = new model.Game(id, this);

        this.games[id] = game;

        return game;
    }

    genId() {
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (var i = 0; i < 5; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
    }

    getGame(id) {
        return this.games[id.toUpperCase()];
    }

    disposeGame(id) {
        //wait a minute before disposing
        setTimeout(() => {
            if (this.games[id] && this.games[id].subscribers.length === 0) {
                delete this.games[id];
            }
        }, 600000);
    }
};
