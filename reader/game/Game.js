//Game's status
var GameState = {
    Menu : 0,
    CameraToP2 : 1,
    Player1 : 2,
    CameraToP1 : 3,
    Player2 : 4,
    EndGame : 5
};

//Maximum number of undos
const MAX_UNDOS = 1;

//Number of seconds that the player has to play before changing to the other player
const MAX_TIME = 5;

/**
 *  Game's constructor
 */
function Game(scene, materialBoard, materialPieces1, materialPieces2) {
    this.scene = scene;
    this.replay = false;

    this.materialBoard = materialBoard;
    this.materialPieces1 = materialPieces1;
    this.materialPieces2 = materialPieces2;

	this.otrio = new Otrio();

    this.cameraAnimation = null;
    this.cameraFirstAnimation = true;

	this.material = new CGFappearance(this.scene);

    this.init();
};

//Initiates the game
Game.prototype.init = function() {
    this.initGame();

    this.gameState = GameState.Menu;
    this.gameSequence = new GameSequence(this);
    this.currMove = new GameMove( this.player1 );

    this.nUndos = 0;
    this.animateCamera();
};

//Initiates the players, tiles, pieces and game sequence
Game.prototype.initGame = function() {
    tileId = 1;
    pieceId = 1;
    this.gameBoard = new GameBoard(this.scene, this.materialBoard);
    this.player1 = new Player(this.scene, 1, PlayerMode.Player, PlayerState.ChoosePiece, [0, 0, -5], this.materialPieces1);
    this.player2 = new Player(this.scene, 2, PlayerMode.Player, PlayerState.Wait, [0, 0, 5], this.materialPieces2);

    if( this.gameSequence )
        this.gameSequence.updateSequence();
};

//Reset function
Game.prototype.reset = function() {
    this.resetGame();

    this.gameState = GameState.Menu;
    this.gameSequence = new GameSequence(this);
    this.currMove = new GameMove( this.player1 );

    this.nUndos = 0;
    this.animateCamera();
};

//Resets the game
Game.prototype.resetGame = function() {
    tileId = 1;
    pieceId = 1;
    this.gameBoard.init();
    this.player1.reset(PlayerState.ChoosePiece);
    this.player2.reset(PlayerState.Wait);

    if( this.gameSequence )
        this.gameSequence.updateSequence();
}

//Loads the animated camera
Game.prototype.onGraphLoaded = function() {
    this.cameraAnimation = new CameraAnimate(this.scene.camera);
};

/**
 *  INTERFACE
 */
 
//Changes the game's buttons
Game.prototype.changeButtons = function() {
    switch(this.gameState) {
        case GameState.Menu:
        case GameState.EndGame:
            this.menuButtons();
            break;
        case GameState.CameraToP2:
        case GameState.CameraToP1:
        case GameState.Player1:
        case GameState.Player2:
            this.gameButtons();
            break;
    }
};

//Creates the main menu's buttons
Game.prototype.menuButtons = function() {
    if( this.undoButton )
        this.scene.myInterface.gui.remove(this.undoButton);
    if( this.replayButton )
        this.scene.myInterface.gui.remove(this.replayButton);
    if( this.quitButton )
        this.scene.myInterface.gui.remove(this.quitButton);

    this.playButton = this.scene.myInterface.gui.add(this.scene.game,'play').name("Play Game");
	
    this.modePlayer1 = this.scene.myInterface.gui.add(this.scene.game.player1, 'playerMode', PlayerMode).name("Player 1 Mode");
	this.modePlayer2 = this.scene.myInterface.gui.add(this.scene.game.player2, 'playerMode', PlayerMode).name("Player 2 Mode");
};

//Creates the game's buttons
Game.prototype.gameButtons = function() {
    if( this.playButton )
        this.scene.myInterface.gui.remove(this.playButton);
    if( this.modePlayer1 && this.modePlayer2 ){
		this.scene.myInterface.gui.remove(this.modePlayer1);
		this.scene.myInterface.gui.remove(this.modePlayer2);
	}

    this.undoButton = this.scene.myInterface.gui.add(this.scene.game,'undoMove').name("Undo");
    this.replayButton = this.scene.myInterface.gui.add(this.scene.game, 'playReplay').name("Replay");
    this.quitButton = this.scene.myInterface.gui.add(this.scene.game,'quit').name("Quit");
};

/**
 *  MISC
 */
 
//Creates the game's history
Game.prototype.logHistory = function() {
    this.gameSequence.show();
};

//Sets the texture's coordinates (in this case this function does nothing)
Game.prototype.setTexCoords = function(length_t, length_s){
};

/**
 *  UPDATE
 */

//Updates the game
Game.prototype.update = function(dSec){
    var isWaiting = this.checkRequests(dSec);
    this.updateCamera(dSec);
    this.updateAnimations(dSec);
    if( !isWaiting && !this.replay)
    //If is waiting then don't countdown
	    this.changeTime(dSec);
};

//Verifies the player turn time
Game.prototype.changeTime = function(dSec){
    if( ( this.gameState != GameState.Player1 && this.gameState != GameState.Player2 ) ||
            this.currMove.player.state > PlayerState.TileConfirmation ||
            this.replay )
        return ;

    var tmp = this.timeCounter - dSec;

    if(tmp < 0) {
        //Mudar Player
        this.changeMessageTime(0);
        this.changePlayer();
        return ;
    }

    if( Math.ceil(this.timeCounter) != Math.ceil(tmp) )
        this.changeMessageTime(tmp);

    this.timeCounter = tmp;
}

//Checks the prolog requests
//Returns if the player is waiting for a server response
Game.prototype.checkRequests = function(dSec) {
    if( !this.otrio.waitingResponse && this.otrio.responseReceived ) {
        this.changeMessageTime(this.timeCounter);
        this.receivedResponse();
    } else if( this.otrio.waitingResponse ) {
        this.otrio.counter += dSec;

        if( this.otrio.counter > MaxSeconds ) {    
            this.otrio.counter = 0;

            this.responseReceived = false;
            this.waitingResponse = false;

            this.changeMessage("Connection lost");
			
            // Try again
            this.request();
        }

        return true;
    }
    return false;
};

//Updates the camera
Game.prototype.updateCamera = function (dSec) {
    if( (   this.gameState == GameState.Menu || 
            this.gameState == GameState.EndGame || 
            this.gameState == GameState.CameraToP2 || 
            this.gameState == GameState.CameraToP1 ) 
        &&  this.cameraAnimation != null ) {

        this.cameraAnimation.update(dSec);

        if( this.cameraAnimation.lastFrame )
            this.animateCamera();
    }
};

//Updates the animations
Game.prototype.updateAnimations = function(dSec) {
    if( this.currMove.piece && this.currMove.piece.animation ) {
        
        this.currMove.piece.animation.update(dSec);

        if( this.currMove.piece.animation.lastFrame )
            this.onAnimationEnd();
    }
};



/**
 *  GAME MECHANICS
 */
 
//Play game
Game.prototype.play = function() {
    this.changeState();
    this.changeButtons();
    this.cameraAnimation.lastFrame = true;
};

//Quit game
Game.prototype.quit = function() {
    if( this.gameState == GameState.CameraToP1 ||
        this.gameState == GameState.CameraToP2 )
        return ;

    this.reset();
    this.changeButtons();
    this.cameraAnimation.lastFrame = true;
    this.changeMessage("");
};

//End game
Game.prototype.end = function() {
    this.reset();
    this.changeButtons();
    this.cameraAnimation.lastFrame = true;
};

//Replay the whole game
Game.prototype.playReplay = function() {
    if( this.gameSequence.sequence.length == 0 ||
        this.currMove.player.playerMode != PlayerMode.Player || 
        this.currMove.player.state > PlayerState.TileConfirmation ||
        this.gameState == GameState.CameraToP1 ||
        this.gameState == GameState.CameraToP2 ) 
        return ;

    this.storeMove = this.currMove.copy();

    this.resetGame();
    this.replay = true;
    this.gameSequence.replay();

    this.currMove.reset();
    if( this.gameSequence.sequence[0].player.id == 1 ) {
        this.currMove.player = this.player1;
        this.gameState = GameState.CameraToP1;
    } else {
        this.currMove.player = this.player2;
        this.gameState = GameState.CameraToP2;
    }

    this.changeMessage("REPLAY");
};

//Ends the replay
Game.prototype.endReplay = function() {
    this.replay = false;
    this.storeMove.updateMove(this);

    this.changeMessageTime(this.timeCounter);

    if( this.currMove.player.id == this.storeMove.player.id ) {
        this.currMove = this.storeMove.copy();
        this.currMove.player.state = PlayerState.ChoosePiece;
        this.nextMove();
    } else
        this.changeState();
};

//Gets the current player
Game.prototype.getCurrPlayer = function() {
    var player;

    if( this.player1.state != PlayerState.Wait )
        player = this.player1;
    else 
        player = this.player2;

    return player;
};

//Changes the player's state
Game.prototype.changePlayerState = function() {
    this.currMove.player.changeState();

    if( this.currMove.player.state == PlayerState.EndGame ) {
        if( this.replay )
            this.changeState();
        else
            this.request();
        return ;
    } else if( this.currMove.player.state == PlayerState.PieceAnimation ) {
        this.animatePiece();
        return ;
    }
    
    if( !this.currMove.auto )
        return ;

    if(this.currMove.player.state == PlayerState.ChooseTile) {
        // Choose given tile
        this.chooseTile(this.currMove.tileDst);
        this.gameBoard.selectTile(null);
        // Confirmed tile
        this.currMove.player.changeState();

        //Add animation to the piece
        this.pieceToBoard();
    }
};

//Changes the game's state
Game.prototype.changeState = function() {

    switch( this.gameState ) {
        case GameState.Menu:
            this.gameState = GameState.CameraToP1;
            break;
        case GameState.Player1:
        case GameState.Player2:

            if( this.replay && !this.nextReplay() )
                    return ;

            if( this.gameState == GameState.Player1 ) {
                this.gameState = GameState.CameraToP2;
                var p1 = PlayerState.Wait;
                var p2 = PlayerState.ChoosePiece;
            } else {
                this.gameState = GameState.CameraToP1;
                var p1 = PlayerState.ChoosePiece;
                var p2 = PlayerState.Wait;
            }

            this.player1.state = p1;
            this.player2.state = p2;

            this.currMove.reset();
            this.currMove.player = this.getCurrPlayer();
            this.currMove.auto = false;
            this.nUndos = 0;

            break;

        case GameState.CameraToP1:
        case GameState.CameraToP2:

            if( this.gameState == GameState.CameraToP1 )
                this.gameState = GameState.Player1;
            else
                this.gameState = GameState.Player2;

            this.timeCounter = MAX_TIME;
            if( !this.replay )
                this.changeMessageTime(this.timeCounter);

            this.nextMove();

            break;

        case GameState.EndGame:
            this.gameState = GameState.Menu;
            break;
        default:
            return;
    }
};

//Changes the current player
Game.prototype.changePlayer = function() {
    this.gameBoard.selectTile(null);
    this.currMove.revertTile();
    this.currMove.revertPiece();

    // Reset player states
    if( this.currMove.player.id == this.player1.id ) {
        // Change game state
        this.changeState();
        this.player1.state = PlayerState.Wait;
        this.player2.state = PlayerState.ChoosePiece;
    } else {
        // Change game state
        this.changeState();
        this.player2.state = PlayerState.Wait;
        this.player1.state = PlayerState.ChoosePiece;
    }

    // Reset currMove
    this.currMove.reset();
    this.currMove.player = this.getCurrPlayer();
};

//Player's next move
Game.prototype.nextMove = function() {
    // Move on to the next move on the sequence
    if( this.replay ) {
        this.replayMove();
        return ;
    }

    // Wait for input if player mode is player
    if( this.currMove.player.playerMode == PlayerMode.Player )
        return ;

    // If it's computer then request a play to the prolog program
    this.request();
};

//Calculates what should happen on the next fase of the replay
//Returns true if it should change players
Game.prototype.nextReplay = function() {
    if( this.gameSequence.sequence.length <= this.gameSequence.replayIndexMove + 1 ) {
        // End the replay
        this.endReplay();
    }
    else if( this.gameSequence.sequence.length > this.gameSequence.replayIndexMove + 1 &&
        this.gameSequence.sequence[this.gameSequence.replayIndexMove + 1].player.id == this.currMove.player.id ) {
        // Keep the camera on the player if the next move was made by the same one
        this.currMove.player.state = PlayerState.ChoosePiece;

        this.nextMove();
    } else
        return true;
    return false;
};

//Undo the piece movement
Game.prototype.undoMove = function() {
    if( this.currMove.player.state > PlayerState.PieceToTile ) {
        // At this point the player can't undo anything
        return ;
    } else if( this.currMove.player.state > PlayerState.PieceConfirmation ) {
        // Undo the current move (deselect piece)
        this.currMove.player.state = PlayerState.ChoosePiece;
        this.gameBoard.selectTile(null);
        this.currMove.revertPiece();
        this.currMove.revertTile();
    } else {
        if( this.nUndos >= MAX_UNDOS )
            return ;
        if( this.gameSequence.undoMove(this.currMove.player) )
            this.nUndos++;
    }
};

//Picks the object
Game.prototype.pickObj = function(obj) {
    if( this.currMove.player.state == PlayerState.TileConfirmation )
        this.confirmTile(obj);
    else if( this.currMove.player.state == PlayerState.ChooseTile )
        this.chooseTile(obj);
    else
        if( this.currMove.player.pickPiece(obj, this.currMove) )
            this.changePlayerState();
};

//Confirms the tile selected
Game.prototype.confirmTile = function(obj) {
    if( this.otrio.waitingResponse || this.otrio.receivedResponse )
        return ;

    //Check if selected tile is the same as the one that was confirmed
    if( obj.id == this.currMove.tileDst.id ) {
        this.request();

    //If the tile is not the same then go back to choosing a tile
    } else {
        this.currMove.player.state = PlayerState.ChooseTile;
        this.gameBoard.selectTile(null);
    }
};

//Chooses the tile to be selected
Game.prototype.chooseTile = function(tile) {
    this.gameBoard.selectTile(tile);
    this.currMove.player.changeState();
    this.currMove.tileDst = tile;
};

//Automaticly plays a given move
Game.prototype.autoPlay = function(move) {
    this.currMove = move.copy();
    this.currMove.auto = true;

    // Select piece
    this.currMove.player.changeState();

    // And confirm it
    this.currMove.player.changeState();
    this.currMove.removePiece();

    // Let the animation run
    this.animatePiece();
};

//Replays the movements from game sequence
Game.prototype.replayMove = function() {
    var move = this.gameSequence.nextReplayMove();
    if( move == null )
        this.endReplay();
    else 
        this.autoPlay(move);
};

/**
 *  ANIMATIONS
 */
 
//Animates the piece selected
Game.prototype.animatePiece = function () {
    var oldCenter = this.currMove.player.pieces.coords.slice();
    oldCenter[1] += 0.15;
    var newCenter = this.currMove.player.pieces.coords.slice();

    var oldCoords = this.currMove.player.pieces.getTileCoords(this.currMove.tileSrc.id);
    oldCoords[1] += 0.15;
    var newCoords = this.currMove.player.pieces.getTileCoords(this.currMove.tileSrc.id);

    newCenter[1] += 1.0;
    newCoords[1] += 1.0;

    var c1 = new AnimationInfo(oldCenter, oldCoords, [1, 1, 1]);
    var c2 = new AnimationInfo(newCenter, newCoords, [1, 1, 1]);

    this.currMove.piece.animation = new CompleteAnimation("mvPiece", [c1, c2], 0.2);
};

//Puts the piece on the board
Game.prototype.pieceToBoard = function () {
    var oldCenter = this.currMove.player.pieces.coords.slice();
    oldCenter[1] += 1;
    var middleCenter = [0, 1.2, 0];
    var newCenter = [0, 0.2, 0];

    var oldCoords = this.currMove.player.pieces.getTileCoords(this.currMove.tileSrc.id);
    oldCoords[1] += 1;
    var middleCoords = this.gameBoard.getTileCoords(this.currMove.tileDst.id);
    middleCoords[1] += 1;
    var newCoords = this.gameBoard.getTileCoords(this.currMove.tileDst.id);

    var c1 = new AnimationInfo(oldCenter, oldCoords, [1, 1, 1]);
    var c2 = new AnimationInfo(middleCenter, middleCoords, [sizeTile, sizeTile, 1]);
    var c3 = new AnimationInfo(newCenter, newCoords, [sizeTile, sizeTile, 1]);

    this.currMove.piece.animation = new CompleteAnimation("mvPiece", [c1, c2, c3], 1);
};

//Verifies what player state to after create the respetive animation
Game.prototype.onAnimationEnd = function () {
    if( this.currMove.player.state == PlayerState.PieceAnimation ) 
        this.changePlayerState();

    else if( this.currMove.player.state == PlayerState.PieceToTile ) {
        this.currMove.moveTile();
        if( !this.replay )
            this.gameSequence.addMove(this.currMove);
        this.changePlayerState();
    }
};

//Player's camera animation
Game.prototype.animateToPlayer = function() {
    if( this.cameraFirstAnimation ) {
        // Translate
        // Get new coords
        var nTarget = this.currMove.player.pieces.coords.slice();
        nTarget[2] /= 2;
        var nPosition = this.cameraAnimation.position.slice();
        nPosition[0] += nTarget[0] - this.cameraAnimation.target[0];
        nPosition[1] += nTarget[1] - this.cameraAnimation.target[1];
        nPosition[2] += nTarget[2] - this.cameraAnimation.target[2];

        this.cameraAnimation.setTranslate(nPosition, nTarget, 0.3);

        this.cameraFirstAnimation = false;

    } else if( this.cameraAnimation.translate ) {
        // Rotate
        var angle = Math.atan((this.cameraAnimation.position[2] - this.cameraAnimation.target[2]) / 
                                (this.cameraAnimation.position[0] - this.cameraAnimation.target[0]));
        var desiredAngle = this.currMove.player.id == this.player1.id ? -Math.PI / 2 : Math.PI / 2;
        var rotateAngle = this.cameraAnimation.position[0] < 0 ? angle + desiredAngle : angle - desiredAngle;

        this.cameraAnimation.setRotate([0, 0, 1], rotateAngle, 0.2);
    } else {
        // End
        this.changeState();

        this.cameraFirstAnimation = true;
    }
};

//Game's camera
Game.prototype.gameCamera = function() {
    if( this.cameraAnimation.target[0].toFixed(5) != 0 || 
        this.cameraAnimation.target[1].toFixed(5) != 0.2 ||
        this.cameraAnimation.target[2].toFixed(5) != 0 ) {

        var nTarget = [0, 0.2, 0];
        var nPosition = this.cameraAnimation.position.slice();
        nPosition[0] += nTarget[0] - this.cameraAnimation.target[0];
        nPosition[1] += nTarget[1] - this.cameraAnimation.target[1];
        nPosition[2] += nTarget[2] - this.cameraAnimation.target[2];

        this.cameraAnimation.setTranslate(nPosition, nTarget, 0.25);    
    } else
        this.cameraAnimation.setRotate([0, 0, 1], Math.PI * 2, 8);
}

//Animates the game's camera
Game.prototype.animateCamera = function() {
    if( this.cameraAnimation == null )
        return ;

    switch( this.gameState ) {
        case GameState.Menu:
        case GameState.EndGame:
            this.gameCamera();
            break;
        case GameState.CameraToP1:
        case GameState.CameraToP2:
            this.animateToPlayer();
            break;
    }
};



/**
 *  SCORE MESSAGES
 */

//Increments the player's score
Game.prototype.incrementScore = function() {
    if( this.currMove.player.id == 1 ) {
        var element = document.getElementById("Player1Score");
        var score = parseInt(document.getElementById("Player1Score").innerHTML);
    } else {
        var element = document.getElementById("Player2Score");
        var score = parseInt(document.getElementById("Player2Score").innerHTML);
    }

    element.innerHTML = (score+1) + "";
};

//Changes the message with the score or the player's time
Game.prototype.changeMessageTime = function(secs) {    
    var time = Math.ceil(secs);

    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    
    var messageMin = minutes < 10 ? "0" + minutes : minutes;
    var messageSec = seconds < 10 ? "0" + seconds : seconds;
    var messageTime = messageMin + ":" + messageSec;

    this.changeMessage(messageTime);
};

//Changes the message with the score or the player's time
Game.prototype.changeMessage = function(message) {
    var statusElem = document.getElementById("StatusMessage");
    statusElem.innerHTML = message;
};

/**
 *  PROLOG VALIDATIONS
 */

/**
*  -> MAKE REQUESTS
*/

//Makes the different requests
Game.prototype.request = function() {
    if( this.replay )
        return ;

    switch( this.currMove.player.state ) {
        case PlayerState.TileConfirmation:
            this.playerMove();
            break;
		case PlayerState.ChoosePiece:
            this.computerMove();
			break;
		case PlayerState.EndGame:
			this.endGame();
			break;
		case PlayerState.ChangeTurn:
			this.changeTurn();
			break;
    }
};

//Player's movement request
Game.prototype.playerMove = function() {
    // Get board as array and stringify it to send it to the prolog predicate
    var board = this.gameBoard.boardToString();

    var position = this.gameBoard.getTilePos(this.currMove.tileDst.id);
    var line = position[1];
    var column = position[0];

    var pair = this.currMove.piece.pieceToString();

    var player;
    if( this.currMove.player.id == 1 )
        player = 'r';
    else
        player = 'b';

    var mv = this.currMove.player.pieces.piecesToString();
    var player2 = this.currMove.player.id == 1 ? this.player2 : this.player1;
    var mv2 = player2.pieces.piecesToString();

    this.otrio.getPlayerMove(board, line, column, pair, player, mv, mv2);
};

//Computer's movement request
Game.prototype.computerMove = function() {
	// Get board as array and stringify it to send it to the prolog predicate
    var board = this.gameBoard.boardToString();

    var difficulty;
    // Assume that player mode is not Player
    if( this.currMove.player.playerMode == PlayerMode.Easy )
        difficulty = 'easy';
    else
        difficulty = 'hard';

    var player;
    if( this.currMove.player.id == 1 )
        player = 'r';
    else
        player = 'b';

    var mv = this.currMove.player.pieces.piecesToString();
    var player2 = this.currMove.player.id == 1 ? this.player2 : this.player1;
    var mv2 = player2.pieces.piecesToString();

    this.otrio.getComputerMove(difficulty, board, mv, player, mv2);
};

//End game request
Game.prototype.endGame = function() {
	// Get board as array and stringify it to send it to the prolog predicate
    var board = this.gameBoard.boardToString();
  
    var player;
    if( this.currMove.player.id == 1 )
        player = 'r';
    else
        player = 'b';

    this.otrio.getEndGame(board, player);
};

//Change turn request
Game.prototype.changeTurn = function() {
    // Get board as array and stringify it to send it to the prolog predicate
    var board = this.gameBoard.boardToString();

    var player;
    if( this.currMove.player.id == 1 )
        player = 'r';
    else
        player = 'b';
	
	//TO CONCLUDE
};

/**
*  -> RECEIVE RESPONSES
*/

//Receives the different messages
Game.prototype.receivedResponse = function() {
    switch( this.currMove.player.state ) {
        case PlayerState.TileConfirmation:
            // Only happens when the player is human
            this.playerMoveResponse();
            break;
		case PlayerState.ChoosePiece:
            // Only happens when the player is a computer
			this.computerMoveResponse();
			break;
        case PlayerState.EndGame:
            this.endGameResponse();
            break;
		case PlayerState.ChangeTurn:
			this.changeTurnResponse();
			break;
    }
    this.otrio.responseReceived = false;
    this.otrio.counter = 0;
};

//Receives the player's movement response
Game.prototype.playerMoveResponse = function() {
    // Received response
    var response = this.otrio.playerMove;
    response = response.substring(1, response.length - 1);
    response = response.split(',');


    for( var i = 0; i < response.length; i++ ) {
        var values = response[i].split(':');

        switch(values[0]) {
            case 'NPlayer':
                var newPlayer = values[1];
                break;
            case 'Rep':
                var replay = values[1];
                break;
        }
    }

    if( newPlayer == this.currMove.player.getColor() || replay == "true" )
        this.currMove.player.state = PlayerState.ChooseTile;
    else {
        this.changePlayerState();

        //Add animation to the piece
        this.pieceToBoard();
    }

    //Either way the game board shouldn't end this function with a selected tile
    this.gameBoard.selectTile(null);
};

//Receives the computer's movement response
Game.prototype.computerMoveResponse = function() {
    // Received response
    var response = this.otrio.computerPlaying;
    response = response.substring(1, response.length - 1);
    response = response.split(',');

    for( var i = 0; i < response.length; i++ ) {
        var values = response[i].split(':');
	
        switch(values[0]) {
			case 'Line':
				var line = values[1];
				break;
			case 'Column':
				var column = values[1];
				break;
			case 'Piece':
				var piece = values[1];
                if( piece == 's' )
                    piece = small;
                else if( piece == 'm' )
                    piece = medium;
                else
                    piece = large;
				break;
            case 'NPlayer':
                var newPlayer = values[1];
                break;
            case 'Rep':
                var replay = values[1];
                break;
        }
    }

    this.currMove.piece = this.currMove.player.pieces.getPieceType(piece);
    this.currMove.tileSrc = this.currMove.player.pieces.getTilePiece(this.currMove.piece.id);
    this.currMove.tileDst = this.gameBoard.getPosTile(line, column);
    this.currMove.auto = true;
    this.autoPlay(this.currMove);
};

//Receives the end game response
Game.prototype.endGameResponse = function() {
    // Received response
    var response = this.otrio.endGame;
    if( response == 'true' ) {
        this.incrementScore();
        this.changeMessage("PLAYER " + this.currMove.player.id + " WON");
        this.end();
    }
    else 
        this.changeState();
};


/**
*  -> DISPLAY FUNCTIONS
*/

//Register for pick function
Game.prototype.registerForPick = function() {
    if( this.gameState == GameState.EndGame || this.gameState == GameState.Menu ||
        // If it's a computer playing then don't register anything for pick
        this.currMove.player.playerMode != PlayerMode.Player ||
        this.replay )
        return ;

    if( this.currMove.player.state == PlayerState.ChoosePiece || 
        this.currMove.player.state == PlayerState.PieceConfirmation ) {
        this.currMove.player.pieces.registerForPick();
    }

    else if( this.currMove.player.state == PlayerState.ChooseTile || 
            this.currMove.player.state == PlayerState.TileConfirmation ) {
        this.gameBoard.registerForPick();
    }
};

//Displays the Game with the respective shader
Game.prototype.display = function(material){
    this.player1.pieces.display(material);
    this.player2.pieces.display(material);

    this.gameBoard.display();
    
    if( this.currMove.piece && this.currMove.piece.animation != null )
            this.currMove.piece.display();
};