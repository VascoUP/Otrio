//Sphere's constructor
function MySphere(scene, radius, slices, stacks) {
 	CGFobject.call(this,scene);
	
	this.radius = radius;

	if( slices >= 3 )
		this.slices = slices;
	else
		this.slices = 3;
	if( stacks >= 2 )
		this.stacks = stacks;
	else
		this.stacks = 2;

	this.minS = 0.0;
	this.maxS = 1.0;
	this.minT = 0.0;
	this.maxT = 1.0;

 	this.initBuffers();
 }

 MySphere.prototype = Object.create(CGFobject.prototype);
 MySphere.prototype.constructor = MySphere;

 //Initiates the sphere's buffers
 MySphere.prototype.initBuffers = function() {

 	var xCoord = 0;
 	var yCoord = 0;
 	var zCoord = -this.radius;
 	var r = 0;

 	var ang = 0;
 	var dAng = 2 * Math.PI / this.slices;

 	var zAng = -Math.PI / 2;
 	var dZAng = Math.PI / this.stacks;

	var counter = 0;

	var dS = (this.maxS - this.minS) / this.slices;
	var dT = (this.maxT - this.minT) / this.stacks;
	var t = this.minT;
	var s = this.minS;

	this.vertices = [];
 	this.indices = [];
	this.normals = [];
	this.texCoords = [];

	for(var j = 1; j < this.stacks; j++) {
		s = this.minS;
		if(j == 1) {
			this.vertices.push(xCoord, yCoord, zCoord);
			this.normals.push(0, 0, -1);
			this.texCoords.push( this.maxS - this.minS , this.minT );

			zAng += dZAng;
			zCoord = this.radius * Math.sin(zAng);
			r = this.radius * Math.cos(zAng);
			xCoord = r;
			yCoord = 0;

			t += dT;

			for(var i = 0; i <= this.slices; i++) {
				this.vertices.push( xCoord, yCoord, zCoord );
				this.normals.push( xCoord / this.radius, yCoord / this.radius, zCoord / this.radius );
				this.texCoords.push( s , t );

				ang += dAng;

				yCoord = Math.sin(ang) * r;
				xCoord = Math.cos(ang) * r;

				s += dS;

			this.texCoords.push( this.maxS - this.minS , this.minT );
				counter++;

				if( i > 0 )
					this.indices.push( counter, counter - 1, 0 );

			}
		}
 		else {
			for (var i = 0; i <= this.slices; i++) {
				this.vertices.push(xCoord, yCoord, zCoord);
				this.normals.push( xCoord / this.radius, yCoord / this.radius, zCoord / this.radius );
				this.texCoords.push( s , t );

				counter++;

				s+= dS;

				if( i > 0 ) {
					this.indices.push( counter - 1, counter - this.slices - 2, counter - this.slices - 1 );
					this.indices.push( counter, counter - 1, counter - this.slices - 1 );
				}

				ang += dAng;

				yCoord = Math.sin(ang) * r;
				xCoord = Math.cos(ang) * r;
			}
		}

		if( j + 1 == this.stacks ) {

			this.vertices.push( 0, 0, this.radius );
			this.normals.push( 0, 0, 1 );
			this.texCoords.push( this.maxS - this.minS , this.maxT );

			counter++;

			for(var i = 0; i <= this.slices; i++)
					this.indices.push(counter, counter - this.slices + i - 1, counter - this.slices + i);
 		}
 		else {
			ang = 0;
			zAng += dZAng;
			zCoord = this.radius * Math.sin(zAng);
			r = this.radius * Math.cos(zAng);
			xCoord = r;
			yCoord = 0;
			t += dT;
		}
	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 }

 //Sets the texture's coordinates
MySphere.prototype.setTexCoords = function (length_s, length_t) {
    this.minS = 0;
	this.maxS = Math.pow(length_t, -1) * (this.radius * Math.PI * 2);
	this.minT = 0;
	this.maxT = Math.pow(length_t, -1) * (this.radius * Math.PI * 2);

    this.texCoords = [ ];

	var dS = (this.maxS - this.minS) / this.slices;
	var dT = (this.maxT - this.minT) / this.stacks;
	var t = this.minT + dT;
	var s;

	this.texCoords.push( this.maxS - this.minS , this.minT );

	for(var j = 1; j < this.stacks; j++) {
		s = this.minS;
		for (var i = 0; i <= this.slices; i++) {
			this.texCoords.push( s , t );
			s+= dS;
		}
		t += dT;
	}

	this.texCoords.push( this.maxS - this.minS , this.maxT );

    this.updateTexCoordsGLBuffers();
}