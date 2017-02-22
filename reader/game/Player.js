//Different player's states
var PlayerState = {
    ChoosePiece : 0,
    PieceConfirmation : 1,
    PieceAnimation: 2,
    ChooseTile : 3,
    TileConfirmation : 4,
    PieceToTile : 5,
    EndGame : 6, 
    ChangeTurn : 7, 
    Wait : 8
};

//Different player's modes
var PlayerMode = {
	Player: 0,	
	Easy: 1,
	Hard: 2,
};

/**
*	Player's constructor
*/
function Player(scene, id, playerMode, state, coords, materialPieces) {
    this.scene = scene;
    this.state = state;
    this.id = id;
    this.playerMode = playerMode;

    this.pieces = new AuxiliarBoard(scene, coords, materialPieces);
    
    this.materialPieces = materialPieces;
};

//Resets the player's state and pieces
Player.prototype.reset = function(state) {
    this.state = state;
    this.pieces.init(this.materialPieces);
}

//Gets the player's color
Player.prototype.getColor = function() {
    return this.id == 1 ? 'r' : 'b';
}

/**
 *  GAME MECHANICS
 */

 //Changes the player's state
Player.prototype.changeState = function() {
    switch( this.state ) {
        case PlayerState.ChoosePiece:
            this.state = PlayerState.PieceConfirmation;
            break;
        case PlayerState.PieceConfirmation:
            this.state = PlayerState.PieceAnimation;
            break;
        case PlayerState.PieceAnimation:
            this.state = PlayerState.ChooseTile;
            break;
        case PlayerState.ChooseTile:
            this.state = PlayerState.TileConfirmation;
            break;
        case PlayerState.TileConfirmation:
            this.state = PlayerState.PieceToTile;
            break;
        case PlayerState.PieceToTile:
            this.state = PlayerState.EndGame;
            break;
        case PlayerState.EndGame:
            this.state = PlayerState.Wait;
            break;
        case PlayerState.ChangeTurn:
            this.state = PlayerState.Wait;
            break;
        case PlayerState.Wait:
            this.state = PlayerState.ChoosePiece;
            break;
    }
}

//Function that allows to pick a piece
Player.prototype.pickPiece = function(piece, move) {
    if( this.state == PlayerState.ChoosePiece )
        return this.choosePiece(piece, move);
    else if( this.state == PlayerState.PieceConfirmation )
        return this.confirmPiece(piece, move);
}

//Function that allows the player to choose a piece
Player.prototype.choosePiece = function (piece, move) {
    move.piece = piece;
    move.piece.selected = true;
    move.tileSrc = this.pieces.getTilePiece(piece.id);

    return true;
}

//Confirms the piece selected
Player.prototype.confirmPiece = function (piece, move) {
    move.piece.selected = false;

    //Second click should be on the wanted piece
    //If it's not then revert to the first state
    if( move.piece.id != piece.id ) {
        this.state = PlayerState.ChoosePiece;
        return false;
    }
    
    move.removePiece();

    return true;
}