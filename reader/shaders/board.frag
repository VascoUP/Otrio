#ifdef GL_ES
precision highp float;
precision mediump int;
#endif

uniform sampler2D u_texture;

uniform float dU;
uniform float dV;
uniform float sU;
uniform float sV;

uniform vec4 cs;

varying vec4 coords;

void main() {
   vec2 texcoord = vec2(coords.x, coords.y);
   gl_FragColor = texture2D(u_texture, texcoord);

   float indexU = coords.x * dU;

    if(floor(indexU) + 0.999 < indexU)
        indexU = floor(indexU)+1.0;
    else 
        indexU = floor(indexU);

    float indexV = coords.y * dV;

    if(floor(indexV) + 0.999 < indexV)
        indexV = floor(indexV)+1.0;
    else
        indexV = floor(indexV);

   int indexU_floor = int(indexU);
   int indexV_floor = int(indexV);    
   
    if( indexU_floor == int(sU) && indexV_floor == int(sV) ) {
        gl_FragColor.rgba = (texture2D(u_texture, texcoord) + cs) / 2.0;
        gl_FragColor.a = 1.0;
    }
    else {
        gl_FragColor = texture2D(u_texture, texcoord);
    }
    
}