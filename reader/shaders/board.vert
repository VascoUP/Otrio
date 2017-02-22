#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;


uniform float dU;
uniform float dV;
uniform float sU;
uniform float sV;

uniform vec4 cs;

varying vec4 coords;

void main() {
	vec4 vertex=vec4(aVertexPosition, 1.0);

	coords.xy=vertex.xy+0.5;
	coords.z=vertex.z;

	gl_Position = uPMatrix * uMVMatrix * vertex;
}
