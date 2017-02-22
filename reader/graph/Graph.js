//Graph's constructor
function Graph (sceneGraph) {
	this.sceneGraph = sceneGraph;
	this.idHead = 0;
	this.nodes = {};
}

//Adds a node to graph
Graph.prototype.addNode = function( id, node ) {
	this.nodes[id] = node;
	node.graph = this;
};

//Verifies if the graph is connected
Graph.prototype.connectedGraph = function( ) {

	var head = this.nodes[this.idHead];
	if( head == undefined )
		return "Couldn't find root node";

	if( this.connectedGraphNode( head ) )
		return "Error -> Couldn't find at least one component element";

	for( var id in this.nodes ) {
		if( !this.nodes[id].visited ) //If graph is not connected
			return "Error -> This graph is not connected (node = " + id + ")";
	}
}

//Verifies if the graph is connected
Graph.prototype.connectedGraphNode = function( node, texture ) {
	node.visited = true;

	for( var i = 0; i < node.idChildren.length; i++ ) {
		var n = this.nodes[node.idChildren[i]];
		if( n == undefined ) //If id's children was not found 
		{
			console.error("Node " + node.idChildren[i] + " not found.");
			return true;
		}

		if( this.connectedGraphNode( n, node.texture ) )
			return true;
	}

	for( var i = 0; i < node.idPrimitives.length; i++ ) {
		if(this.sceneGraph.primitives[ node.idPrimitives[i] ] == undefined)  //If the id's primitive was not found
		{
			console.error("Primitive " + node.idPrimitives[i] + " not found.");
			return true;
		}
	}

	var mat = this.sceneGraph.materials[ node.idMaterials[node.currMaterialIndex] ];
	if( node.idMaterials[node.currMaterialIndex] != 'inherit' && mat == undefined ) //If the id's material was not found
	{
		console.error("Material " + node.idMaterials[node.currMaterialIndex] + " not found.");
		return true;
	}

	var tex = this.sceneGraph.textures[ node.idTexture ];
	if( node.idTexture != 'inherit' && node.idTexture != 'none' && tex == undefined ) //If the id's texture was not found
	{
		console.error("Texture " + node.idTexture + " not found.");
		return true;
	}

	if( node.transformation == undefined && node.transformationId != undefined ) {
		node.transformation = this.sceneGraph.transformations[ node.transformationId ];

		if( node.transformation == undefined ) {
			console.error("Transformation " + node.transformationId + " not found");
			return true;	
		}
	}

	// Check animations and update their values
	for( var i = 0; i < node.animations.length; i++ ) {
		var animation = this.sceneGraph.animations[node.animations[i]];
		if( animation == undefined ) {
			console.error("Animation " + node.animations[i] + " not found");
			return true;
		}
		node.animations[i] = animation;
	}

	if( node.animations.length > 0 ) 
		node.currAnimationIndex = 0;

	//On success returns false
	return false;
}

//Draws the scene represenetd by the graph
Graph.prototype.drawScene = function( ) {
	var head = this.nodes[this.idHead];
	this.drawSceneNode( head, 
						head.idMaterials[head.currMaterialIndex],
						head.idTexture );
}

//Applies the animations
Graph.prototype.applyAnimation = function(node) {
	if( node.currAnimationIndex != -1 || node.currAnimationIndex == node.animations.length )
		node.animations[node.currAnimationIndex].transform(this.sceneGraph.scene);
}

//Draws the scene represented by the graph's nodes
Graph.prototype.drawSceneNode = function( node, idMaterial, idTexture ) {
	this.sceneGraph.scene.pushMatrix();

	//Find the material id in the materials array 
	var idMat = node.idMaterials[ node.currMaterialIndex ] != 'inherit' ? 
					node.idMaterials[ node.currMaterialIndex ] : 
					idMaterial;
	var idTex = node.idTexture != 'inherit' ?
						node.idTexture :
						idTexture;

	if( node.transformation != undefined )
		this.sceneGraph.scene.multMatrix( node.transformation );

	this.sceneGraph.scene.pushMatrix();

	this.applyAnimation(node);

	for( var i = 0; i < node.idChildren.length; i++ )
		this.drawSceneNode( this.nodes[node.idChildren[i]], idMat, idTex );

	var mat = this.sceneGraph.materials[idMat];
	if( idTex != 'none' ) 
		mat.setTexture( this.sceneGraph.textures[idTex].texture );
	mat.apply();
	
	for( var i = 0; i < node.idPrimitives.length; i++ ) {
		var prim = this.sceneGraph.primitives[ node.idPrimitives[i] ];
			
		if( idTex != 'none' ) 
			prim.setTexCoords( this.sceneGraph.textures[idTex].length_s, 
									this.sceneGraph.textures[idTex].length_t )

		prim.display();
	}

	this.sceneGraph.scene.popMatrix();

	mat.setTexture(null);
	this.sceneGraph.scene.popMatrix();
}

//Changes the materials of every nodes of graph (if each node has more than one material)
Graph.prototype.changeMaterials = function() {
	for(var key in this.nodes)
		this.nodes[key].changeMaterial();
}
//Updates the graph's animations
Graph.prototype.update = function( dTime ) {
	for(var key in this.nodes) {
		if(this.nodes[key].currAnimationIndex == -1)
			continue;

		var animation = this.nodes[key].animations[this.nodes[key].currAnimationIndex];
		
		if(animation.lastFrame) {
			if(this.nodes[key].currAnimationIndex < this.nodes[key].animations.length - 1) {
				this.nodes[key].currAnimationIndex++;
				animation = this.nodes[key].animations[this.nodes[key].currAnimationIndex];
			}
			else 
				continue;
		}
		animation.update(dTime);
	}
}

//Node's constructor
function Node (id) {
	this.idChildren = [];
	this.idPrimitives = [];
	this.idMaterials = [];
	this.animations = [];
	this.idTexture;

	this.currMaterialIndex = 0; //Current material used
	this.currAnimationIndex = -1;

	this.visited = false;
}

//Sets the node's id's transformation
Node.prototype.setTransformationId = function( transformationId ) {
	this.transformationId = transformationId;
}

//Adds a ransformation to the node
Node.prototype.addTransform = function( type, arr ) {
	if( this.transformation == undefined ) 
		this.transformation = mat4.create();

	switch(type) {
		case 'rotate':
		mat4.rotate( this.transformation, this.transformation, arr[0], arr[1] == 'x' ? [1, 0, 0] : arr[1] == 'y' ? [0, 1, 0] : [0, 0, 1] );
		break;
		case 'scale':
		mat4.scale( this.transformation, this.transformation, arr );
		break;
		case 'translate':
		mat4.translate( this.transformation, this.transformation, arr );
		break;
	}
}

//Sets the node's transformation
Node.prototype.setTransformation = function( transformation ) {
	this.transformation = transformation;
}

//Sets the node's id's texture
Node.prototype.setIdTexture = function( idTexture ) {
	this.idTexture = idTexture;
}

//Sets the node's id's material
Node.prototype.addIdMaterial = function( id ) {
	this.idMaterials.push( id );
}

//Sets the node's id's children
Node.prototype.addIdChildren = function( id ) {
	this.idChildren.push( id );
}

//Sets the node's id's primitive
Node.prototype.addIdPrimitive = function( id ) {
	this.idPrimitives.push(id);
}

//Adds a animation to a node
Node.prototype.addAnimation = function( id ) {
	this.animations.push(id);
}

//Changes the node's material
Node.prototype.changeMaterial = function() {
	if( this.currMaterialIndex == this.idMaterials.length - 1 )
		this.currMaterialIndex = 0;
	else 
		this.currMaterialIndex++;
}