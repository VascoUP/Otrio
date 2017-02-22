//Constructs the view with its information
function ViewInfo(id, near, far, angle) {
	this.id = id;
	this.near = near;
	this.far = far;
	this.angle = angle;
}

//Sets the 'from' variable
ViewInfo.prototype.setFrom = function(x, y, z) {
	this.from = vec3.fromValues(x, y, z);
}

//Sets the 'to' variable
ViewInfo.prototype.setTo = function(x, y, z) {
	this.to = vec3.fromValues(x, y, z);
}