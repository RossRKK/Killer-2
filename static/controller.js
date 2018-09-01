
var controller = (function () {
    function init() {
        $("#addPlayer").on("submit",function(e) {
		    e.preventDefault(); // cancel the actual submit
				addPlayer();
		});

        $("#noLives").on("change", function(e) {
            view.render();
        });

		$("#rulesTitle").click(function(e) {
	    	e.preventDefault();
			$("#rules").toggle();
			if (rulesOpen) {
				$("#rulesTitle").empty();
				$("#rulesTitle").append("(expand)");
				rulesOpen = false;
			} else {
				$("#rulesTitle").empty();
				$("#rulesTitle").append("(collapse)");
				rulesOpen = true;
			}
		});
    }

    function bindListHandlers() {
        $(".remove").click(function (e) {
			model.remove(e.currentTarget.dataset.player, e.currentTarget.dataset.through === "true");
		});

		$(".putThrough").click(function (e) {
			model.putThrough(e.currentTarget.dataset.player);
		});

		$(".demote").click(function (e) {
			model.demote(e.currentTarget.dataset.player);
		});
    }

    //Add a player to the game
	function addPlayer() {
		var p = $("#add").val();
		if (p) {
			model.addPlayer(p);
		} else {
			alert("The player field is required");
		}
	}

	//The player missed
	function miss() {
		model.miss();
	}

	//The player potted
	function pot() {
		model.pot(0);
	}


	//Add Lives
	function addLives() {
		var lives = parseInt($("#lives").val())
		model.pot(lives);
	}

	function replace() {
		model.replace();
	}

	//Start the game
	function start() {
        var noLives = $("#noLives").val();
		model.start(noLives);
	}

    function newGame() {
        model.newGame().done(function (gameId) {
            model.init(gameId);
            view.gameId(gameId);
        });

        model.enableControls();
    }

    function joinGame() {
        var gameId = $("#gameIdIn").val();
        model.init(gameId);
        view.gameId(gameId);

        model.disableControls();
    }

    function toggleControlsClick() {
        model.toggleControls();
    }

    return {
        init: init,
		start:  start,
		pot: pot,
		miss: miss,
		replace: replace,
		addLives: addLives,
        bindListHandlers: bindListHandlers,
        newGame: newGame,
        joinGame: joinGame,
        toggleControlsClick: toggleControlsClick,
	}
}());
