/**
*	Interface's constructor
*/
function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

//Initiates the interface
MyInterface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);
	
	this.gui = new dat.GUI();
	
	//Creates the menu
	this.createMenu();

	return true;
};

//Function that creates the game's main menu
MyInterface.prototype.createMenu = function(){
	//Adds the change scene button
	this.gui.add(this.scene, 'changeScene').name("Change Scene");
	
	//Buttons that interfere with the game
	this.scene.game.changeButtons();
};

//Processes the keyboard events
MyInterface.prototype.processKeyboard = function(event) {
	
	CGFinterface.prototype.processKeyUp.call(this, event);

	//If lower case letter than calculate its upper case equal
	var code = (event.keyCode >= 97 && event.keyCode <= 122)? event.keyCode - 32 : event.keyCode;
	code = (code >= 97 && code <= 122) ? code - 32 : code;

	switch (String.fromCharCode(code))
	{
		case ("I"):
			this.scene.game.playReplay();
			break;
		case ("V"):
			this.scene.changeScene();
			break;
		case ("Q"):
			this.scene.game.quit();
			break;
		case ("U"):
			this.scene.game.undoMove();
			break;
	};	
};