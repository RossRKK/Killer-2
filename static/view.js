"use strict";

var rulesOpen = false;

var view = function () {
	var prevStatus;

	function init() {
		$("#game").hide();
		$("#curDraw").hide();
		$("#rules").hide();

		$("#game").hide();
		$("#chooseGame").show();
		$("#start").show();
	}

	function start() {
		$("#start").fadeOut();
		$("#curDraw").fadeIn();
		$("#lifeCount").hide();
	}

	function listLives(player, through) {
		$("#players").append("<tr><td><div class=\"player\">" + player.name + " (" + player.lives + ")</td><td><button class=\"" + (through ? "demote" : "putThrough") + " control btn btn-default\" data-player=\"" + player.name + "\">" + (through ? "Demote" : "Put Through") +
		"</button><button class=\"control remove btn btn-default\" data-player=\"" + player.name + "\" data-through=\"" + through + "\">X</button></div></td></tr>");
	}

	//Re-render the page
	function render(status, controlEnabled) {
		if (status) {
			prevStatus = status;
		} else {
			status = prevStatus;
		}

        //ensure that the currently drawn player is up to data
        //do'nt animate since it's probably right
        $("#player").empty();
        $("#player").append(status.drawn);

		$("#players").empty();
		if (status.hasStarted) {

			$("#players").append("<h3>To Be Drawn: " + status.toBeDrawn.length + "</h3><table>")

			status.toBeDrawn.forEach(function (player) { listLives(player, false) });

			$("#players").append("</table><h3>Through: " + status.through.length + "</h3><table>")

			status.through.forEach(function (player) { listLives(player, true) });

			$("#players").append("</table>");
		} else {
			$("#players").append("<h3>Players: " + status.players.length +
			" (" + ($("#noLives").val() * status.players.length)  + " lives)</h3><table>");

			status.players.forEach(function (player) {
				$("#players").append("<tr><td><div class=\"player\">" + player + "</div></td><td><button class=\"remove btn btn-default\" data-player=\"" + player + "\">X</button></td></tr>");
			});
			$("#players").append("</table>");
		}

		controller.bindListHandlers();

        controlEnabled ? enableControls() : disableControls();
	}

	function draw(player) {
		$("#player").fadeOut(400, "swing", function () {
			$("#player").empty();
			$("#player").append(player);
			$("#player").fadeIn();
		});
	}

	function winner(player) {
		$("#player").fadeOut(400, "swing", function () {
			$("#player").empty();
			$("#player").append("The winner is: " + player);
			$("#player").fadeIn();
		});
	}

	function redraw() {
		alert("Redraw");
	}

	function reset() {
		alert("Reset");
	}

	function gameId(id) {
		$("#gameId").text(id);
		$("#game").show();
		$("#chooseGame").hide();

		//make it easy to reload this game if the connection times out
		$("#gameIdIn").val(id);
	}

    function disableControls() {
        $(".control").hide();
    }

    function enableControls() {
        $(".control").show();
    }

	return {
		init: init,
		start:  start,
		draw: draw,
		render: render,
		redraw: redraw,
		reset: reset,
		winner: winner,
		gameId: gameId,
        disableControls: disableControls,
        enableControls: enableControls,
	}
}();
