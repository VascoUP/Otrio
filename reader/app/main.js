//From https://github.com/EvanHahn/ScriptInclude
include=function(){function f(){var a=this.readyState;(!a||/ded|te/.test(a))&&(c--,!c&&e&&d())}var a=arguments,b=document,c=a.length,d=a[c-1],e=d.call;e&&c--;for(var g,h=0;c>h;h++)g=b.createElement("script"),g.src=arguments[h],g.async=!0,g.onload=g.onerror=g.onreadystatechange=f,(b.head||b.getElementsByTagName("head")[0]).appendChild(g)};
serialInclude=function(a){var b=console,c=serialInclude.l;if(a.length>0)c.splice(0,0,a);else b.log("Done!");if(c.length>0){if(c[0].length>1){var d=c[0].splice(0,1);b.log("Loading "+d+"...");include(d,function(){serialInclude([]);});}else{var e=c[0][0];c.splice(0,1);e.call();};}else b.log("Finished.");};serialInclude.l=new Array();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

serialInclude(['../lib/CGF.js', 

                'app/XMLscene.js', 'app/MyInterface.js', 'app/Client.js', 'app/Otrio.js',

                'graph/MySceneGraph.js', 'graph/ViewInfo.js', 
                'graph/TextureInfo.js', 'graph/Graph.js', 
                
                'primitives/MyRectangle.js', 'primitives/MyTriangle.js', 'primitives/MyCylinder.js', 
                'primitives/MySphere.js','primitives/MyTorus.js', 'primitives/MyVehicle.js',
                'primitives/MyPatch.js', 'primitives/MyPlane.js', 'primitives/MyBoard.js',
                'primitives/MyGameBoard.js', 'primitives/MyBox.js', 'primitives/MyTable.js',

                'animations/MyAnimation.js', 'animations/MyCompleteAnimation.js', 
                'animations/AnimationInfo.js', 'animations/CameraAnimate.js',
                
                'game/Game.js', 'game/GameBoard.js', 'game/AuxiliarBoard.js', 
                'game/Tile.js', 'game/Piece.js', 'game/Player.js', 
                'game/GameMove.js', 'game/GameSequence.js',

main=function() {
	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    this.myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

	// get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml 
	// or use "demo.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor) 
	
	var filename=getUrlVars()['file'] || "Scene1.dsx";
	this.scenes = ["Scene1.dsx", "Scene2.dsx"];
	this.indexScene = 0;

	// create and load graph, and associate it to scene. 
	// Check console for loading errors
	var myGraph = new MySceneGraph(filename, myScene);
	
	// start
    app.run();
}

]);

//Global function to be used to change the scene
newScene = function(){
    if(this.indexScene == 0)
        this.indexScene = 1;
	else
		this.indexScene = 0;
	
    var newGraph = new MySceneGraph(this.scenes[this.indexScene], this.myScene);
}
