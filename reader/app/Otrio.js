const MaxSeconds = 1; //Maximum time to receive the correct response

/**
*	Otrio's constructor
*/
function Otrio(){
	this.counter = 0; //Counts the time
	this.responseReceived = false;
	this.waitingResponse = false;
	this.client = new Client("Starting Otrio ..."); //Initiates the client
}

Otrio.prototype.constructor = Otrio;

//Gets the player's movements
Otrio.prototype.getPlayerMove = function(board, line, column, pair, player, mv, mv2){
	var otrio = this;
	this.waitingResponse = true;
	
	//Prolog request to receive the information about the predicate "next_cicle"
	this.client.getPrologRequest("next_cicle(" + board + "," + line + "," + column + "," +  pair + "," 
								+ player + "," + mv + "," + mv2 + ")", function(data) {	
		otrio.playerMove = data.target.response;
		otrio.waitingResponse = false;
		otrio.responseReceived = true;
	});
}

//Gets the computer's movements
Otrio.prototype.getComputerMove = function(difficulty, board, mV, player, mV2) {
	var otrio = this;
	this.waitingResponse = true;

	//Prolog request to receive the information about the predicate "e_play"
	this.client.getPrologRequest("e_play(" + difficulty + "," + board + "," + mV + "," + player
								+ "," + mV2 + ")", function(data) {
		otrio.computerPlaying = data.target.response;
		otrio.waitingResponse = false;
		otrio.responseReceived = true;
	});
}

//Gets the end game
Otrio.prototype.getEndGame = function(board, player) {
	var otrio = this;
	this.waitingResponse = true;

	//Prolog request to receive the information about the predicate "end_game"
	this.client.getPrologRequest("end_game(" + board + "," + player + ")", function(data) {
		otrio.endGame = data.target.response;
		otrio.waitingResponse = false;
		otrio.responseReceived = true;
	});
}