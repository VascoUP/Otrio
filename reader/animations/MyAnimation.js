/**
 Animation's constructor
*/
var Animation = function( ) {
    if (this.constructor === Animation) {
      throw new Error("Can't instantiate abstract class!");
    }
};

//Abstract method used by children classes to apply the animation
Animation.prototype.update = function() {
    throw new Error("Abstract method!");
}

//Creates the transformations needed to the animation
Animation.prototype.transform = function(scene) {
    scene.translate(this.position[0], this.position[1], this.position[2]);
    scene.rotate(this.rotate, 0, 1, 0);
}


/*
    - LINEAR ANIMATION -
*/
var LinearAnimation = function ( id, control_points, duration ) {
    Animation.apply(this, arguments);

    if( control_points.length < 1 )
        return ;

    this.lastFrame = false;  
    this.control_points = control_points;

    this.duration = duration > 0 ? duration : 1;
    this.time = 0;

    this.currControlPoint = -1;

    this.calcInit();
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

//Calculations about the linear animation
LinearAnimation.prototype.calcInit = function() {
    var distance = 0;
    var control_points_vel = [];

    for( var i = 1; i < this.control_points.length; i++ ) {
        var d = Math.sqrt( Math.pow( this.control_points[i][0] - this.control_points[i-1][0], 2) + 
                                Math.pow( this.control_points[i][1] - this.control_points[i-1][1], 2) +
                                Math.pow( this.control_points[i][2] - this.control_points[i-1][2], 2) );
        distance += d;
        control_points_vel.push(d);
    }

    this.vel_dir = [];

    for( var i = 1; i < this.control_points.length; i++ ) {
        var d = control_points_vel[i-1];
        var t = this.duration * d / distance;

        var vel = [ 
                //Duration of this control point
                t,
                //Velocity in x                                 
                (this.control_points[i][0] - this.control_points[i-1][0]) / t,
                //Velocity in y 
                (this.control_points[i][1] - this.control_points[i-1][1]) / t,
                //Velocity in z
                (this.control_points[i][2] - this.control_points[i-1][2]) / t];
              
        this.vel_dir.push(vel);
    }


    this.position = this.control_points[0].slice();

    var dX = this.control_points[0][0] - this.control_points[1][0];
    var dZ = this.control_points[1][2] - this.control_points[0][2];
    this.rotate = Math.atan( dZ / dX ) + Math.PI / 2;

    if( dX >= 0 )
        this.rotate -= Math.PI;
}

//Updates the linear animation
LinearAnimation.prototype.update = function( dTime ) {
    if( this.lastFrame )
        return;
        
    // Given the time, calculate the next point in the trajectory
    this.time += dTime;
    if( this.time >= this.duration ) {
        this.lastFrame = true;
        this.position = this.control_points[this.control_points.length - 1].slice();
        return ;
    }
    
    var dur = 0; //Current calculated duration
    for( var i = 0; i < this.vel_dir.length; i++) {

        if( this.currControlPoint > i || 
            this.time > dur + this.vel_dir[i][0] ) { //If the time is past this control point
            dur += this.vel_dir[i][0];
            continue;
        }

        //If it gets here than this is the right index
        if( this.currControlPoint != i ) {
            //Only needs to update rotate when it changes control_points
            this.currControlPoint = i;

            var dX = this.control_points[i][0] - this.control_points[i+1][0];
            var dZ = this.control_points[i+1][2] - this.control_points[i][2];
            this.rotate = Math.atan( dZ / dX ) + Math.PI / 2;

            if( dX >= 0 )
                this.rotate -= Math.PI;
        }

        var t = this.time - dur;
        this.position[0] = this.control_points[i][0] + this.vel_dir[i][1] * t;
        this.position[1] = this.control_points[i][1] + this.vel_dir[i][2] * t;
        this.position[2] = this.control_points[i][2] + this.vel_dir[i][3] * t;

        break;
    }
}


/*
    - CIRCULAR ANIMATION -
*/
var CircularAnimation = function( id, center, radius, init_angle, rotate_angle, duration ) {
    Animation.apply(this, arguments);
    
    this.lastFrame = false;
    this.center = center;
    this.radius = radius;
    this.init_angle = init_angle;
    this.rotate_angle = rotate_angle;
    this.duration = duration > 0 ? duration : 1;
    this.time = 0;

    this.calcInit();
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

//Calculations about the circular animation
CircularAnimation.prototype.calcInit = function() {
    this.position = this.center.slice();

    //X coord
    this.position[0] += this.radius * Math.sin(this.init_angle);
    //Z coord
    this.position[2] += this.radius * Math.cos(this.init_angle);

    this.rotate = this.init_angle + Math.PI / 2;
}

//Updates the circular animatipon
CircularAnimation.prototype.update = function( dTime ) {
    if( this.lastFrame )
        return;

    var ang;
    var rotate_ang = this.rotate_angle < 0 ? Math.PI : -Math.PI;
    this.position = this.center.slice();

    
    // Given the time, calculate the next point in the trajectory
    this.time += dTime;
    if( this.time >= this.duration ) {
        this.lastFrame = true;
            
        ang = this.init_angle + this.rotate_angle;
        //X coord
        this.position[0] += this.radius * Math.sin(ang);
        //Z coord
        this.position[2] += this.radius * Math.cos(ang);

        this.rotate = this.rotate_angle < 0 ? ang - Math.PI / 2 : ang + Math.PI / 2;

        return ;
    }

    ang = this.init_angle + (this.time * this.rotate_angle / this.duration);
    
    //X coord
    this.position[0] += this.radius * Math.sin(ang);
    //Z coord
    this.position[2] += this.radius * Math.cos(ang);

    this.rotate = this.rotate_angle < 0 ? ang - Math.PI / 2 : ang + Math.PI / 2;
}



/*
    - CONTINUOUS CIRCULAR ANIMATION -
*/

var ContCircularAnimation = function( id, center, radius, init_angle, rotate_angle /* per second */ ) {
    Animation.apply(this, arguments);
    
    this.lastFrame = false;
    this.center = center;
    this.radius = radius;
    this.init_angle = init_angle;
    this.rotate_angle = rotate_angle;
    this.time = 0;

    this.calcInit();
};

ContCircularAnimation.prototype = Object.create(Animation.prototype);
ContCircularAnimation.prototype.constructor = ContCircularAnimation;

//Calculations about the circular animation
ContCircularAnimation.prototype.calcInit = function() {
    this.position = this.center.slice();

    //X coord
    this.position[0] += this.radius * Math.sin(this.init_angle);
    //Z coord
    this.position[2] += this.radius * Math.cos(this.init_angle);

    this.rotate = this.init_angle + Math.PI / 2;
}

//Updates the circular animatipon
ContCircularAnimation.prototype.update = function( dTime ) {
    if( this.lastFrame )
        return;

    var ang;
    var rotate_ang = this.rotate_angle < 0 ? Math.PI : -Math.PI;
    this.position = this.center.slice();

    
    // Given the time, calculate the next point in the trajectory
    this.time += dTime;

    ang = this.init_angle + this.time * this.rotate_angle;
    
    //X coord
    this.position[0] += this.radius * Math.sin(ang);
    //Z coord
    this.position[2] += this.radius * Math.cos(ang);

    this.rotate = this.rotate_angle < 0 ? ang - Math.PI / 2 : ang + Math.PI / 2;
}