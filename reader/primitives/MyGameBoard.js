/**
	MyGameBoard's constructor
*/
function MyGameBoard(scene) {
    CGFobject.call(this,scene);

    this.corner = new MyPatch(scene, 1, 2, 1, 5, [
        [0.5, -0.5, 0.0, 1.0], [-0.5, -0.5, 0.0, 1.0], [-0.5, 0.5, 0.0, 1.0],
        [0.5, -0.5, 1.0, 1.0], [-0.5, -0.5, 1.0, 1.0], [-0.5, 0.5, 1.0, 1.0]
    ]);    
    
    this.cornerTop = new MyPatch(scene, 1, 2, 1, 5, [
        [-0.5, 0.5, 1.0, 1.0], [-0.5, 0.5, 2.0, 1.0], [0.5, 0.5, 2.0, 1.0],
        [-0.5, -0.5, 1.0, 1.0], [-0.5, -0.5, 2.0, 1.0], [0.5, -0.5, 2.0, 1.0]
    ]);

    this.cornerIntersection = new MyPatch(scene, 2, 2, 5, 5, [
        [0.5, 0.5, 2.0, 1.0], [0.5, 0.5, 2.0, 1.0], [0.5, 0.5, 2.0, 1.0],
        [-0.5, 0.5, 2.0, 1.0], [-0.5, -0.5, 2.0, 1.0], [0.5, -0.5, 2.0, 1.0],
        [-0.5, 0.5, 1.0, 1.0], [-0.5, -0.5, 1.0, 1.0], [0.5, -0.5, 1.0, 1.0]
    ]);

    this.side = new MyPlane(scene, 1, 1, 1, 10);
};

MyGameBoard.prototype = Object.create(CGFobject.prototype);
MyGameBoard.prototype.constructor=MyGameBoard;

//Displays the corner of game's board
MyGameBoard.prototype.displayCorner = function() {
    this.scene.pushMatrix();
    this.scene.scale(0.25, 0.25, 0.1);
    this.scene.translate(-2.5, -2.5, -2);

    this.corner.display();
    this.cornerIntersection.display();
    this.scene.popMatrix();
}

//Displays the side of game's board
MyGameBoard.prototype.displaySide = function() {    
    this.scene.pushMatrix();
    this.scene.scale(0.25, 1, 0.1);
    this.scene.translate(-2.5, 0, -2);

    this.cornerTop.display();
    this.scene.translate(-0.5, 0, 0.5);
    this.scene.rotate(-Math.PI / 2, 0, 1 ,0);
    this.side.display();

    this.scene.popMatrix();
}

//Displays the game's board
MyGameBoard.prototype.display = function() {    
    this.scene.pushMatrix();

        this.displaySide();
        this.displayCorner();

        this.scene.rotate(Math.PI / 2, 0, 0, 1);

        this.displaySide();
        this.displayCorner();

        this.scene.rotate(Math.PI / 2, 0, 0, 1);

        this.displaySide();
        this.displayCorner();
                
        this.scene.rotate(Math.PI / 2, 0, 0, 1);

        this.displaySide();
        this.displayCorner();

    this.scene.popMatrix();
}

//Sets the texture's coordinates (in this case this function does nothing)
MyGameBoard.prototype.setTexCoords = function (length_s, length_t) {
}