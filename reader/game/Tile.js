//  Used to identify the tiles (autoincremented in the constructor)
var tileId = 1;

/**
 *  Tile - ABSTRACT CLASS
 */
function Tile(scene, coords, material) {    
    if (this.constructor === Tile) {
      throw new Error("Can't instantiate abstract class!");
    }
    CGFobject.call(this,scene);
    this.pieces = [];
    this.coords = coords;

    this.obj = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);

    this.material = material;

    this.id = tileId;
    tileId++;
}

Tile.prototype = Object.create(CGFnurbsObject.prototype);
Tile.prototype.constructor = Tile;


//Updates the Tile
Tile.prototype.update = function(dSec){
}

//Sets the texture's coordinates (in this case this function does nothing)
Tile.prototype.setTexCoords = function(length_t, length_s){
}



/**
 * GAME MECHANICS
 */

//Verifies if a tile has a piece already
Tile.prototype.hasPiece = function(type) {
    for( var i = 0; i < this.pieces.length; i++ ) {
        if( this.pieces[i].type == type )
            return true;
    }
    return false;
}

//Gets the piece placed on the tile
Tile.prototype.getTilePiece = function(id) {
    for( var i = 0; i < this.pieces.length; i++ )
        if( this.pieces[i].id == id ) //If id equals this pieces id return the piece
            return true;
    return false; //Else return null
}

//Adds a piece to a tile
Tile.prototype.addPiece = function(piece) {
    if( this.hasPiece(piece.type) )
        return false;
    this.pieces.push(piece);
    return true;
}

//Remove piece placed on a tile
Tile.prototype.removePiece = function(piece) {
    var index = this.pieces.indexOf(piece);

    if( index > -1 ) {
        this.pieces.splice(index, 1); //Removed one element from an index
        return true;
    }
    return false;
}

//Converts a tile into a string
Tile.prototype.tileToString = function() {
    var array = ['e', 'e', 'e'];
    for( var i = 0; i < this.pieces.length; i++ ) {
        var index;
        if( this.pieces[i].type == small)
            index = 0;
        else if( this.pieces[i].type == medium )
            index = 1;
        else
            index = 2;

        var str = this.pieces[i].pieceToString();
        array[index] = str;
    }

    var str = '[' + array[0] + ',' + array[1] + ',' + array[2] + ']';
    return str;
}

//Counts the tile's pieces
Tile.prototype.countPieces = function () {
    var array = [0, 0, 0];
    for( var i = 0; i < this.pieces.length; i++ ) {
        var index;
        if( this.pieces[i].type == small)
            index = 0;
        else if( this.pieces[i].type == medium )
            index = 1;
        else
            index = 2;

        array[index] = 1;
    }
    return array;
}

//Gets the piece's type
Tile.prototype.getPieceType = function(typePiece) {
    for( var i = 0; i < this.pieces.length; i++ ) {
        if( this.pieces[i].type == typePiece )
            return this.pieces[i];
    }
    return null;
}

//Gets the piece by ud
Tile.prototype.getPieceById = function(id) {
    for( var i = 0; i < this.pieces.length; i++ ){
        if( this.pieces[i].id == id )
            return this.pieces[i];
    }
    return null;
}



/**
 *  Round Tile - CHILD CLASS OF TILE
 */
function RoundTile(scene) {
    Tile.apply(this, arguments);
}

RoundTile.prototype = Object.create(Tile.prototype);
RoundTile.prototype.constructor = RoundTile;

//Initiates a pice and placed on tile
RoundTile.prototype.initPiece = function(type) {
    if( !this.hasPiece(type) )
        this.pieces.push( new RoundPiece(this.scene, type, this.material) );
}

//Fills the tile
RoundTile.prototype.fill = function() {
    this.initPiece(small);
    this.initPiece(medium);
    this.initPiece(large);
}



/**
 *  DISPLAY FUNCTIONS
 */

//Displays the tiles
Tile.prototype.generalDisplay = function( func ){
    this.scene.pushMatrix();
    this.scene.translate(this.coords[0], this.coords[1], this.coords[2]);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);

    if( func == Tile.prototype.registerTileForPick ) {
        this.scene.registerForPick(this.id, this);
        this.obj.display();
    } else {
        for( var i = 0; i < this.pieces.length; i++ )
            func.call(this.pieces[i]);
    }

    this.scene.popMatrix();
}

//Register for pick function
Tile.prototype.registerTileForPick = function(){
    this.generalDisplay( Tile.prototype.registerTileForPick );
}

//Returns the next available piece
Tile.prototype.registerForPick = function(){
    this.generalDisplay( Piece.prototype.registerForPick );
}

//Displays the Tile with the respective shader
Tile.prototype.display = function(){
    this.generalDisplay( Piece.prototype.display );
}