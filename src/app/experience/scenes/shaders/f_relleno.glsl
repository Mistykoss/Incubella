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
      float alpha = 0.15;
      float lightIntensity = 1.0;
      float brightness = pow(1.0 - dist, 2.0) * lightIntensity;

        // Descartamos los fragmentos que están fuera del radio de 0.5,
        // asignando un valor de opacidad de cero
      if(dist > 0.5)
            discard;


      // Calculamos el brillo de la partícula
      // Calculamos el color final de la partícula con el brillo
      //si es menor
      if(vSize < 8.0){
        alpha = 2.0;
      }

        float details = pow(dist, 2.5);


      vec3 finalColor = vColor * 0.3;

      // Asignamos el color de la partícula al fragmento
      gl_FragColor = vec4(finalColor, alpha + details);
}
