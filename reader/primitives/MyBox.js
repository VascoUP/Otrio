/**
	MyBox's constructor
*/
function MyBox(scene) {
    CGFobject.call(this,scene);

    this.square = new MyRectangle(scene, -0.5, -0.5, 0.5, 0.5);
};

MyBox.prototype = Object.create(CGFobject.prototype);
MyBox.prototype.constructor=MyBox;

//Displays the box created
MyBox.prototype.display = function() {
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);

    //Square 1 - Left
    this.scene.pushMatrix();
    this.scene.translate(0, 0.45, 1);
    this.scene.scale(1, 0.1, 1);
    this.square.display();
    this.scene.popMatrix();

    //Square 1 - Right
    this.scene.pushMatrix();
    this.scene.translate(0, -0.45, 1);
    this.scene.scale(1, 0.1, 1);
    this.square.display();
    this.scene.popMatrix();

    //Square 2 - Right
    this.scene.pushMatrix();
    this.scene.translate(0.45, 0, 1);
    this.scene.scale(0.1, 0.8, 1);
    this.square.display();
    this.scene.popMatrix();

    //Square 2 - Left
    this.scene.pushMatrix();
    this.scene.translate(-0.45, 0, 1);
    this.scene.scale(0.1, 0.8, 1);
    this.square.display();
    this.scene.popMatrix();

    //Square 3 (Bottom of the inside of the box)
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.1);
    this.scene.scale(0.8, 0.8, 1);
    this.square.display();
    this.scene.popMatrix();
    
    //Square 4 - Left
    this.scene.pushMatrix();
    this.scene.translate(0, 0.4, 0.55);
    this.scene.scale(0.8, 1, 0.9);
    this.scene.rotate(Math.PI / 2, 1, 0, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 4 - Right
    this.scene.pushMatrix();
    this.scene.translate(0, -0.4, 0.55);
    this.scene.scale(0.8, 1, 0.9);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 5 - Left
    this.scene.pushMatrix();
    this.scene.translate(-0.4, 0, 0.55);
    this.scene.scale(1, 0.8, 0.9);
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 5 - Right
    this.scene.pushMatrix();
    this.scene.translate(0.4, 0, 0.55);
    this.scene.scale(1, 0.8, 0.9);
    this.scene.rotate(-Math.PI / 2, 0, 1, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 7 - Left
    this.scene.pushMatrix();
    this.scene.translate(-0.5, 0, 0.5);
    this.scene.rotate(-Math.PI / 2, 0, 1, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 7 - Right
    this.scene.pushMatrix();
    this.scene.translate(0.5, 0, 0.5);
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 6 - Left
    this.scene.pushMatrix();
    this.scene.translate(0, 0.5, 0.5);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 6 - Right
    this.scene.pushMatrix();
    this.scene.translate(0, -0.5, 0.5);
    this.scene.rotate(Math.PI / 2, 1, 0, 0);
    this.square.display();
    this.scene.popMatrix();

    //Square 7 (Bottom of the box)
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.square.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}

//Sets the texture's coordinates (in this case this function does nothing)
MyBox.prototype.setTexCoords = function (length_s, length_t) {

}