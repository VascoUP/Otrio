#ifdef GL_ES
precision highp float;
#endif

uniform float init;
uniform float end;

varying vec4 coords;

void main() {
    float r;
    float g;
    float b;
    float middle = ( init + end ) / 2.0;

    if( coords.z < middle ) {
        b = 0.0;
        r = (middle - coords.z) / (middle - init);
        g = 1.0 - r;
    } else {
        r = 0.0;        
        b = (coords.z - middle) / (end - middle);
        g = 1.0 - b;
    }

    gl_FragColor.rgba = vec4(r, g, b, 1.0)/1.2;
}