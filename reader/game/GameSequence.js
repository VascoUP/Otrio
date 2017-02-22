/**
*	Game sequence's constructor
*/
function GameSequence(game) {
    this.game = game;
    this.sequence = [];
};

//Add a movement to the game's sequence
GameSequence.prototype.addMove = function(move) {
    var m = move.copy();
    m.auto = true;
    this.sequence.push( m );
};

//Undo the movement and updates the game's sequence
GameSequence.prototype.undoMove = function(player) {
    if( this.sequence.length == 0 )
        return false;

    var n = -1;
    for( var i = 0; i < this.sequence.length; i++ ) {
        if( this.sequence[this.sequence.length - i - 1].player.id == player.id ) {
            n = i+1;
            break;
        }
    }
    this.undoMoves(n);
    return n > 0;
};

//Undo movements and updates the game's sequence
GameSequence.prototype.undoMoves = function(n) {
    for( var i = 0; i < n; i++ ) {
        if( this.sequence.length == 0 )
            return ;
        this.sequence[this.sequence.length - 1].undoMove();
        this.sequence.pop();
    }
};

//Shows the game's sequence
GameSequence.prototype.show = function() {
    console.debug(this.sequence);
    for( var i = 0; i < this.sequence.length; i++ )
        this.sequence[i].show();
};

//Updates the variables in each move stored on the sequence
GameSequence.prototype.updateSequence = function() {
    for( var i = 0; i < this.sequence.length; i++ )
        this.sequence[i].updateMove(this.game);
};

//Replay the game movement's sequence
GameSequence.prototype.replay = function() {
    this.replayIndexMove = -1;
};

//Verifies what is the next move to do on the replay mode
GameSequence.prototype.nextReplayMove = function() {
    this.replayIndexMove++;
    return this.replayIndexMove < this.sequence.length ? this.sequence[this.replayIndexMove] : null;
}