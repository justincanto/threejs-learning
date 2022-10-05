varying vec3 vColor;

void main() {
    //Disc
    // float strength = 1.0 - step(0.5, distance(gl_PointCoord, vec2(0.5)));

    //Diffuse point
    // float strength = 1.0 - distance(gl_PointCoord, vec2(0.5)) * 2.0;
    
    //Ligth point
    float strength = pow(1.0 - distance(gl_PointCoord, vec2(0.5)), 10.0);

    //Final color
    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, 1.0);
}