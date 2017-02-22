/**
	Vehicle constructor
*/
function MyVehicle(scene) {
    CGFobject.call(this,scene);

    this.cylinder = new MyCylinder(scene, 0.8, 0.6, 1.4, 5, 10);

    this.back_half = new MyPatch(scene, 3, 3, 10, 10, [
        [-1.45, 0.0, 0.0, 1.0], [-1.45, 0.0, 0.0, 1.0], [-1.45, 0.0, 0.0, 1.0], [-1.45, 0.0, 0.0, 1.0],
        [-1.4, 0.0, -0.05, 1.0], [-1.4, -0.1, -0.05, 1.0], [-1.4, -0.1, 0.05, 1.0], [-1.4, 0.0, 0.05, 1.0], 
        [-1.3, 0.0, -0.2, 1.0], [-1.3, -0.2, -0.2, 1.0], [-1.3, -0.2, 0.2, 1.0], [-1.3, 0.0, 0.2, 1.0],
        [-1.0, 0.0, -0.25, 1.0], [-1.0, -0.3, -0.25, 1.0], [-1.0, -0.3, 0.25, 1.0], [-1.0, 0.0, 0.25, 1.0]
    ]);

    this.middle_half = new MyPatch(scene, 3, 2, 10, 10, [
        [-0.1, 0.0, -0.5, 1.0], [-0.1, -0.5, 0.0, 1.0], [-0.1, 0.0, 0.5, 1.0],
        [0.0, 0.0, -0.1, 1.0], [0.0, -1.0, 0.0, 1.0], [0.0, 0.0, 0.1, 1.0],
        [0.5, 0.0, -3.5, 1.0], [0.5, -3.5, 0.0, 1.0], [0.5, 0.0, 3.5, 1.0],
        [4.0, 0.0, -1.5, 1.0], [0.0, -1.5, 0.0, 1.0], [4.0, 0.0, 1.5, 1.0]
    ]);

    this.front_half = new MyPatch(scene, 3, 1, 10, 10, [
        [4.0, 0.0, 1.5, 1.0], [4.0, 0.0, 1.5, 1.0],
        [1.33, -1.0, 0.5, 1.0], [1.33, 1.0, 0.5, 1.0],
        [1.33, -1.0, -0.5, 1.0], [1.33, 1.0, -0.5, 1.0],
        [4.0, 0.0, -1.5, 1.0], [4.0, 0.0, -1.5, 1.0]
    ]);

    //Materials
    this.blackMaterial = new CGFappearance(scene);
    this.blackMaterial.setAmbient(0.0, 0.0, 0.0, 1.0);
    this.blackMaterial.setSpecular(0.8, 0.8, 0.8, 1.0);
    this.blackMaterial.setDiffuse(0.1, 0.1, 0.1, 1.0);
    this.blackMaterial.setShininess(20);

    this.greyMaterial = new CGFappearance(scene);
    this.greyMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
    this.greyMaterial.setSpecular(0.8, 0.8, 0.8, 1.0);
    this.greyMaterial.setDiffuse(0.3, 0.3, 0.3, 1.0);
    this.greyMaterial.setShininess(20);

	this.shader = new CGFshader(this.scene.gl, "shaders/vehicle.vert", "shaders/vehicle.frag");
	this.shader.setUniformsValues({init: -1.5});
	this.shader.setUniformsValues({end: 1.5});
};

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor=MyVehicle;

//Displays the vehicle
MyVehicle.prototype.display = function() {

    this.scene.pushMatrix();

    this.scene.rotate(-Math.PI/2,0,1,0);

    this.scene.pushMatrix();

    this.middle_half.display();
    this.scene.rotate(Math.PI,1,0,0);
    this.middle_half.display();

    this.scene.popMatrix();

	this.scene.setActiveShader(this.shader);
    this.front_half.display();
	this.scene.setActiveShader(this.scene.defaultShader);

    this.greyMaterial.apply();
    
    this.scene.pushMatrix();

    this.back_half.display();
    this.scene.rotate(Math.PI,1,0,0);
    this.back_half.display();

    this.scene.popMatrix();

    this.blackMaterial.apply();

    this.scene.pushMatrix();

    this.scene.translate(-1.0, 0.0, 0.0);
    this.scene.rotate(Math.PI/2,0,1,0);
    this.cylinder.display();

    this.scene.popMatrix();
    
    this.scene.popMatrix();
}

//Sets the texture's coordinates (in this case this function does nothing)
MyVehicle.prototype.setTexCoords = function (length_s, length_t) {
}