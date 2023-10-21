varying vec3 vColor; // Variable que almacena el color de la partícula  
varying float vSize;
varying vec2 vUv;

uniform sampler2D u_texture;

void main() {
      // Calculamos la coordenada relativa al centro del fragmento
      vec2 coord = gl_PointCoord - vec2(0.5);
        // Calculamos la distancia del fragmento al centro del círculo
      float dist = length(coord);

      //ajustes de particulas
      float alpha = 0.1;
      float lightIntensity = 5.0;
      float brightness = pow(1.0 - dist, 2.0) * lightIntensity;

        // Descartamos los fragmentos que están fuera del radio de 0.5,
        // asignando un valor de opacidad de cero
      if(dist > 0.5)
            discard;

      // Calculamos el brillo de la partícula
      // Calculamos el color final de la partícula con el brillo
      vec3 finalColor = vColor * brightness;

      // Asignamos el color de la partícula al fragmento
      gl_FragColor = vec4(finalColor, alpha);
}
