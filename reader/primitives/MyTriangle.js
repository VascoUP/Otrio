//Triangle's constructor
function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    CGFobject.call(this,scene);

    this.minS = 0.0;
    this.maxS = 1.0;
    this.minT = 0.0;
    this.maxT = 1.0;

    this.initBuffers(x1, y1, z1, x2, y2, z2, x3, y3, z3);
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor=MyTriangle;

//Initiates the triangle's buffers
MyTriangle.prototype.initBuffers = function (x1, y1, z1, x2, y2, z2, x3, y3, z3) {
	this.vertices = [
        x1, y1, z1, //A - 0
        x2, y2, z2,	//B - 1
        x3, y3, z3,	//C - 2
	];

	this.indices = [
        2, 1, 0,
        0, 1, 2
    ];

    var uX = x2 - x1;
    var uY = y2 - y1;
    var uZ = z2 - z1;
    var vX = x3 - x1;
    var vY = y3 - y1;
    var vZ = z3 - z1;

    this.normals = [
    	(uY * vZ) - (uZ * vY), (uZ * vX) - (uX * vZ), (uX * vY) - (uY * vX),
    	(uY * vZ) - (uZ * vY), (uZ * vX) - (uX * vZ), (uX * vY) - (uY * vX),
    	(uY * vZ) - (uZ * vY), (uZ * vX) - (uX * vZ), (uX * vY) - (uY * vX)
    ];

    this.texCoords = [
        this.minS, this.minT,
        this.minS, this.maxT,
        this.maxS, this.maxT
    ];
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

//Sets the texture's coordinates
MyTriangle.prototype.setTexCoords = function (length_s, length_t) {

    var a = Math.sqrt( Math.pow(this.vertices[0] - this.vertices[6], 2) +
                            Math.pow(this.vertices[1] - this.vertices[7], 2) +
                            Math.pow(this.vertices[2] - this.vertices[8], 2) );

    var b = Math.sqrt( Math.pow(this.vertices[3] - this.vertices[0], 2) +
                            Math.pow(this.vertices[4] - this.vertices[1], 2) +
                            Math.pow(this.vertices[5] - this.vertices[2], 2) );

    var c = Math.sqrt( Math.pow(this.vertices[6] - this.vertices[3], 2) +
                            Math.pow(this.vertices[7] - this.vertices[4], 2) +
                            Math.pow(this.vertices[8] - this.vertices[5], 2) );

    var cosB = ( Math.pow( a, 2 ) - Math.pow( b, 2 ) + Math.pow( c, 2 ) ) / ( 2 * a * c );

    var sinB = Math.sqrt( 1 - Math.pow( cosB, 2 ) ); 

    this.minS = 0;
	this.maxS = Math.pow(length_t, -1) * c;
	this.minT = 0;
	this.maxT = Math.pow(length_t, -1) * a * sinB;

    this.texCoords = [
        c - a * cosB, a * sinB,
        0, 0,
        c, 0
    ];

    this.updateTexCoordsGLBuffers();
}
