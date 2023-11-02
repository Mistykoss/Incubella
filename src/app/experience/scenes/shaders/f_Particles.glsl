varying vec3 vColor; // Variable que almacena el color de la partícula  
varying float vSize;
varying vec2 vUv;

uniform sampler2D u_texture;
uniform float opacityFactor;
uniform float time;

void main() {
      // Calculamos la coordenada relativa al centro del fragmento
  vec2 coord = gl_PointCoord - vec2(0.5);
        // Calculamos la distancia del fragmento al centro del círculo
  float dist = length(coord);


  //cantidad de blur
  float details = pow(dist,  2.5);
  //blurAmount = 0.0;

      //ajustes de particulas
  float alpha = 0.15;

        // Descartamos los fragmentos que están fuera del radio de 0.5,
        // asignando un valor de opacidad de cero
  if(dist > 0.45)
    discard;

      // Calculamos el color final de la partícula con el brillo
  if(vSize < 15.0){
    alpha = 0.05;
  }
  if(vSize < 12.0) {
    alpha = 0.15;
  }
  if(vSize < 9.0) {
    alpha = 0.20;
  }
  if(vSize < 6.0) {
    alpha = 0.35;
  }
  if(vSize < 4.0) {
    alpha = 0.5;
  }
  
  if(opacityFactor < 0.6){
    details *= opacityFactor;
  }

      // Asignamos el color de la partícula al fragmento
  gl_FragColor = vec4(vColor, alpha * opacityFactor + details);

}
