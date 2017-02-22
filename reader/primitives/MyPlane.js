/**
	Plane constructor
*/
function MyPlane(scene, dimX, dimY, partsX, partsY) {
    this.scene = scene;
	
    this.dimX = dimX;
	this.dimY = dimY;
	this.partsX = partsX;
	this.partsY = partsY;
	
	this.controlPoints = createControlPoints(this.dimX, this.dimY);
	
	//Texture coordinates
	this.texCoords = [	0,1,
						1,1,
						0,0,
						1,0
					  ];
	
	//MyPlane is a Patch with orderU and orderV equals to 1
	MyPatch.call(this, this.scene, 1, 1, this.partsX, this.partsY, this.controlPoints);
}

MyPlane.prototype = Object.create(CGFnurbsObject.prototype);
MyPlane.prototype.constructor = MyPlane;

//Creates the controlPoints
var createControlPoints = function(dimX, dimY) {
	
	var controlPoints = [];
	var dimX2 = dimX / 2;
	var dimY2 = dimY / 2;
	
	//U = 0
	controlPoints.push([-dimX2, -dimY2, 0, 1]);
	controlPoints.push([-dimX2, dimY2, 0, 1]);
	
	//U = 1
	controlPoints.push([dimX2, -dimY2, 0, 1]);
	controlPoints.push([dimX2, dimY2, 0, 1]);	
	
	return controlPoints;   
};

//Sets the texture's coordinates (in this case this function does nothing)
MyPlane.prototype.setTexCoords = function(length_t, length_s){
	
};