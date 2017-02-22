/**
*	Game movements' constructor
*/
function GameMove(player, piece, tileSrc, tileDst) {
    this.player = player;
    this.piece = piece;
    this.tileSrc = tileSrc;
    this.tileDst = tileDst;

    this.auto = false;
}

//Resets the movement
GameMove.prototype.reset = function() {
    this.piece = null;
    this.tileSrc = null;
    this.tileDst = null;
}

//Moves piece to tile
GameMove.prototype.moveTile = function() {
    if( !this.tileDst.addPiece(this.piece) ) 
        throw new Error("Couldn't place piece on that position");
    this.piece.animation = null;
}

//Removes piece
GameMove.prototype.removePiece = function() {
    if( !this.tileSrc )
        return ;
    this.tileSrc.removePiece(this.piece);
}

//Reverts the tile when a piece is removed
GameMove.prototype.revertTile = function() {
    if( !this.tileDst )
        return ;
    this.tileDst.removePiece(this.piece);
    this.piece.animation = null;
}

//Reverts the piece
GameMove.prototype.revertPiece = function() {
    if( !this.tileSrc )
        return ;
    this.tileSrc.addPiece(this.piece);
    this.piece.animation = null;
}

//Undo movement
GameMove.prototype.undoMove = function() {
    this.revertPiece();
    this.revertTile();
}

//Show the different movements
GameMove.prototype.show = function() {
    console.log("Piece: " + this.piece.id + " - From: " + this.tileSrc.id + " - To: " + this.tileDst.id);
}

//Copies the game move used
GameMove.prototype.copy = function() {
    return new GameMove(this.player, this.piece, this.tileSrc, this.tileDst);
}

//Updates the movement
GameMove.prototype.updateMove = function(game) {
    var tmp = this.player.id;
    if( tmp == 1 )
        this.player = game.player1;
    else
        this.player = game.player2;

    if( !this.piece )
        return ;

    tmp = this.piece.id;
    this.piece = this.player.pieces.getPieceById(tmp);

    if( !this.tileSrc )
        return ;

    tmp = this.tileSrc.id;
    this.tileSrc = this.player.pieces.getTileById(tmp);

    if( !this.tileDst)
        return ;
        
    tmp = this.tileDst.id;
    this.tileDst = game.gameBoard.getTileById(tmp);
}