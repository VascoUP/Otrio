//Cylinder's constructor
 function MyCylinder(scene, base, top, height, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.base = base;
	this.top = top;
	this.height = height
	this.slices = slices;
	this.stacks = stacks;

	this.minS = 0.0;
	this.maxS = 1.0;
	this.minT = 0.0;
	this.maxT = 1.0;

 	this.initBuffers();
 };

 MyCylinder.prototype = Object.create(CGFobject.prototype);
 MyCylinder.prototype.constructor = MyCylinder;

 //Initiates the cylinder's buffers
 MyCylinder.prototype.initBuffers = function() {
	var r = this.base;
	var dR = ( this.top - this.base ) / this.stacks;

	var xCoord = r;
	var yCoord = 0;

	var zCoord = 0;
	var dZ = this.height / this.stacks;

	var ang = 0;
	var dAng = 2 * Math.PI / this.slices;

	var counter = 0;

	var dS = ( this.maxS - this.minS ) / this.slices;
	var dT = ( this.maxT - this.minT ) / this.stacks;
	var t = this.minT;

 	this.vertices = [];
 	this.indices = [];
	this.normals = [];
	this.texCoords = [];

	//Draw the body 
 	for(var j = -1; j < this.stacks; j++) {
		var s = this.minS;
		for (var i = 0; i <= this.slices; i++) {

			this.vertices.push(xCoord, yCoord, zCoord);
			this.normals.push(Math.cos(ang), Math.sin(ang), 0);
			this.texCoords.push(s, t);

			if( j >= 0 && i > 0 ) {
				this.indices.push( counter, counter - 1, counter - this.slices - 1 );
				this.indices.push( counter - this.slices - 2, counter - this.slices - 1, counter - 1 );
			}

			ang += dAng;
			yCoord = r * Math.sin(ang);
			xCoord = r * Math.cos(ang);

			s += dS;

			counter++;
		}

		r += dR;

		xCoord = r;
		yCoord = 0;
		ang = 0;

		zCoord += dZ;

		t += dT;
	}


	//Draw the base 
	dS = this.maxS - this.minS;
	dT = this.maxT - this.minT;

	r = this.base;

	xCoord = r;
	yCoord = 0;
	zCoord = 0;
	
	ang = 0;

	var s = this.minS;

	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, -1);
	this.texCoords.push(dS / 2 + this.minS, dT / 2 + this.minT);

	var nIndices = this.vertices.length / 3;

	for (var i = 0; i <= this.slices; i++) {
		
			this.vertices.push(xCoord, yCoord, zCoord);
			this.normals.push(0, 0, -1);
			this.texCoords.push((xCoord / r + 1) / 2 * dS, (yCoord / r + 1) / 2 * dT);

			if(i > 0) 
				this.indices.push(nIndices + i, nIndices + i - 1, nIndices - 1);


			ang += dAng;
			yCoord = r * Math.sin(ang);
			xCoord = r * Math.cos(ang);

			s += dS;
	}
	

	//Draw the top 
	r = this.top;

	xCoord = r;
	yCoord = 0;
	
	ang = 0;

	s = this.minS;

	this.vertices.push(0, 0, this.height);
	this.normals.push(0, 0, 1);
	this.texCoords.push(dS / 2 + this.minS, dT / 2 + this.minT);

	nIndices = this.vertices.length / 3;

	for (var i = 0; i <= this.slices; i++) {
		
			this.vertices.push(xCoord, yCoord, this.height);
			this.normals.push(0, 0, 1);
			this.texCoords.push((xCoord / r + 1) / 2 * dS, (yCoord / r + 1) / 2 * dT);

			if(i > 0) 
				this.indices.push( nIndices - 1, nIndices + i - 1, nIndices + i);


			ang += dAng;
			yCoord = r * Math.sin(ang);
			xCoord = r * Math.cos(ang);

			s += dS;
	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

//Sets the texture's coordinates
MyCylinder.prototype.setTexCoords = function (length_s, length_t) {
	this.minS = 0;
	this.maxS = Math.pow(length_t, -1) * (((this.top + this.base) / 2) * Math.PI * 2);
	this.minT = 0;
	this.maxT = Math.pow(length_t, -1) * this.height;

	this.texCoords = [];

	var dS = ( this.maxS - this.minS ) / this.slices;
	var dT = ( this.maxT - this.minT ) / this.stacks;
	var t = this.minT;
	var s;

	//Draw the body 
 	for(var j = -1; j < this.stacks; j++) {
		s = this.minS;
		for (var i = 0; i <= this.slices; i++) {
			this.texCoords.push(s, t);
			s += dS;
		}
		t += dT;
	}


	//Draw the base 
	dS = this.maxS - this.minS;
	dT = this.maxT - this.minT;

	xCoord = 1;
	yCoord = 0;
	zCoord = 0;
	
	var ang = 0;
	var dAng = 2 * Math.PI / this.slices;

	s = this.minS;

	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, -1);
	this.texCoords.push(dS / 2 + this.minS, dT / 2 + this.minT);

	for (var i = 0; i <= this.slices; i++) {
			this.texCoords.push((xCoord + 1) / 2 * dS, (yCoord + 1) / 2 * dT);

			ang += dAng;
			yCoord = Math.sin(ang);
			xCoord = Math.cos(ang);
			s += dS;
	}
	

	//Draw the top 
	xCoord = 1;
	yCoord = 0;
	
	ang = 0;

	s = this.minS;

	this.vertices.push(0, 0, this.height);
	this.normals.push(0, 0, 1);
	this.texCoords.push(dS / 2 + this.minS, dT / 2 + this.minT);

	for (var i = 0; i <= this.slices; i++) {
			this.texCoords.push((xCoord + 1) / 2 * dS, (yCoord + 1) / 2 * dT);

			ang += dAng;
			yCoord = Math.sin(ang);
			xCoord = Math.cos(ang);
			s += dS;
	}
	
	this.updateTexCoordsGLBuffers();
}