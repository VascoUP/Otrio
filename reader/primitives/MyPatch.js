/**
	Patch constructor
*/
function MyPatch(scene, orderU, orderV, partsU, partsV, controlPoints) 
{
	this.scene = scene;
	this.orderU = orderU;
	this.orderV = orderV;
	this.partsU = partsU;
	this.partsV = partsV;
	this.controlPoints = getControlPoints(this.orderU, this.orderV, controlPoints);

	//Creates the surface
	this.patch = makeSurface(this.orderU, this.orderV, this.controlPoints);

	//Patch is a CGFnurbsObject
	CGFnurbsObject.call(this, this.scene, this.patch, this.partsU, this.partsV);
};

MyPatch.prototype = Object.create(CGFnurbsObject.prototype);
MyPatch.prototype.constructor = MyPatch;

//Gets the knots vector
var getKnotsVector = function(degree) { 
	
	var v = [];
	for (var i=0; i<=degree; i++)
		v.push(0);
	
	for (var i=0; i<=degree; i++)
		v.push(1);
	
	return v;
};

//Makes the respective surface
var makeSurface = function (orderU, orderV, controlPoints) {
	var knotsU = this.getKnotsVector(orderU); 
	var knotsV = this.getKnotsVector(orderV);
		
	var nurbsSurface = new CGFnurbsSurface(orderU, orderV, knotsU, knotsV, controlPoints);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	return getSurfacePoint;		
};

//Gets the control points (array of array of array)
var getControlPoints = function(orderU, orderV, controlPoints)
{
	var controlPointsNew = [];
	for(var i = 0; i <= orderU; i++)
	{
		var temp = [];
		for(var j = 0; j <= orderV; j++)
		{
			var indexArray = i * (orderV + 1) + j;
			var cp = controlPoints[indexArray];
			temp.push(cp);
		}
		
		controlPointsNew.push(temp);
	}
	return controlPointsNew;
};

//Sets the texture's coordinates (in this case this function does nothing)
MyPatch.prototype.setTexCoords = function(length_t, length_s){
	
};