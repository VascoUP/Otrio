const numTilesAux = 6; //Number of tiles

/**
 *  AuxiliarBoard's constructor
 */
function AuxiliarBoard(scene, coords, materialPieces) {
    CGFobject.call(this,scene);
    this.init(materialPieces);

    // Transformation
    this.coords = coords;
    this.rotation = 0;
    //this.rotation = -Math.PI / 4;
    this.scale = [1, 1, 1];

    this.box = new MyBox(scene);
};

AuxiliarBoard.prototype = Object.create(CGFnurbsObject.prototype);
AuxiliarBoard.prototype.constructor = AuxiliarBoard;

//Initiates the auxiliar board
AuxiliarBoard.prototype.init = function(material) {
    this.tiles = [];
    var x = -1, y = 0.15, z = -0.5;
    for( var i = 0; i < numTilesAux; i++ ) {
        if( i == numTilesAux / 2 ) {
            x = -1;
            z += 1;
        }
        var tile = new RoundTile(this.scene, [x, y, z], material);
        tile.fill();
        this.tiles.push(tile);
        x += 1;
    }
};

//Updates the AuxiliarBoard
AuxiliarBoard.prototype.update = function( dSec ){
};

//Sets the texture's coordinates (in this case this function does nothing)
AuxiliarBoard.prototype.setTexCoords = function(length_t, length_s){
};

//Gets the tiles' coordinates
AuxiliarBoard.prototype.getTileCoords = function(id) {
    var fId = this.tiles[0].id;
    var dId = id - fId;

    var line = Math.floor(dId / (numTilesAux / 2));
    var column = dId - (line * numTilesAux / 2);

    var x = column - 1 + this.coords[0];
    var z = line - 0.5 + this.coords[2];

    return [x, this.coords[1], z];
};

//Gets the respective piece by id
AuxiliarBoard.prototype.getPieceById = function(id) {
    var piece;
    for( var i = 0; i < numTilesAux; i++ )
        if( (piece = this.tiles[i].getPieceById(id)) != null )
            return piece;
    return null;
}

//Gets the respective tile by id
AuxiliarBoard.prototype.getTileById = function(id) {
    for( var i = 0; i < numTilesAux; i++ ) {
        if( this.tiles[i].id == id )
            return this.tiles[i];
    }
    return null;
}



/**
 * GAME MECHANICS
 */

//Gets the tile's pieces
AuxiliarBoard.prototype.getTilePiece = function(id) {
    var piece;
    for( var i = 0; i < numTilesAux; i++ )
        if( this.tiles[i].getTilePiece(id) )
            return this.tiles[i];
    return null;
}

//Removes the pieces from auxiliar board
AuxiliarBoard.prototype.removePiece = function(piece) {
    for( var i = 0; i < numTilesAux; i++ )
        if(this.tiles[i].removePiece(piece))
            return true;
    return false;
}

//Converts a piece into string (small piece - s, medium piece - m, larg piece - l)
AuxiliarBoard.prototype.piecesToString = function() {
    var array = [0, 0, 0];
    for( var i = 0; i < numTilesAux; i++ ) {
        var tileCount = this.tiles[i].countPieces();
        array[0] += tileCount[0];   // s
        array[1] += tileCount[1];   // m
        array[2] += tileCount[2];   // l
    }

    var str = '[(' + array[0] + ',s),(' + array[1] + ',m),(' + array[2] + ',l)]';
    return str;
}

//Gets the piece's type
AuxiliarBoard.prototype.getPieceType = function(typePiece) {
    var piece;
    for( var i = 0; i < numTilesAux; i++ ) {
        if( (piece = this.tiles[i].getPieceType(typePiece)) )
            return piece;
    }
    return null;
}

/**
 *  DISPLAY FUNCTIONS
 */

//Used so that, when we change something, we don't have to change it in both functions
AuxiliarBoard.prototype.generalDisplay = function( func ){   
    this.scene.pushMatrix();

    this.scene.translate(this.coords[0], this.coords[1], this.coords[2]);
    this.scene.rotate(this.rotation, 0, 0, 1);
    this.scene.scale(this.scale[0], this.scale[1], this.scale[2]);
        
    this.scene.pushMatrix();
        
    if( func == Tile.prototype.display ) {
        this.scene.pushMatrix();

        //this.material.apply();
        this.scene.scale(4, 0.5, 3);
        this.box.display();

        this.scene.popMatrix();
    }

    for( var i = 0; i < numTilesAux; i++ )
        func.call(this.tiles[i]);

    this.scene.popMatrix();

    this.scene.popMatrix();
}

//Register for pick function
AuxiliarBoard.prototype.registerForPick = function(){
    this.generalDisplay( Tile.prototype.registerForPick );
}

//Displays the auxiliar board
AuxiliarBoard.prototype.display = function(material){
    material.apply();
    this.generalDisplay( Tile.prototype.display );
}