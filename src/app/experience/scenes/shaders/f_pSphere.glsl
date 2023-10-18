
varying vec3 vColor; // Variable que almacena el color de la partícula  
varying float vSize;
varying vec3 vNormal;


      void main() {

  // Calculamos el color final de la partícula con el brillo
  vec3 finalColor = vec3(0, 0, 1);
        // Asignamos el color de la partícula al fragmento
        gl_FragColor = vec4(finalColor, 0.5);
      }
