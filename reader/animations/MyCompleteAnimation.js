/**
*	Constructor that creates the pieces' complete animation
*/
var CompleteAnimation = function ( id, control_points, duration ) {
    Animation.apply(this, arguments);

    if( control_points.length < 1 )
        return ;

    this.lastFrame = false;  
    this.control_points = control_points;

    this.duration = duration > 0 ? duration : 1;
    this.time = 0;

    this.currControlPoint = 0;
    this.currDur = 0;

    this.calcInit();
};

CompleteAnimation.prototype = Object.create(Animation.prototype);
CompleteAnimation.prototype.constructor = CompleteAnimation;

//Calculates the animation's angles using the index of the corresponding control point to be used
CompleteAnimation.prototype.calcAngles = function(i) {
    this.angleXY = this.control_points[i].angleXY;
    this.angleYZ = this.control_points[i].angleYZ;
    this.angleXZ = this.control_points[i].angleXZ;

    // Calculations for ang XY
    if( this.control_points[i+1].angleXY == undefined && this.control_points[i].angleXY == undefined )
        this.dAngXY = 0;
    else if( this.control_points[i+1].angleXY == undefined )
        this.dAngXY = -this.control_points[i].angleXY;
    else if( this.control_points[i].angleXY == undefined ) {
        this.dAngXY = this.control_points[i+1].angleXY;
        this.angleXY = 0;
    } else
        this.dAngXY = this.control_points[i+1].angleXY - this.control_points[i].angleXY;

    // Calculations for ang YZ
    if( this.control_points[i+1].angleYZ == undefined && this.control_points[i].angleYZ == undefined )
        this.dAngYZ = 0;
    else if( this.control_points[i+1].angleYZ == undefined )
        this.dAngYZ = -this.control_points[i].angleYZ;
    else if( this.control_points[i].angleYZ == undefined ) {
        this.dAngYZ = this.control_points[i+1].angleYZ;
        this.angleYZ = 0;
    } else
        this.dAngYZ = this.control_points[i+1].angleYZ - this.control_points[i].angleYZ;

    // Calculations for ang XZ
    if( this.control_points[i+1].angleXZ == undefined && this.control_points[i].angleXZ == undefined )
        this.dAngXZ = 0;
    else if( this.control_points[i+1].angleXZ == undefined )
        this.dAngXZ = -this.control_points[i].angleXZ;
    else if( this.control_points[i].angleXZ == undefined ) {
        this.dAngXZ = this.control_points[i+1].angleXZ;
        this.angleXZ = 0;
    } else
        this.dAngXZ = this.control_points[i+1].angleXZ - this.control_points[i].angleXZ;

    this.rotateXY = this.angleXY;
    this.rotateYZ = this.angleYZ;
    this.rotateXZ = this.angleXZ;
}

//Calculates the initial values
CompleteAnimation.prototype.calcInit = function() {
    var distance = 0;
    var control_points_vel = [];

    for( var i = 0; i < this.control_points.length; i++ ) {
        if( i > 0 ) {
            var d = Math.sqrt( Math.pow( this.control_points[i].center[0] - this.control_points[i-1].center[0], 2) + 
                        Math.pow( this.control_points[i].center[1] - this.control_points[i-1].center[1], 2) +
                        Math.pow( this.control_points[i].center[2] - this.control_points[i-1].center[2], 2) );

            distance += d;
            control_points_vel.push(d);
        }
    }

    // 0 - duration; 1 - velocity in X; 2 - velocity in Y; 3 - velocity in Z
    this.vel_dir = [];

    for( var i = 1; i < this.control_points.length; i++ ) {
        var d = control_points_vel[i-1];
        if( distance != 0 )
            var t = this.duration * d / distance;
        else 
            var t = this.duration / (this.control_points.length - 1);

        var vel = [ 
                //Duration of this control point
                t,
                //Velocity in x                                 
                (this.control_points[i].center[0] - this.control_points[i-1].center[0]) / t,
                //Velocity in y 
                (this.control_points[i].center[1] - this.control_points[i-1].center[1]) / t,
                //Velocity in z
                (this.control_points[i].center[2] - this.control_points[i-1].center[2]) / t];
        
        this.vel_dir.push(vel);
    }

    this.center = this.control_points[0].center.slice();
    this.radius = this.control_points[0].radius;
    this.scale = this.control_points[0].scale.slice();

    this.dRadius = this.control_points[1].radius - this.radius;

    this.dScale = [];
    this.dScale.push(this.control_points[1].scale[0] - this.scale[0]);
    this.dScale.push(this.control_points[1].scale[1] - this.scale[1]);
    this.dScale.push(this.control_points[1].scale[2] - this.scale[2]);

    this.calcAngles(0);
}

//Updates the animation
CompleteAnimation.prototype.update = function( dTime ) {
    if( this.lastFrame )
        return;
        
    // Given the time, calculate the next point in the trajectory
    this.time += dTime;
    if( this.time >= this.duration ) {
        this.lastFrame = true;

        this.center = this.control_points[this.control_points.length - 1].center.slice();
        this.scale = this.control_points[this.control_points.length - 1].scale.slice();
        this.radius = this.control_points[this.control_points.length - 1].radius;
        this.angleXY = this.control_points[this.control_points.length - 1].angleXY;
        this.angleYZ = this.control_points[this.control_points.length - 1].angleYZ;
        this.angleXZ = this.control_points[this.control_points.length - 1].angleXZ;

        return ;
    }
    

    for( var i = this.currControlPoint; i < this.vel_dir.length; i++) {

        if( this.time > this.currDur + this.vel_dir[i][0] ) { //If the time is past this control point
            this.currDur += this.vel_dir[i][0];
            continue;
        }

        //If it gets here than this is the right index
        if( this.currControlPoint != i ) {
            //Only needs to update rotate when it changlees control_points
            this.currControlPoint = i;

            this.dRadius = this.control_points[i+1].radius - this.control_points[i].radius;
            this.dScale[0] = this.control_points[i+1].scale[0] - this.control_points[i].scale[0];
            this.dScale[1] = this.control_points[i+1].scale[1] - this.control_points[i].scale[1];
            this.dScale[2] = this.control_points[i+1].scale[2] - this.control_points[i].scale[2];

            this.calcAngles(i);
        }

        var t = this.time - this.currDur;
        this.center[0] = this.control_points[i].center[0] + this.vel_dir[i][1] * t;
        this.center[1] = this.control_points[i].center[1] + this.vel_dir[i][2] * t;
        this.center[2] = this.control_points[i].center[2] + this.vel_dir[i][3] * t;

        this.radius = this.control_points[i].radius + this.dRadius * this.time / this.vel_dir[i][0];
        this.scale[0] = this.control_points[i].scale[0] + this.dScale[0] * this.time / this.vel_dir[i][0];
        this.scale[1] = this.control_points[i].scale[1] + this.dScale[1] * this.time / this.vel_dir[i][0];
        this.scale[2] = this.control_points[i].scale[2] + this.dScale[2] * this.time / this.vel_dir[i][0];

        this.rotateXY = this.angleXY + this.time * this.dAngXY / this.vel_dir[i][0];
        this.rotateYZ = this.angleYZ + this.time * this.dAngYZ / this.vel_dir[i][0];
        this.rotateXZ = this.angleXZ + this.time * this.dAngXZ / this.vel_dir[i][0];

        return ;
    }
}

//Makes the animation's display
CompleteAnimation.prototype.display = function(scene, obj) {
    scene.pushMatrix();
    // Translate center
    scene.translate(this.center[0], this.center[1], this.center[2]);
    
    scene.pushMatrix();
    //Apply transformations relative to the center of the animation
    if(this.rotateXZ) 
        scene.rotate(this.rotateXZ, 0, 1, 0);
    if(this.rotateYZ)
        scene.rotate(this.rotateYZ, 1, 0, 0);
    if(this.rotateXY)
        scene.rotate(this.rotateXY, 0, 0, 1);

    scene.translate(this.radius, 0, 0);

    scene.pushMatrix();

    if(this.rotateXY)
        scene.rotate(-this.rotateXY, 0, 0, 1);
    if(this.rotateYZ)
        scene.rotate(-this.rotateYZ, 1, 0, 0);
    if(this.rotateXZ) 
        scene.rotate(-this.rotateXZ, 0, 1, 0);
    scene.rotate(Math.PI / 2, 1, 0, 0);
    

    scene.scale(this.scale[0], this.scale[1], this.scale[2]);
    obj.display();
    scene.popMatrix();

    scene.popMatrix();

    scene.popMatrix();
}