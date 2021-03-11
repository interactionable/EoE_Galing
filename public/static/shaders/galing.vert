uniform float time;
uniform vec2 resolution;

//tex
uniform sampler2D tex;

// uniform floats
uniform float amountMin;
uniform float amountMax;
uniform float threshold;
uniform float soft;
uniform float scale;
uniform float offset;
uniform float transform;
uniform vec2 reposition;

// uniform vec4
uniform vec3 col1;
uniform vec3 col2;

void main()	{
    vec3 pos = position;
    gl_Position = vec4( pos, 1.0 );
}