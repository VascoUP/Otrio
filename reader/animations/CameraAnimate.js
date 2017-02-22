/**
* 	Object's constructor that enables the camera rotation
*/
function CameraAnimate(camera) {
    this.camera = camera;

    this.position = camera.position;
    this.nPosition = camera.position.slice();
    this.dPosition = [0, 0, 0, 0];
    this.target = camera.target;
    this.nTarget = camera.target.slice();
    this.dTarget = [0, 0, 0, 0];

    this.rotate = 0;
    this.dRotate = 0;    
    this.axis = [0, 0, 0];

    this.time = 0;
    this.duration = 0;

    this.lastFrame = true;

    this.translate = false;
}

CameraAnimate.prototype = Object.create(Animation.prototype);
CameraAnimate.prototype.constructor = CameraAnimate;

/**
*	Sets the camera's translation
* 	The arguments passed in the function are the new values ​​that the animation will take
*/
CameraAnimate.prototype.setTranslate = function(nextPosition, nextTarget, duration) {
    this.time = 0;
    this.translate = true;
    this.lastFrame = false;

    this.dPosition[0] = (nextPosition[0] - this.position[0]) / duration;
    this.dPosition[1] = (nextPosition[1] - this.position[1]) / duration;
    this.dPosition[2] = (nextPosition[2] - this.position[2]) / duration;

    this.dTarget[0] = (nextTarget[0] - this.target[0]) / duration;
    this.dTarget[1] = (nextTarget[1] - this.target[1]) / duration;
    this.dTarget[2] = (nextTarget[2] - this.target[2]) / duration;

    this.nPosition = nextPosition.slice();
    this.nTarget = nextTarget.slice();

    this.duration = duration;
};

/**
*	Sets the camera's rotation
* 	The arguments passed in the function are the new values ​​that the animation will take
*/
CameraAnimate.prototype.setRotate = function(axis, rotate_angle, duration) {
    this.time = 0;
    this.translate = false;
    this.lastFrame = false;

    this.axis = axis;
    this.dRotate = rotate_angle / duration;

    this.duration = duration;
};

//Updates the circular animation
CameraAnimate.prototype.update = function( dSec ) {
    if( this.lastFrame )
        return;
    
    // Given the time, calculate the next point in the trajectory
    this.time += dSec;
    if( this.time >= this.duration ) {
        this.lastFrame = true;

        this.dPosition = [0, 0, 0, 0];
        this.dTarget = [0, 0, 0, 0];

        if( this.translate ) {
            this.position[0] = this.nPosition[0];
            this.position[1] = this.nPosition[1];
            this.position[2] = this.nPosition[2];
            this.camera.setPosition(this.position);

            this.target[0] = this.nTarget[0];
            this.target[1] = this.nTarget[1];
            this.target[2] = this.nTarget[2];
            this.camera.setTarget(this.target);
        } else if( this.dRotate != 0 ) {
            var tmp = this.target[1];
            this.target[1] = this.position[1];
            this.camera.setTarget(this.target);

            this.camera.orbit(this.axis, this.dRotate * (this.duration - this.time + dSec));

            this.target[1] = tmp;
        }

        this.rotate = 0;

        return ;
    }

    if( this.translate ) {
        this.position[0] += this.dPosition[0] * dSec;
        this.position[1] += this.dPosition[1] * dSec;
        this.position[2] += this.dPosition[2] * dSec;
        this.camera.setPosition(this.position);

        this.target[0] += this.dTarget[0] * dSec;
        this.target[1] += this.dTarget[1] * dSec;
        this.target[2] += this.dTarget[2] * dSec;
        this.camera.setTarget(this.target);
        
    } else if( this.dRotate != 0 ) {
        var tmp = this.target[1];
        this.target[1] = this.position[1];
        this.camera.setTarget(this.target);

        this.camera.orbit(this.axis, this.dRotate * dSec);

        this.target[1] = tmp;
    }
}
