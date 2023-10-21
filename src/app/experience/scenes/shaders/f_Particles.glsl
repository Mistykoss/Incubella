
varying vec3 vColor; // Variable que almacena el color de la partícula  
varying float vSize;

      void main() {

        
        
        // Calculamos la coordenada relativa al centro del fragmento
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // Calculamos la distancia del fragmento al centro del círculo
        float dist = length(coord);
        
        //ajustes de particulas
        vec3 lightColor = vColor; // Color de la luz
        float alpha = smoothstep(0.5, 0.49, dist);
        float alphaIntensity = 0.01;
        float lightIntensity = 1.0;

        // Descartamos los fragmentos que están fuera del radio de 0.5,
        // asignando un valor de opacidad de cero
        if (dist > 0.5) discard;

        // Calculamos el brillo de la partícula
  float brightness = pow(1.0 - dist, 2.0) * lightIntensity;

  // Calculamos el color final de la partícula con el brillo
  vec3 finalColor = vColor + lightColor * brightness;
      
        // Asignamos el color de la partícula al fragmento
        gl_FragColor = vec4(finalColor, alpha *  brightness);
      }
