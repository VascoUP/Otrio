#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform vec4 color;

varying vec4 coords;

void main() {
	vec4 vertex=vec4(aVertexPosition, 1.0);

	coords=vertex;

	gl_Position = uPMatrix * uMVMatrix * vertex;
}
