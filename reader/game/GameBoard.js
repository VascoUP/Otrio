const numTilesBoard = 3;  //Tiles' number

const scaleXZ = 4;	//Scale value to use on board
const sizeTile = scaleXZ / 3;  //Tiles' size


/**
 *  GameBoard's constructor
 */
function GameBoard(scene, material) {
    CGFobject.call(this,scene);
    
    this.board = new MyBoard(scene, 3, 3, null, -1, -1, 
                                [0.9, 0.9, 0.9, 1], 
                                [0.5, 0.5, 0.5, 1], 
                                [0.2, 0.2, 0.8, 1]);
    this.support = new MyGameBoard(scene);

    this.material = material;
    this.material.setTextureWrap('REPEAT', 'REPEAT');

    this.boardTexture = new CGFtexture(this.scene, "resources/board_texutre.png");
    this.generalTexture = new CGFtexture(this.scene, "resources/purty_wood.png");

    this.init();
};	

GameBoard.prototype = Object.create(CGFnurbsObject.prototype);
GameBoard.prototype.constructor = GameBoard;

//Initiates the board
GameBoard.prototype.init = function() {
    this.tiles = [];
    var x = -1, y = 0.05, z = 1;
    for( var i = 0; i < numTilesBoard; i++ ) {
        var line = [];
        for( var j = 0; j < numTilesBoard; j++ ) {
            line.push( new RoundTile(this.scene, [x, y, z]) );
            x++;
        }
        z--;
        x = -1;
        this.tiles.push( line );
    }
}

//Sets the shader values
GameBoard.prototype.setValuesShader = function(){
}

//Updates the GameBoard
GameBoard.prototype.update = function( dSec ){
}

//Sets the texture's coordinates (in this case this function does nothing)
GameBoard.prototype.setTexCoords = function(length_t, length_s){
}

//Gets the tiles' position
GameBoard.prototype.getPosTile = function(line, column) {
    return this.tiles[line][column];
}

//Gets the position of a tile with the respective id
GameBoard.prototype.getTilePos = function(id) {
    var fId = this.tiles[0][0].id;
    var dId = id - fId;

    var line = Math.floor(dId / numTilesBoard);
    var column = dId - (line * numTilesBoard);

    return [column, line];
}

//Gets the tile's coordinates
GameBoard.prototype.getTileCoords = function(id) {
    var pos = this.getTilePos(id);

    var x = pos[0] * sizeTile - sizeTile;
    var z = sizeTile - pos[1] * sizeTile;

    return [x, 0.2, z];
}

//Gets the tyle by id
GameBoard.prototype.getTileById = function(id) {
    for( var i = 0; i < numTilesBoard; i++ ) {
        for( var j = 0; j < numTilesBoard; j++ ) {
            if( this.tiles[i][j].id == id )
                return this.tiles[i][j];
        }
    }
    return null;
}


/**
 *  GAME MECHANICS
 */

//Selects a respective tile
GameBoard.prototype.selectTile = function(tile) {
    if( tile == null ) {
        this.board.sV = -1;
        this.board.sU = -1;
    } else {
        var pos = this.getTilePos(tile.id);
        this.board.sV = pos[1];
        this.board.sU = pos[0];
    }
}

//Converts the board into a string
GameBoard.prototype.boardToString = function() {
    var str = '[';
    for( var i = 0; i < numTilesBoard; i++ ) {
        var line = '[';
        for( var j = 0; j < numTilesBoard; j++ ) {
            var tile = this.tiles[i][j].tileToString();
            if( j != 0 )
                line += ',';
            line += tile;
        }
        line += ']';

        if( i != 0 )
            str += ',';
        str += line;
    }

    str += ']';
    
    return str;
}


/**
 *  DISPLAY FUNCTIONS
 */

//Used so that, when we change something, we don't have to change it in both functions
GameBoard.prototype.generalDisplay = function( func ){
    
    this.scene.pushMatrix();

    this.scene.scale(scaleXZ, 1, scaleXZ);
    this.scene.translate(0, 0.2, 0);

    if( func == Tile.prototype.display ) {
        this.scene.pushMatrix();

        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.material.setTexture( this.boardTexture );
        this.material.apply();
        this.board.display();
        this.material.setTexture( this.generalTexture );
        this.material.apply();
        this.support.display();

        this.scene.popMatrix();
    }

    this.scene.pushMatrix();
    this.scene.scale(1/3, 1, 1/3);
    for( var i = 0; i < numTilesBoard; i++ )
        for( var j = 0; j < numTilesBoard; j++ )
            func.call(this.tiles[i][j]);
    this.scene.popMatrix();

    this.scene.popMatrix();
}

//Register for pick function
GameBoard.prototype.registerForPick = function(){
    this.generalDisplay( Tile.prototype.registerTileForPick );
}

//Displays the game's board
GameBoard.prototype.display = function(){
    this.generalDisplay( Tile.prototype.display );
}