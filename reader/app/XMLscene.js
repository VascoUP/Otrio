//Scene's constructor
function XMLscene(myInterface) {
    CGFscene.call(this);
    this.myInterface = myInterface;
};

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

//Initiates the scene
XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);
	this.time = 0;
	this.setPickEnabled(true);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.enableTextures(true);

	this.axis = new CGFaxis(this);

	this.material = new CGFappearance(this);
    this.material.setAmbient(0, 0, 0, 1);
    this.material.setDiffuse(0.6, 0.6, 0.6, 1);
    this.material.setSpecular(0.1, 0.1, 0.1, 1);    
    this.material.setShininess(1);

	this.material1 = new CGFappearance(this);
    this.material1.setAmbient(0.2, 0, 0, 1);
    this.material1.setDiffuse(0.5, 0, 0, 1);
    this.material1.setSpecular(0.2, 0, 0, 1);    
    this.material1.setShininess(10);

	this.material2 = new CGFappearance(this);
    this.material2.setAmbient(0, 0.1, 0.1, 1);
    this.material2.setDiffuse(0, 0.5, 0.5, 1);
    this.material2.setSpecular(0, 0.1, 013, 1);    
    this.material2.setShininess(10);

    this.currentCamera = 0;

	this.loaded = false;
	
	this.game = new Game(this, this.material, this.material1, this.material2);

	/* 60 frames per second */
	this.setUpdatePeriod(1/60);
};

//Initiates the lights
XMLscene.prototype.initLights = function () {
	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();
};

//Initiates the cameras
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () {
	this.loaded = true;
	//Set axis length with the correspondent values
	//this.axis = new CGFaxis(this, this.graph.axis_length);
	this.currentCamera = this.graph.default_view;

	for(var i = 0; i < this.graph.views.length; i++) {
		var v = this.graph.views[i];

		if( v.id == this.currentCamera ) {
			this.camera = new CGFcamera(v.angle, v.near, v.far, v.from , v.to);
		}
	}

	this.gl.clearColor(this.graph.background[0],this.graph.background[1],this.graph.background[2],this.graph.background[3]);
	this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

	this.game.onGraphLoaded();
};

//Picking function
XMLscene.prototype.logPicking = function ()	{
	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			for (var i=0; i< this.pickResults.length; i++) {
				var obj = this.pickResults[i][0]; // object selected
				if (obj) {
					var customId = this.pickResults[i][1]; // object selected id
					this.game.pickObj(obj);
				}
			}
			this.pickResults.splice(0,this.pickResults.length);
		}
	}
};

//Changes the cameras
XMLscene.prototype.changeView = function() {
	for(var i = 0; i < this.graph.views.length; i++) {
		if( this.graph.views[i].id == this.currentCamera ) {
			var indice;
			if( i == (this.graph.views.length-1) ) {
				indice = 0;
				this.currentCamera = this.graph.views[0].id;
			}
			
			else {
				indice = i + 1;
				this.currentCamera = this.graph.views[i+1].id;
			}
			
			this.camera = new CGFcamera(this.graph.views[indice].angle, this.graph.views[indice].near, this.graph.views[indice].far, this.graph.views[indice].from , this.graph.views[indice].to);
			break;
		}
	}
}

//Changes the materials
XMLscene.prototype.changeMaterial = function() {
	this.graph.graph.changeMaterials();
};

//Updates the scene
XMLscene.prototype.update = function( dTime ) {
	var dSec = dTime * Math.pow(10, -14);
	
	this.graph.graph.update(dSec);
	this.game.update(dSec);
};

//Displays the scene
XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it		
	this.clearPickRegistration();

	if (this.pickMode == false) {
		
		if (this.graph.loadedOk) {
			for(var i = 0; i < this.graph.nLights; i++)
				this.lights[i].update();
			this.graph.graph.drawScene();
			this.game.display(this.material);
		}
	}
	else
		this.game.registerForPick();
	
	this.logPicking();
};

//Changes the scene
XMLscene.prototype.changeScene = function(){
	newScene();
}