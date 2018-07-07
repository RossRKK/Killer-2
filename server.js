/**
 * The "main" code loads the required frameworks, sets up the
 * Express middleware for handling API endpoints and WebSocket
 * communication. It then uses middlewares for handling HTTP
 * BasicAuth and serving static files. The application will
 * listen on port 8080.
 *
 * It also loads the API and model modules and intialises them.
 */
let express = require('express');
let app = express();
let bodyParser = require("body-parser");
let expressWs = require('express-ws')(app);
let auth = require('basic-auth');

// require the Tron model and intialise it.
let modelModule = require('./model.js');
let model = new modelModule.Model();
let controller = require('./controller.js');

controller.init(model);

app.use(bodyParser.json());

//start a new game
app.post("/newgame", controller.newGame);

// handle incoming WebSocket connections
app.ws('/:gameId', function(ws, req) {
    //TODO connect to the game
    let gameId = req.param.gameId;
    let game = model.getGame(gameId);

    game.registerSubscription(ws);
    ws.game = game;

    console.log("Client has connected to game " + gameId);

    ws.on("close", function () {
        //handle socket close, unregister subscriptions
        ws.game.deregisterSubscription(ws);
    });

    ws.on('message', function(msg) {
        controller.ws.handleMessage(ws, JSON.parse(msg));
    });
});


app.use(express.static('static'));

// Log any server-side errors to the console and send 500 error code.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("500 Internal Server Error\n" + err.message);
});


app.listen(8080);
console.log('Server running, access game by going to http://localhost:8080');
