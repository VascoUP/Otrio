#ifdef GL_ES
precision highp float;
precision mediump int;
#endif

uniform sampler2D u_texture;

uniform vec4 color;

varying vec4 coords;

void main() {
    vec2 texcoord = vec2(coords.x, coords.y);
    gl_FragColor.rgba = (texture2D(u_texture, texcoord) + color) / 2.0;
    gl_FragColor.a = 1.0;
}