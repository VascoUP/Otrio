//SceneGraph's constructor
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph = this;

	this.transformations = {};
	this.primitives = {};
	this.animations = {};
	this.graph = new Graph(this);

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

//Callback to be executed after successful reading
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseDSX(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

//Verifies if each element is in the right place
MySceneGraph.prototype.parseDSX= function(rootElement) {

	var ch = rootElement.children;
	var elems = [ false, false, false, false, false, false, false, false, false ];
	var err;

	if( ch == null || ch.length != 10 )
		return "DSX -> Too few, or too many, elements";

	for( var i = 0; i < ch.length; i++ ) {
		var name = ch[i].tagName;
		
		switch(name) {
		case 'scene':

			if( i != 0 )
				console.warn("<scene> element is out of place");

			if( elems[0] )
				return "Found 2 <scene> elements";
			else
				elems[0] = true;

			if( (err = this.parseScenes(ch[i])) != null )
				return err;
			pScene = true;

			break;

		case 'views':

			if( i != 1 )
				console.warn("<views> element is out of place");

			if( elems[1] )
				return "Found 2 <views> elements";
			else
				elems[1] = true;

			if( (err = this.parseViews(ch[i])) != null )
				return err;

			break;

		case 'illumination':

			if( i != 2 )
				console.warn("<illumination> element is out of place");

			if( elems[2] )
				return "Found 2 <illumination> elements";
			else
				elems[2] = true;

			if( (err = this.parseIlluminations(ch[i])) != null )
				return err;

			break;

		case 'lights':

			if( i != 3 )
				console.warn("<lights> element is out of place");
			
			if( elems[3] )
				return "Found 2 <lights> elements";
			else
				elems[3] = true;

			if( (err = this.parseLights(ch[i])) != null )
				return err;

			break;

		case 'textures':

			if( i != 4 )
				console.warn("<textures> element is out of place");

			if( elems[4] )
				return "Found 2 <textures> elements";
			else
				elems[4] = true;
			
			if( (err = this.parseTextures(ch[i])) != null )
				return err;

			break;

		case 'materials':

			if( i != 5 )
				console.warn("<materials> element is out of place");

			if( elems[5] )
				return "Found 2 <materials> elements";
			else
				elems[5] = true;

			if( (err = this.parseMaterials(ch[i])) != null )
				return err;

			break;

		case'transformations':

			if( i != 6 )
				console.warn("<transformations> element is out of place");

			if( elems[6] )
				return "Found 2 <transformations> elements";
			else
				elems[6] = true;

			if( (err = this.parseTransformations(ch[i])) != null )
			return err;

			break;

		case 'animations':

			if( i != 7 )
				console.warn("<animations> element is out of place");

			if( elems[7] )
				return "Found 2 <animations> elements";
			else
				elems[7] = true;
			
			if( (err = this.parseAnimations(ch[i])) != null )
				return err;

			break;
		case 'primitives':

			if( i != 8 )
				console.warn("<primitives> element is out of place");

			if( elems[8] )
				return "Found 2 <primitives> elements";
			else
				elems[8] = true;
			
			if( (err = this.parsePrimitives(ch[i])) != null )
				return err;

			break;

		case 'components':

			if( i != 9 )
				console.warn("<components> element is out of place");

			if( elems[9] )
				return "Found 2 <components> elements";
			else
				elems[9] = true;
			
			if( (err = this.parseComponents(ch[i])) != null )
				return err;

			break;

		default:
			return "No such element - " + name;
		}
	}

	return this.graph.connectedGraph();
};

//Callback to be executed on any read error
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};

//Parses the scene's elements
MySceneGraph.prototype.parseScenes = function(scene_elems) {
	if (scene_elems == null || scene_elems.attributes.length < 2)
		return "Scene -> Missing required information";
	else if(scene_elems.attributes.length > 2)
		console.warn("Scene -> More attributes than required");

	this.graph.idHead = this.reader.getString(scene_elems, 'root');
	this.axis_length = this.reader.getFloat(scene_elems, 'axis_length');
	
	if(this.graph.idHead == undefined || this.axis_length == undefined)
		return "Scene -> Wrong name for one of the attributes (root / axis_length)";
	else if(this.axis_length < 0)
		console.warn("Axis length can't be negative");
};

//Parses the the different views' elements
MySceneGraph.prototype.parseViews = function(views_elems) {

	var nnodes = views_elems.children.length;
	if (views_elems == null || nnodes < 1 || views_elems.attributes.length < 1) 
		return "Views -> Missing required information";
	else if( views_elems.attributes.length > 1 )
		console.warn("Views -> More attributes than required");

	this.default_view = this.reader.getString(views_elems, 'default');
	
	if(this.default_view == undefined)
		return "View -> Missing attribute default";
	
	this.views=[nnodes];

	for(var i = 0; i < nnodes; i++) {

		var perspective_elems = views_elems.children[i];

		if (perspective_elems == null || perspective_elems.attributes.length < 4)
			return "Views -> Prespectives -> Missing required information";
		else if( perspective_elems.attributes.length > 4 )
			console.warn("Views -> Prespective -> More attributes than required");

		var id, near, far, angle;
		id = perspective_elems.id;
		near = this.reader.getFloat(perspective_elems, 'near');
		far = this.reader.getFloat(perspective_elems, 'far');
		angle = Math.PI * this.reader.getFloat(perspective_elems,'angle') / 180;
		
		if(id == undefined)
			return ("Views -> Prespective " + id + " ->  Wrong name for one of the attributes (near / far / angle)");
		else if(near == undefined || far == undefined || angle == undefined)
			return ("Views -> Prespective ->  Wrong name for attribute id");

		//Making sure that there are no to prespectives with the same id
		for(var j = 0; j < this.views.length; j++) {
			if(this.views[j] == null)
				break;
			if(this.views[j].id == id)
				return "Views -> Prespective " + id + " -> Same id error";
		}

		this.views[i] = new ViewInfo(id, near, far, angle);
		
		if( i == 0 && id != this.default_view)
			console.warn("Views -> First view defined is not equal to default view");

		var from_elems = perspective_elems.getElementsByTagName('from');

		if(from_elems == null || from_elems.length != 1 || from_elems[0].attributes.length < 3)
			return "Views -> Prespective " + id + " -> From -> Missing required information";
		else if( from_elems[0].attributes.length > 3 )
			console.warn("Views -> Prespective -> From -> More attributes than required");

		var fromE = from_elems[0];
		
		if(	this.reader.getFloat(fromE, 'x') == undefined ||
			this.reader.getFloat(fromE, 'y') == undefined ||
			this.reader.getFloat(fromE, 'z') == undefined	)
				return "Views -> Prespective "+ id + " -> From -> At least one attribute name is wrong (x / y / z)";
			
		this.views[i].setFrom(this.reader.getFloat(fromE, 'x'),
								this.reader.getFloat(fromE, 'y'),
								this.reader.getFloat(fromE, 'z'));

		var to_elems = perspective_elems.getElementsByTagName('to');

		if(to_elems == null || to_elems.length != 1 || to_elems[0].attributes.length < 3)
			return "Views -> Prespective " + id + " -> To -> Missing required information";
		else if( to_elems[0].attributes.length > 3 )
			console.warn("Views -> Prespective -> To -> More attributes than required");

		var toE = to_elems[0];
		
		if(	this.reader.getFloat(toE, 'x') == undefined ||
			this.reader.getFloat(toE, 'y') == undefined ||
			this.reader.getFloat(toE, 'z') == undefined	)
				return "Views -> Prespective "+ id + " -> To -> At least one attribute name is wrong (x / y / z)";
			
		this.views[i].setTo(this.reader.getFloat(toE, 'x'),
								this.reader.getFloat(toE, 'y'),
								this.reader.getFloat(toE, 'z'));
	}

	//Making sure that the view with the id equal to the default_view is defined
	var j;
	for(j = 0; j < this.views.length; j++) {
		if(this.views[j].id == this.default_view)
			break;
	}
	if( j == this.views.length) {
		console.warn("Views -> Couldn't find view with the same id as default_view");
		this.default_view = this.views[0].id; //We know that it has to exist at least one view to get here
	}
};

//Parses the illumnitations' elements
MySceneGraph.prototype.parseIlluminations = function(illumination_elem) {
	
	if (illumination_elem == null || illumination_elem.attributes.length < 2) 
		return "Illumination attribute error";
	else if(illumination_elem.attributes.length > 2)
		console.warn("Illumination -> More attributes than required");
	
	var doublesided = this.reader.getBoolean(illumination_elem, 'doublesided');
	var local = this.reader.getBoolean(illumination_elem, 'local');

	if(	doublesided == undefined || local == undefined )
		return "Illumination -> Doublesided or local variables missing";
			
	if( (doublesided != 0 && doublesided != 1 ) || (local != 0 && local != 1) )
		console.warn("Doublesided and local must be 0 or 1");

	var ambient = illumination_elem.getElementsByTagName('ambient');

	if( ambient == null || ambient.length < 1 || ambient[0].attributes.length < 4)
		return "Illumination -> Ambient  attributes error";
	else if(ambient[0].attributes.length > 4)
		console.warn("Illumination -> Ambient -> More attributes than required");
	else if( ambient.length > 1 ) 
		//It shouldn't stop reading the dsx file because of this
		console.warn("There are more than 1 ambient elements in illumination, only the first will be considered");

	var ambient_elem = ambient[0];

	var r, g, b, a;
	r = this.reader.getFloat(ambient_elem, 'r');
	g = this.reader.getFloat(ambient_elem, 'g');
	b = this.reader.getFloat(ambient_elem, 'b');
	a = this.reader.getFloat(ambient_elem, 'a');
	
	if(	r == undefined || g == undefined || b == undefined || a == undefined )
		return "Illumination -> Ambient -> Missing required information";
			
	if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
		console.warn("Ambient -> RGBA values must be between 0 and 1");
			
	this.ambient = [r, g, b, a];

	var background = illumination_elem.getElementsByTagName('background');

	if( background == null || background.length < 1 || background[0].attributes.length < 4)
		return "Illumination -> Background attribute error";
	else if( background[0].attributes.length > 4 )
		console.warn("Illumination -> Background -> More attributes than required");
	else if( background.length > 1 )
		//It shouldn't' stop reading the dsx file because of this
		console.warn("There are more than 1 ambient elements in illumination, only the first will be considered");

	var background_elem = background[0];

	r = this.reader.getFloat(background_elem, 'r');
	g = this.reader.getFloat(background_elem, 'g');
	b = this.reader.getFloat(background_elem, 'b');
	a = this.reader.getFloat(background_elem, 'a');

	if(	r == undefined || g == undefined || b == undefined || a == undefined )
		return "Illumination -> Background -> Missing required information";
			
	if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
		console.warn("Background -> RGBA values must be between 0 and 1");
			
	this.background = [r, g, b, a];	
};

//Parses the lights' elements
MySceneGraph.prototype.parseLights = function(lights) {

	var lights;

	this.nLights = 0;
	this.index = 0;
	this.name = ""; //Lights name (omni or spot)
	this.lightType = [this.name]; //To save the type of lights

	nnodes = lights.children.length;
	if (lights == null || nnodes < 1) 
		return "Lights error -> You need at least one omni ou spot lights";
	else if( lights.attributes.length != 0 )
		console.warn("Lights -> More attributes the required");

	var lightsId = [];

	for( var i = 0; i < lights.children.length; i++ ) {

		var light = lights.children[i];
		
		var type = light.tagName;
	
		if(type == 'omni') {
			if(light.attributes.length < 2)
				return "Omni Light -> Wrong number of attributes";
			else if(light.attributes.length > 2)
				console.warn("Omni Light -> Wrong number of attributes");
		}
			
		if(type == 'spot') {
			if(light.attributes.length < 4)
				return "Spot Light -> Wrong number of attributes";
			else if(light.attributes.length > 4)
				console.warn("Spot Light -> Wrong number of attributes");
		}
		
		var id = this.reader.getString(light, 'id');
		
		if(id == undefined)
			return "Lights -> Missing the light's id";

		for( var j = 0; j < lightsId.length; j++)
			//Check whether the id of all lights is the same
			if( lightsId[j] == id )
				return "Lights -> There are 2 lights with the same id";

		var locations = light.getElementsByTagName('location');
		var ambients = light.getElementsByTagName('ambient');
		var diffuses = light.getElementsByTagName('diffuse');
		var speculars = light.getElementsByTagName('specular');

		if( locations.length < 1 || ambients.length < 1 || diffuses.length < 1 || speculars.length < 1 )
			return "Lights -> Missing required information";

		if( locations.length > 1 )
			console.warn("Lights -> Only 1 location is needed");

		var location_w;
		if(type == 'omni'){
			if(locations[0].attributes.length < 4)
				return "Omni Light " + id + " -> Location -> Wrong number of attributes";
			else if(locations[0].attributes.length > 4)
				console.warn("Omni Light " + id + " -> Location -> More attributes than required");
			location_w = this.reader.getFloat(locations[0], 'w');
		}
		else{
			if(locations[0].attributes.length < 3)
				return "Spot Light " + id + " -> Location -> Wrong number of attributes";
			else if(locations[0].attributes.length > 3)
				console.warn("Spot Light " + id + " -> Location -> More attributes than required");
			location_w = 1; //To ensure that we set the light position with the variable w
		}
			
		var location_x = this.reader.getFloat(locations[0], 'x');
		var location_y = this.reader.getFloat(locations[0], 'y');
		var location_z = this.reader.getFloat(locations[0], 'z');
	
		if( location_x == undefined || 
			location_y == undefined ||
			location_z == undefined ||
			location_w == undefined )
				return "Lights -> Location -> Missing required information";
				
		if(location_w != 0 && location_w != 1)
			console.warn("Location_w must be 0 or 1");
		
		if( ambients.length > 1 )
			console.warn("Lights -> Only 1 ambient is needed");
		
		if(ambients[0].attributes.length < 4)
			return "Light " + id + "-> Ambient -> Wrong number of attributes";
		else if(ambients[0].attributes.length > 4)
			return "Light " + id + "-> Ambient -> More attributes than required";

		var ambient_r = this.reader.getFloat(ambients[0], 'r');
		var ambient_g = this.reader.getFloat(ambients[0], 'g');
		var ambient_b = this.reader.getFloat(ambients[0], 'b');
		var ambient_a = this.reader.getFloat(ambients[0], 'a');
		
		if(	ambient_r == undefined || ambient_g == undefined || ambient_b == undefined || ambient_a == undefined )
			return "Lights -> Ambient -> Missing required information";
			
		if( ambient_r < 0 || ambient_r > 1 || ambient_g < 0 || ambient_g > 1 || 
			ambient_b < 0 || ambient_b > 1 || ambient_a < 0 || ambient_a > 1 )
				console.warn("Lights -> Ambient -> RGBA values must be between 0 and 1");

		if( diffuses.length > 1 )
			console.warn("Lights -> Only 1 diffuse is needed");
		
		if(diffuses[0].attributes.length < 4)
			return "Light " + id + "-> Diffuse -> Wrong number of attributes";
		else if(diffuses[0].attributes.length > 4)
			return "Light " + id + "-> Diffuse -> More attributes than required";

		var diffuse_r = this.reader.getFloat(diffuses[0], 'r');
		var diffuse_g = this.reader.getFloat(diffuses[0], 'g');
		var diffuse_b = this.reader.getFloat(diffuses[0], 'b');
		var diffuse_a = this.reader.getFloat(diffuses[0], 'a');

		if(	diffuse_r == undefined || diffuse_g == undefined || diffuse_b == undefined || diffuse_a == undefined )
			return "Lights -> Diffuse -> Missing required information";
			
		if( diffuse_r < 0 || diffuse_r > 1 || diffuse_g < 0 || diffuse_g > 1 || 
			diffuse_b < 0 || diffuse_b > 1 || diffuse_a < 0 || diffuse_a > 1 )
				console.warn("Lights -> Diffuse -> RGBA values must be between 0 and 1");

		if( speculars.length > 1 )
			console.warn("Light " + id + " -> Only 1 speculars is needed");
		
		if(speculars[0].attributes.length < 4)
			return "Light " + id + "-> Specular -> Wrong number of attributes";
		else if(speculars[0].attributes.length > 4)
			return "Light " + id + "-> Specular -> More attributes than required";
		
		var specular_r = this.reader.getFloat(speculars[0], 'r');
		var specular_g = this.reader.getFloat(speculars[0], 'g');
		var specular_b = this.reader.getFloat(speculars[0], 'b');
		var specular_a = this.reader.getFloat(speculars[0], 'a');

		if(	specular_r == undefined || specular_g == undefined || specular_b == undefined || specular_a == undefined )
			return "Lights -> Specular -> Missing required information";
			
		if( specular_r < 0 || specular_r > 1 || specular_g < 0 || specular_g > 1 || 
			specular_b < 0 || specular_b > 1 || specular_a < 0 || specular_a > 1 )
				console.warn("Lights -> Specular -> RGBA values must be between 0 and 1");

		this.scene.lights[this.nLights].setPosition(location_x, location_y, location_z, location_w);
		this.scene.lights[this.nLights].setAmbient(ambient_r, ambient_g, ambient_b, ambient_a);
		this.scene.lights[this.nLights].setDiffuse(diffuse_r, diffuse_g, diffuse_b, diffuse_a);
		this.scene.lights[this.nLights].setSpecular(specular_r, specular_g, specular_b, specular_a);
		
		this.index = this.nLights;
		this.name = "omni";
		
		this.lightType.push(this.name);

		if( type == 'spot' ) {
			var targets = light.getElementsByTagName('target');

			if( targets.length < 1 )
				return "Lights -> Spot -> Missing required information";
			else if( targets.length > 1 )
				console.warn("Lights -> Spot -> Only 1 location is needed");
			
			if( targets[0].attributes.length < 3)
				return "Spot Light " + id + " -> Target -> Wrong number of attributes";
			else if( targets[0].attributes.length > 3) 
				console.warn("Spot Light " + id + " -> Target -> More attributes than required");

			var target_x = this.reader.getFloat(targets[0], 'x');
			var target_y = this.reader.getFloat(targets[0], 'y');
			var target_z = this.reader.getFloat(targets[0], 'z');

			if( target_x == undefined || 
				target_y == undefined ||  
				target_z  == undefined )
				return "Lights -> Spot -> Target -> Missing required information";

			var angle = Math.PI * this.reader.getFloat(light, 'angle') / 180 ;
			var exponent = this.reader.getFloat(light, 'exponent') ;
			
			if(angle == undefined || exponent == undefined)
				return "Lights -> Spot -> Missing required information or variables with wrong values";
			
			this.scene.lights[this.nLights].setSpotCutOff( angle );
			this.scene.lights[this.nLights].setSpotExponent( exponent );
			this.scene.lights[this.nLights].setSpotDirection( target_x - location_x, target_y - location_y, target_z - location_z );
		
			this.name = "spot";
			/* 	Because we first read information that is equal to omni and spot lights, so we save one more omni 
				light and after we replaced it by the respective spot light */
			if(this.index == this.nLights)
				this.lightType[this.lightType.length-1] = this.name; 
			else
				this.lightType.push(this.name);
		}

		this.scene.lights[this.nLights].update();

		var enabled = this.reader.getBoolean(light,  'enabled');
		if(  enabled == undefined || (enabled != 0 && enabled != 1) )
			return "Lights -> Property enabled with wrong values or missing information";
		
		if( enabled )
			this.scene.lights[this.nLights].enable();
		else
			this.scene.lights[this.nLights].disable();

		lightsId.push(id);

		this.nLights++;
	}
};

//Parses the different textures
MySceneGraph.prototype.parseTextures = function(texture) {
	
	var texture;
	
	if (texture == null) 
		return "Texture error";
	else if(texture.attributes.length != 0)
		console.warn("Textures -> More attributes than required");
	
	this.textures = {};

	var texture_elem = texture.getElementsByTagName('texture');
	
	if(texture_elem == undefined)
		return "Texture -> You need at least one texture";
	
	for( var i = 0; i < texture_elem.length; i++ ) {
		var textureElem = texture_elem[i];

		if(textureElem.attributes.length < 4)
			return "Textures -> Texture -> Missing required information";
		else if(textureElem.attributes.length > 4)
			console.warn("Textures -> Texture -> More attributes than required");

		var id = this.reader.getString(texture_elem[i], 'id');
		
		if( id == undefined )
			return "Texture -> ID -> Missing the required information"

		// Making sure that there are no two textures with the same id 
		if( this.textures[id] != undefined )
			return "Textures-> There are 2 textures with the same id (id="+id+")";

		var file = this.reader.getString(texture_elem[i], 'file');
		
		if( file == undefined )
			return "Texture -> Missing required information -> " + id + " -> File undefined";
		
		var t = new CGFtexture(this.scene, file);
		
		var length_t = this.reader.getFloat(texture_elem[i], 'length_t');
		var length_s = this.reader.getFloat(texture_elem[i], 'length_s');
		
		if( length_t == undefined || length_s == undefined)
			return "Texture -> Missing required information -> " + id + " -> length_t or length_s undefined";
		
		var texInfo = new TextureInfo( t, length_t, length_s);

		this.textures[id] = texInfo;
	}
};

//Parses the materials
MySceneGraph.prototype.parseMaterials = function(material) {
	
	var nnodes = material.children.length;
	
	if(material == null || nnodes < 1) 
		return "Material error";
	else if( material.attributes.length != 0 )
		console.warn("Materials -> More attribute than required");
	
	this.materials = {};

	for(var i = 0; i < nnodes; i++) {

		var material_elems = material.children[i];

		if (material_elems == null || material_elems.attributes.length < 1)
			return "Materials -> Material error";
		else if( material_elems.attributes.length > 1 )
			console.warn("Materials -> Materials -> More attribute than required");

		var id = material_elems.attributes.getNamedItem('id').value;
		
		if( id == undefined)
			return "Materials -> Material -> ID -> Missing required information";
	
		// Making sure that there are no two materials with the same id 
		if( this.materials[id] != undefined )
			return "Materials -> Material " + id + " -> Same id error";

		var appearance = new CGFappearance(this.scene);
		var emission = material_elems.getElementsByTagName('emission');

		if(emission == null || emission.length < 1)
			return "Materials -> Material " + id + " -> Emission-> Variable error";

		var r, g, b, a;
		var emissionElem = emission[0];
		if( emissionElem.attributes.length < 4 )
			return "Materials -> Material " + id + " -> -> Emission -> Missing required information";
		else if ( emissionElem.attributes.length > 4 )
			console.warn("Materials -> Material " + id + " -> -> Emission -> More attributes than required");
		r = this.reader.getFloat(emissionElem, 'r');
		g = this.reader.getFloat(emissionElem, 'g');
		b = this.reader.getFloat(emissionElem, 'b');
		a = this.reader.getFloat(emissionElem, 'a');
		
		if(	r == undefined || g == undefined || b == undefined || a == undefined )
			return "Materials -> Material " + id + " -> Emission -> Missing required information";
			
		if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
			console.warn("MaterialS -> Material " + id + " -> Emission -> RGBA values must be between 0 and 1");
		
		appearance.setEmission(r, g, b, a);
		
		var ambient = material_elems.getElementsByTagName('ambient');
		if(ambient == null || ambient.length < 1)
			return "Materials -> Material " + id + " -> Ambient-> Variable error";

		var ambientElem = ambient[0];
		if( ambientElem.attributes.length < 4 )
			return "Materials -> Material " + id + " -> -> Ambient -> Missing required information";
		else if ( ambientElem.attributes.length > 4 )
			console.warn("Materials -> Material " + id + " -> -> Ambient -> More attributes than required");
		r = this.reader.getFloat(ambientElem, 'r');
		g = this.reader.getFloat(ambientElem, 'g');
		b = this.reader.getFloat(ambientElem, 'b');
		a = this.reader.getFloat(ambientElem, 'a');

		if(	r == undefined || g == undefined || b == undefined || a == undefined )
			return "Materials -> Material " + id + " -> Ambient -> Missing required information";
			
		if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
			console.warn("Materials -> Material " + id + " -> Ambient -> RGBA values must be between 0 and 1");
		
		appearance.setAmbient(r, g, b, a);

		var diffuse = material_elems.getElementsByTagName('diffuse');
		if(diffuse == null || diffuse.length < 1)
			return "Materials -> Material " + id + " -> Diffuse-> Variable error";

		var diffuseElem = diffuse[0];
		if( diffuseElem.attributes.length < 4 )
			return "Materials -> Material " + id + " -> -> Diffuse -> Missing required information";
		else if ( diffuseElem.attributes.length > 4 )
			console.warn("Materials -> Material " + id + " -> -> Diffuse -> More attributes than required");
		r = this.reader.getFloat(diffuseElem, 'r');
		g = this.reader.getFloat(diffuseElem, 'g');
		b = this.reader.getFloat(diffuseElem, 'b');
		a = this.reader.getFloat(diffuseElem, 'a');

		if(	r == undefined || g == undefined || b == undefined || a == undefined )
			return "Materials -> Material " + id + " -> Diffuse -> Missing required information";
			
		if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
			console.warn("Materials -> Material " + id + " -> Diffuse -> RGBA values must be between 0 and 1");
		
		appearance.setDiffuse(r, g, b, a);
								
		var specular = material_elems.getElementsByTagName('specular');
		if(specular == null || specular.length < 1)
			return "Materials -> Material " + id + " -> Specular-> Variable error";

		var specularElem = specular[0];
		if( specularElem.attributes.length < 4 )
			return "Materials -> Material " + id + " -> Specular -> Missing required information";
		else if ( specularElem.attributes.length > 4 )
			console.warn("Materials -> Material " + id + " -> Specular -> More attributes than required");
		r = this.reader.getFloat(specularElem, 'r');
		g = this.reader.getFloat(specularElem, 'g');
		b = this.reader.getFloat(specularElem, 'b');
		a = this.reader.getFloat(specularElem, 'a');

		if(	r == undefined || g == undefined || b == undefined || a == undefined )
			return "Materials -> Material " + id + " -> Specular -> Missing required information";
			
		if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1)
			console.warn("Materials -> Material " + id + " -> Specular -> RGBA values must be between 0 and 1");
		
		appearance.setSpecular(r, g, b, a);
								
		var shininess = material_elems.getElementsByTagName('shininess');
		if(shininess == null || shininess.length < 1)
			return "Materials -> Material " + id + " -> Shininess-> Variable error";

		var shininessElem = shininess[0];
		if( shininessElem.attributes.length < 1 )
			return "Materials -> Material " + id + " -> Material -> Shininess -> Missing required information";
		else if ( shininessElem.attributes.length > 1 )
			console.warn("Materials -> Material " + id + " -> Material -> Shininess -> More attributes than required");
		var shininess = this.reader.getFloat(shininessElem, 'value');
		
		if ( shininess == undefined )
			return "Materials -> Material " + id + " -> Shininess-> Missing required information or variable with wrong value (shininess must be a positive value)";
		else if ( shininess < 0 )
			console.warn("Materials -> Material " + id + " -> Shininess value is negative");
		
		appearance.setShininess(shininess);
		appearance.setTextureWrap('REPEAT', 'REPEAT');
		
		this.materials[id] = appearance;
	}
};

//Parses the transformations
MySceneGraph.prototype.parseTransformations = function(transformations) {

	var nnodes = transformations.children.length;
	
	if (transformations == null ) 
		return "Transformations error";
	else if( transformations.attributes.length != 0 )
		console.warn("Transformations -> More attributes than required");

	for(var i = 0; i < nnodes; i++) {

		var transform_elems = transformations.children[i];
		if (transform_elems == null)
			return "Transformation error";

		if(transform_elems.attributes.length < 1)
			return "Transformations -> Transformation -> Wrong number of attributes";
		else if(transform_elems.attributes.length > 1)
			console.warn("Transformations -> Transformation -> More attributes than required");
		
		var id = transform_elems.attributes.getNamedItem('id').value;
		
		if( id == undefined )
			return "Transformations -> Transformation -> ID -> Missing required information";
	
		// Making sure that there are no two transformations with the same id
		if( this.transformations[id] != undefined )
			return "Transformations -> Transformation id: " + this.transformations[id] + " -> Same id error";

		var matrix = mat4.create();
		this.transformations[id] = matrix;
		
		if(transform_elems.children.length == 0)
			return "Transformations -> Transformation id: " + id + " -> You need at least one transformation (translate, rotate or scale)";

		for(var k = 0; k < transform_elems.children.length; k++){
			var transformation = transform_elems.children[k].tagName;
			
			if( transformation == 'rotate' ) {
				if(transform_elems.children[k].attributes.length < 2)
					return "Transformations -> Transformation id: " + id + " -> Wrong number of attributes";
				else if(transform_elems.children[k].attributes.length > 2)
					console.warn("Transformations -> Transformation id: " + id + " -> More attributes than required");
				
				var axis, angle;
				angle = Math.PI * this.reader.getFloat(transform_elems.children[k], 'angle') / 180;
				axis = this.reader.getString(transform_elems.children[k], 'axis');

				if( angle == undefined || axis == undefined)
					return "Transformations -> Transformation id: " + id + " -> Rotate -> Missing required information";
				else if(this.axis_length < 0)
					console.warn("Axis length can't be negative");
				
				mat4.rotate(matrix, matrix, angle, axis == 'x' ? [1, 0, 0] : axis == 'y' ? [0, 1, 0] : [0, 0, 1]);
			}
			else {
				if(transform_elems.children[k].attributes.length < 3)
					return "Transformations -> Transformation id: " + id + " -> Wrong number of attributes";
				else if(transform_elems.children[k].attributes.length > 3)
					console.warn("Transformations -> Transformation id: " + id + " -> More attributes than required");

				
				var x, y, z;
				x = this.reader.getFloat(transform_elems.children[k], 'x');
				y = this.reader.getFloat(transform_elems.children[k], 'y');
				z = this.reader.getFloat(transform_elems.children[k], 'z');
				
				if( x == undefined || y == undefined || z == undefined)
					return "Transformations -> Transformation id: " + id + " -> Missing required information";
				
				if( transformation == 'scale' )
					mat4.scale(matrix, matrix, [x, y, z]);
				else
					mat4.translate(matrix, matrix, [x, y, z]);
			}
		}
	}
}

//Parses the different animations
MySceneGraph.prototype.parseAnimations = function(animations) {
	
	var nnodes = animations.children.length;
	
	if( animations == null )
		return "Animations error";
	
	if( nnodes > 0) {
		for(var i = 0; i < nnodes; i++){
			
			var anim_elems = animations.children[i];
			
			if(anim_elems == null)
				return "Animations -> Animation error";
			
			if(anim_elems.attributes.length < 3)
				return "Animation -> Wrong number of attributes";
			else if(anim_elems.attributes.length > 9) //In case of circular animations
				console.warn("Animation -> More attributes than required\n");
			
			var id = anim_elems.attributes.getNamedItem('id').value;
			var span = anim_elems.attributes.getNamedItem('span').value;
			var type = this.reader.getString(anim_elems, 'type');
			var animation;
			
			if( id == undefined || span == undefined || type == undefined )
				return "Animation -> Missing required information";

			if( this.animations[id] != undefined )
				return "Animations -> Different animations with the same id = " + id;
			
			//Different types of animations
			switch(type){
				case 'linear':
				
					if(anim_elems.children.length < 1)
						return "Animation -> Linear -> There isn't any control points";
					
					var xx, yy, zz;
					var controlPoint = [];
					
					for(var j = 0; j < anim_elems.children.length; j++){
						
						if(anim_elems.children[j].attributes.length < 3)
							return "Animation -> Linear -> ControlPoint -> Wrong number of attributes";
						else if(anim_elems.children[j].attributes.length > 3)
							console.warn("Animation -> Linear -> ControlPoint -> More attributes than required\n");
						
						xx = this.reader.getFloat(anim_elems.children[j], 'xx');
						yy = this.reader.getFloat(anim_elems.children[j], 'yy');
						zz = this.reader.getFloat(anim_elems.children[j], 'zz');
						
						if(xx == undefined || yy == undefined || zz == undefined)
							return "Animation -> Linear -> Missing required information";
						
						controlPoint[j] = [xx, yy, zz];
					}
					
					animation = new LinearAnimation(id, controlPoint, span);
					break;
					
				case 'circular':
				
					var centerX = this.reader.getFloat(anim_elems, 'centerx');
					var centerY = this.reader.getFloat(anim_elems, 'centery');
					var centerZ = this.reader.getFloat(anim_elems, 'centerz');
					var radius = this.reader.getFloat(anim_elems, 'radius');
					var startang = this.reader.getFloat(anim_elems, 'startang');
					var rotang = this.reader.getFloat(anim_elems, 'rotang');
					
					if(centerX == undefined || centerY == undefined || centerZ == undefined	||
						radius == undefined || startang == undefined || rotang == undefined)
						return "Animation -> Circular -> Missing required information";
					
					var center = [centerX, centerY, centerZ];

					startang = startang * Math.PI / 180;
					rotang = rotang * Math.PI / 180;
					
					animation = new CircularAnimation(id,center, radius, startang, rotang, span);
					break;
					
				default:
					return "Animation -> Animation's type doesn't exist";
			}

			this.animations[id] = animation;
		}
	}
}

//Parses the different primitives
MySceneGraph.prototype.parsePrimitives = function(primitives) {
	
	var nnodes = primitives.children.length;
	
	if (primitives == null || nnodes < 1) 
		return "Primitives error";

	for(var i = 0; i < nnodes; i++) {

		var prim_elems = primitives.children[i];

		if(prim_elems == null)
			return "Primitives -> Primitive error";
		
		if(prim_elems.attributes.length < 1)
			return "Primitive -> Wrong number of attributes";
		else if(prim_elems.attributes.length > 1)
			console.warn("Primitive -> More attributes than required");

		var id = prim_elems.attributes.getNamedItem('id').value;
		
		if(id == undefined)
			return "Primitive -> ID -> Missing required information";
	
		// Making sure that there are no two primitives with the same id 
		if(this.primitives[id] != undefined)
			return "There are 2 primitives with the same name";

		if(prim_elems.children.length > 1)
			console.warn("You must have only one tag");
		
		var primitive = prim_elems.children[0].tagName;
		
		switch(primitive) {
			case 'rectangle':
			
				if(prim_elems.children[0].attributes.length < 4)
					return "Primitives -> Rectangle -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 4)
					console.warn("Primitives -> Rectangle -> More attributes than required");
				
				var x1, y1, x2, y2;
				x1 = this.reader.getFloat(prim_elems.children[0], 'x1');
				y1 = this.reader.getFloat(prim_elems.children[0], 'y1');
				x2 = this.reader.getFloat(prim_elems.children[0], 'x2');
				y2 = this.reader.getFloat(prim_elems.children[0], 'y2');
				
				if(x1 == undefined || y1 == undefined || x2 == undefined || y2 == undefined)
					return "Primitives -> Rectangle -> Missing required information";
				
				this.primitives[id] = new MyRectangle(this.scene, x1, y1, x2, y2);
				break;
			case 'triangle':
				
				if(prim_elems.children[0].attributes.length < 9)
					return "Primitives -> Triangle -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 9)
					console.warn("Primitives -> Triangle -> More attributes than required");
				
				var x1, y1, z1, x2, y2, z2, x3, y3, z3;
				x1 = this.reader.getFloat(prim_elems.children[0], 'x1');
				y1 = this.reader.getFloat(prim_elems.children[0], 'y1');
				z1 = this.reader.getFloat(prim_elems.children[0], 'z1');
				x2 = this.reader.getFloat(prim_elems.children[0], 'x2');
				y2 = this.reader.getFloat(prim_elems.children[0], 'y2');
				z2 = this.reader.getFloat(prim_elems.children[0], 'z2');
				x3 = this.reader.getFloat(prim_elems.children[0], 'x3');
				y3 = this.reader.getFloat(prim_elems.children[0], 'y3');
				z3 = this.reader.getFloat(prim_elems.children[0], 'z3');
				
				if(	x1 == undefined || y1 == undefined || z1 == undefined ||
					x2 == undefined || y2 == undefined || z2 == undefined ||
					x3 == undefined || y3 == undefined || z3 == undefined )
						return "Primitives -> Triangle -> Missing required information";
						
				this.primitives[id] = new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
				break;
			case 'cylinder':

				if(prim_elems.children[0].attributes.length < 5)
					return "Primitives -> Cylinder -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 5)
					console.warn("Primitives -> Cylinder -> More attributes than required");
				
				var base, top, heigth, slices, stacks;
				base = this.reader.getFloat(prim_elems.children[0], 'base');
				top = this.reader.getFloat(prim_elems.children[0], 'top');
				height = this.reader.getFloat(prim_elems.children[0], 'height');
				slices = this.reader.getInteger(prim_elems.children[0], 'slices');
				stacks = this.reader.getInteger(prim_elems.children[0], 'stacks');
				
				if( base == undefined || top == undefined || height == undefined ||
					slices == undefined || stacks == undefined)
						return "Primitives -> Cylinder -> Missing required information";
						
				if( slices < 0 || stacks < 0)
					console.warn("Number of slices or stacks of cylinder can't be negative");
						
				this.primitives[id] = new MyCylinder(this.scene, base, top, height, slices, stacks);
				break;
			case 'sphere':
			
				if(prim_elems.children[0].attributes.length < 3)
					return "Primitives -> Sphere -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 3)
					console.warn("Primitives -> Sphere -> More attributes than required");
				
				var radius, slices, stacks;
				radius = this.reader.getFloat(prim_elems.children[0], 'radius');
				slices = this.reader.getInteger(prim_elems.children[0], 'slices');
				stacks = this.reader.getInteger(prim_elems.children[0], 'stacks');
				
				if( radius == undefined || slices == undefined || stacks == undefined)
					return "Primitives -> Sphere -> Missing required information";
				
				if( slices < 0 || stacks < 0)
					console.warn("Number of slices or stacks of sphere can't be negative");
				
				this.primitives[id] = new MySphere(this.scene, radius, slices, stacks);
				break;
			case 'torus':
				
				if(prim_elems.children[0].attributes.length < 4)
					return "Primitives -> Torus -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 4)
					console.warn("Primitives -> Torus -> More attributes than required");
				
				var inner, outer, slices, loops;
				inner = this.reader.getFloat(prim_elems.children[0], 'inner');
				outer = this.reader.getFloat(prim_elems.children[0], 'outer');
				slices = this.reader.getInteger(prim_elems.children[0], 'slices');
				loops = this.reader.getInteger(prim_elems.children[0], 'loops');
				
				if( inner == undefined || outer == undefined || slices == undefined || loops == undefined)
					return "Primitives -> Torus -> Missing required information";
				
				if( slices < 0 || loops < 0)
					console.warn("Number of slices or stacks of torus can't be negative");
				
				this.primitives[id] = new MyTorus(this.scene, inner, outer, slices, loops);
				break;
				
			case 'plane':
			
				if(prim_elems.children[0].attributes.length < 4)
					return "Primitives -> Plane -> Wrong number of attributes";
				else if(prim_elems.children[0].attributes.length > 4)
					console.warn("Primitives -> Plane -> More attributes than required");
				
				var dimX = this.reader.getFloat(prim_elems.children[0], 'dimX');
				var dimY = this.reader.getFloat(prim_elems.children[0], 'dimY');
				var partsX = this.reader.getFloat(prim_elems.children[0], 'partsX');
				var partsY = this.reader.getFloat(prim_elems.children[0], 'partsY');
				
				if( dimX == undefined || dimY == undefined || partsX == undefined || partsY == undefined)
					return "Primitives -> Plane -> Missing required information";
				
				if( dimX <= 0 || dimY <= 0 )
					console.warn("Primitives -> Plane -> The dimensions of plane must be a positive number grater than zero");
				
				if( partsX <= 0 || partsY <= 0 )
					console.warn("Primitives -> Plane -> The plane's parts must be a positive number greater than zero");
				
				this.primitives[id] = new MyPlane(this.scene, dimX, dimY, partsX, partsY);
				break;
			
			case 'patch':
				if(prim_elems.children[0].attributes.length < 4)
					return "Primitives -> Patch -> Wrong number of attributes";
				
				var patch = prim_elems.children[0];
				
				var orderU = this.reader.getInteger(patch, 'orderU');
				var orderV = this.reader.getInteger(patch, 'orderV');
				var partsU = this.reader.getInteger(patch, 'partsU');
				var partsV = this.reader.getInteger(patch, 'partsV');
				
				if(orderU == undefined || orderV == undefined || partsU == undefined || partsV == undefined)
					return "Primitives -> Patch -> Missing required information";
				
				if(orderU <= 0 || orderV <= 0)
					console.warn("Primitives -> Patch -> The patch orders must be a positive number greater than zero");
				
				if(partsU <= 0 || partsV <= 0)
					console.warn("Primitives -> Patch -> The patch's parts must be a positive number greater than zero");
				
				if(patch.children.length < 1)
						return "Primitives -> Patch -> There isn't any control points";
				
				if(patch.children.length < (orderU + 1)*(orderV + 1))
						return "Primitives -> Patch -> Wrong number of control points";
					
				if(patch.children.length > (orderU + 1)*(orderV + 1))
						console.warn("Primitives -> Patch -> There is more control points than required");
					
				var controlPoint = [];
				
				for(var j = 0; j < patch.children.length; j++){
					
					if(patch.children[j].attributes.length < 3)
						return "Primitives -> Patch -> ControlPoint -> Wrong number of attributes";
					
					else if(patch.children[j].attributes.length < 3)
						console.warn("Primitives -> Patch -> ControlPoint -> More attributes than required\n");
						
					var x = this.reader.getFloat(patch.children[j], 'x');
					var y = this.reader.getFloat(patch.children[j], 'y');
					var z = this.reader.getFloat(patch.children[j], 'z');
					
					if(x == undefined || y == undefined || z == undefined)
						return "Primitives -> Patch -> Control Point -> Missing required information";
					
					//The laste value is 1 because we need the w value and in this case w=1
					controlPoint.push([x, y, z, 1]);
				}

				this.primitives[id] = new MyPatch(this.scene, orderU, orderV, partsU, partsV, controlPoint);
				break;
				
			case 'chessboard':
				if(prim_elems.children[0].attributes.length < 5)
					return "Primitives -> ChessBoard -> Wrong number of attributes";
				
				var chess = prim_elems.children[0];
				
				var dU = this.reader.getInteger(chess, 'du');
				var dV = this.reader.getInteger(chess, 'dv');
				
				if( dU == undefined || dV == undefined )
					return "Primitives -> ChessBoard -> Missing required information";
				
				if( dU <= 0 || dV <= 0)
					console.warn("Primitives -> ChessBoard -> The U and V dimensions must be a positive number greater than zero");

				var textureref = this.reader.getString(chess, 'textureref');
				
				if(textureref == undefined)
					return "Primitives -> ChessBoard -> Missing required information";
				
				if( this.textures[textureref] == undefined )
					return "Primitives -> ChessBoard -> Missing texture " + this.textureref;

				var sU = this.reader.getInteger(chess, 'su');
				var sV = this.reader.getInteger(chess, 'sv');
				
				if( sU == undefined || sV == undefined )
					return "Primitives -> ChessBoard -> Missing required information";
				
				if( sU < 0 || sV < 0)
					console.warn("Primitives -> ChessBard -> sU and sV must be a positive number");
				
				if(chess.children.length < 3)
						return "Primitives -> Chessboard -> Wrong number of children";
					
				var c1 = chess.getElementsByTagName('c1');

				if( c1 == null || c1[0].attributes.length < 4)
					return "Primitives -> ChessBoard -> c1 -> Attributes error";
				else if(c1[0].attributes.length > 4)
					console.warn("Primitives -> ChessBoard -> c1 -> More attributes than required");
				else if( c1.length > 1 ) 
					console.warn("There are more than 1 c1 elements in chessboard, only the first will be considered");

				var c1_elem = c1[0];

				var r, g, b, a;
				var rgbaC1 = [];
				
				r = this.reader.getFloat(c1_elem, 'r');
				g = this.reader.getFloat(c1_elem, 'g');
				b = this.reader.getFloat(c1_elem, 'b');
				a = this.reader.getFloat(c1_elem, 'a');
				
				if( r == undefined || g == undefined || b == undefined || a == undefined )
					return "Primitives -> ChessBoard -> C1 -> Missing required information";
				
				if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1 )
					console.warn("Primitives -> ChessBoard -> C1 -> Wrong RGBA values");
				
				rgbaC1.push(r);
				rgbaC1.push(g);
				rgbaC1.push(b);
				rgbaC1.push(a);
				
				var c2 = chess.getElementsByTagName('c2');

				if( c2 == null || c2[0].attributes.length < 4)
					return "Primitives -> ChessBoard -> c2 -> Attributes error";
				else if(c2[0].attributes.length > 4)
					console.warn("Primitives -> ChessBoard -> c2 -> More attributes than required");
				else if( c2.length > 1 ) 
					console.warn("There are more than 1 c2 elements in chessboard, only the first will be considered");

				var c2_elem = c2[0];
				
				var rgbaC2= [];
				
				r = this.reader.getFloat(c2_elem, 'r');
				g = this.reader.getFloat(c2_elem, 'g');
				b = this.reader.getFloat(c2_elem, 'b');
				a = this.reader.getFloat(c2_elem, 'a');
				
				if( r == undefined || g == undefined || b == undefined || a == undefined )
					return "Primitives -> ChessBoard -> C2 -> Missing required information";
				
				if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1 )
					console.warn("Primitives -> ChessBoard -> C2 -> Wrong RGBA values");
				
				rgbaC2.push(r);
				rgbaC2.push(g);
				rgbaC2.push(b);
				rgbaC2.push(a);
				
				var cs = chess.getElementsByTagName('cs');

				if( cs == null || cs[0].attributes.length < 4)
					return "Primitives -> ChessBoard -> cs -> Attributes error";
				else if(cs[0].attributes.length > 4)
					console.warn("Primitives -> ChessBoard -> cs -> More attributes than required");
				else if( cs.length > 1 ) 
					console.warn("There are more than 1 cs elements in chessboard, only the first will be considered");

				var cs_elem = cs[0];
				
				var rgbaCS= [];
				
				r = this.reader.getFloat(cs_elem, 'r');
				g = this.reader.getFloat(cs_elem, 'g');
				b = this.reader.getFloat(cs_elem, 'b');
				a = this.reader.getFloat(cs_elem, 'a');
				
				if( r == undefined || g == undefined || b == undefined || a == undefined )
					return "Primitives -> ChessBoard -> CS -> Missing required information";
				
				if( r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1 || a < 0 || a > 1 )
					console.warn("Primitives -> ChessBoard -> CS -> Wrong RGBA values");
				
				rgbaCS.push(r);
				rgbaCS.push(g);
				rgbaCS.push(b);
				rgbaCS.push(a);
				
				this.primitives[id] = new MyBoard(this.scene, dU, dV, textureref, sU, sV, rgbaC1, rgbaC2, rgbaCS);
				break;
				
			case 'vehicle':
				this.primitives[id] = new MyVehicle(this.scene);
				break;
				
			case 'table':
				if(prim_elems.children[0].attributes.length < 2)
					return "Primitives -> Table -> Wrong number of attributes";
				
				var table = prim_elems.children[0];
				
				var length_s = this.reader.getInteger(table, 'length_s');
				var length_t = this.reader.getInteger(table, 'length_t');
				
				if( length_s == undefined || length_t == undefined )
					return "Primitives -> Table -> Missing required information";
				
				if( length_s < 0 || length_t < 0)
					console.warn("Primitives -> Table -> The values must be a positive number");
				
				this.primitives[id] = new MyTable(this.scene, length_s, length_t);
				break;
			
			case 'box':
				this.primitive[id] = new MyBox(this.scene);
				break;
		}
	}
};

//Parses the components
MySceneGraph.prototype.parseComponents = function (components) {

	var nnodes = components.children.length;
	
	if (components == null || nnodes < 1) 
		return "Components error";
	
	this.component = [nnodes];

	for(var i = 0; i < nnodes; i++) {

		var comp_elems = components.children[i];

		if (comp_elems == null)
			return "Components -> Component error";
		
		if(comp_elems.attributes.length < 1)
			return "Components -> Component -> Wrong number of attributes";
		if(comp_elems.attributes.length > 1)
			console.warn("Components -> Component -> More attributes than required");

		var id = comp_elems.attributes.getNamedItem('id').value;
		
		if(id == undefined)
			return "Component -> ID -> Missing required information";

		var n = new Node();
		this.graph.addNode(id, n);
	
		// Making sure that there are no two components with the same id 
		for(var j = 0; j < this.component.length; j++) {
			if(this.component[j].id == id)
				return "Components -> " + id + " -> Same id error";
		}
		
		var err;
		if( (err = this.readComponentTransformation(comp_elems,n)) != null )
			return err;
		if( (err = this.readComponentAnimation(comp_elems,n)) != null )
			return err;
		if( (err = this.readComponentMaterials(comp_elems,n)) != null )
			return err;
		if( (err = this.readComponentTextures(comp_elems,n)) != null )
			return err;
		if( (err = this.readComponentChildren(comp_elems,n)) != null )
			return err;
	}
};

//Reads the transformations of each component
MySceneGraph.prototype.readComponentTransformation = function (compElement, node) {

	var transformations = compElement.getElementsByTagName('transformation');
	var nnodes = transformations[0].children.length;
	if (transformations == null || transformations.length != 1) 
		return "Component -> Tranformation error";
	
	for(var i = 0; i < nnodes; i++) {

		var transform_elems = transformations[0].children[i];
		if (transform_elems == null)
			return "Component -> Transformation error";
		
		var id;

		var transformation = transform_elems.tagName;
		switch(transformation) {
			case 'transformationref':
			
				if(transform_elems.attributes.length < 1)
					return "Component -> Transformation -> TransformationRef -> Wrong number of attributes";
				if(transform_elems.attributes.length > 1)
					console.warn("Component -> Transformation -> TransformationRef -> More attributes than required");
				
				id = this.reader.getString(transform_elems, 'id');
				
				if(id == undefined)
					return "Component -> Transformation -> ID transformationref -> Missing required information";

				if( nnodes != 1 )
					return "You either have transformationref OR the transformations you want that haven't been defined before";

				node.setTransformationId(id);

				break;
			case 'rotate':
				
				if(transform_elems.attributes.length < 2)
					return "Component -> Transformation -> Rotate -> Wrong number of attributes";
				if(transform_elems.attributes.length > 2)
					console.warn("Component -> Transformation -> Rotate -> More attributes than required");
				
				var axis, angle;
				angle = Math.PI * this.reader.getFloat(transform_elems, 'angle') / 180;
				axis = this.reader.getString(transform_elems, 'axis');
				
				if(angle == undefined || axis == undefined)
					return "Component -> Transformation -> Rotate -> Missing required information";
				
				if(axis < 0)
					console.warn("Axis length must be positive");
				
				node.addTransform(transformation, [angle, axis]);
				break;
			case 'translate':
			case 'scale':
			
				if(transform_elems.attributes.length < 3)
					return "Component -> Transformation -> Scale -> Wrong number of attributes";
				if(transform_elems.attributes.length > 3)
					console.warn("Component -> Transformation -> Scale -> More attributes than required");
				
				var x, y, z;
				x = this.reader.getFloat(transform_elems, 'x');
				y = this.reader.getFloat(transform_elems, 'y');
				z = this.reader.getFloat(transform_elems, 'z');
				
				if(x == undefined || y == undefined || z == undefined)
					return "Component -> Transformation -> Scale -> Missing required information";
				
				node.addTransform(transformation, [x, y, z]);
				break;
		}
			
		if(id != null)
			break;
	}
};

//Parses the animation of each component
MySceneGraph.prototype.readComponentAnimation = function (compElement, node) {
	var animations = compElement.getElementsByTagName('animation');
	if (animations == null || animations == undefined) 
		return "Component -> Animations error";
	
	if (animations.length == 0)
		return ;

	var nnodes = animations[0].children.length;
	for(var i = 0; i < nnodes; i++) {

		var anim_elems = animations[0].children[i];
		if (anim_elems == null)
			return "Component -> Animation error";
		
		var id;

		var animation = anim_elems.tagName;
		
		if(animation == 'animationref'){
			if(anim_elems.attributes.length < 1)
				return "Component -> Animation -> AnimationRef -> Wrong number of attributes";
			if(anim_elems.attributes.length > 1)
				console.warn("Component -> Animation -> AnimationRef -> More attributes than required");
			
			var id = this.reader.getString(anim_elems, 'id');
			
			if(id == undefined)
				return "Component -> Animation -> ID AnimationRef -> Missing required information";

			node.addAnimation(id);
		}
		else
			return "Component -> Animation -> Wrong element in Animation";
	}
}

//Reads the materials of each component
MySceneGraph.prototype.readComponentMaterials = function (compElement, node) {
	var materials = compElement.getElementsByTagName('materials');
	var nnodes = materials[0].children.length;
	if (materials == null || materials.length != 1 || nnodes < 1) 
		return "Component -> Materials error";

	for(var i = 0; i < nnodes; i++) {
			
		var material_elems = materials[0].children[i];

		if (material_elems == null)
			return "Materials -> Material error";
		
		if(material_elems.attributes.length < 1)
			return "Component -> Material -> Wrong number of attributes";
		if(material_elems.attributes.length > 1)
			console.warn("Component -> Material -> More attributes than required");

		var id = material_elems.attributes.getNamedItem('id').value;
		
		if(id == undefined)
			return "Component -> Material -> ID -> Missing required information";
		
		node.addIdMaterial(id);
	}

};

//Reads the texture of each component
MySceneGraph.prototype.readComponentTextures = function (compElement, node) {
	var texture = compElement.getElementsByTagName('texture');
	if(texture == null)
		return "Component -> Texture error";
	
	if(texture[0].attributes.length < 1)
		return "Component -> Texture -> Wrong number of attributes";
	if(texture[0].attributes.length > 1)
		console.warn("Component -> Texture -> More attributes than required");

	var id = texture[0].attributes.getNamedItem('id').value;
	
	if(id == undefined)
		return "Component -> Texture -> ID -> Missing required information";

	node.setIdTexture(id);
};

//Reads the children of each component
MySceneGraph.prototype.readComponentChildren = function (compElement, node) {
	var ch = compElement.getElementsByTagName('children');
	if (ch == null || ch.length != 1) 
		return "Children error";
	
	var id;
	var countComp = 0, countPrim = 0;

	var childrenElems = ch[0].children;
	
	if(childrenElems.length == 0)
		return "You must have one or more childen's elements";
	
	for(var j = 0; j < childrenElems.length; j++) {

		var childrenTag = childrenElems[j].tagName;
		switch(childrenTag) {
			case 'componentref':
				if(childrenElems[j].attributes.length < 1)
					return "Component -> Children -> ComponentRef -> Wrong number of attributes";
				if(childrenElems[j].attributes.length > 1)
					console.warn("Component -> Children -> ComponentRef -> More attributes than required");
				
				id = this.reader.getString(childrenElems[j], 'id');
				
				if(id == undefined)
					return "Component -> Children -> ComponentRef ID -> Missing required information";
				
				node.addIdChildren(id);
				countComp++;
				break;
			case 'primitiveref':
				if(childrenElems[j].attributes.length < 1)
					return "Component -> Children -> PrimitiveRef -> Wrong number of attributes";
				if(childrenElems[j].attributes.length > 1)
					console.warn("Component -> Children -> PrimitiveRef -> More attributes than required");
				
				id = this.reader.getString(childrenElems[j], 'id');
				
				if(id == undefined)
					return "Component -> Children -> PrimitiveRef ID -> Missing required information";
				
				node.addIdPrimitive(id);
				countPrim++;
				break;
		}
	}
};