
// Vertex shader para partículas
attribute vec3 color;
attribute float particleSize;
uniform float time;

varying float vSize;
varying vec3 vColor; // Variable que almacena el color de la partícula


float noise1d(float v){
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}


void main() {
  vSize = particleSize;
  float intensity = 10.5;
  float animTime = 0.07;
  vColor = color;
  // Transforma la posición de la partícula
  vec3 newPosition = position;
  float x = position.x;
  float z = position.z;



  newPosition.x =x + noise1d(animTime * abs(time)  + vSize) * 2.0 ;
  newPosition.z =z + noise1d(animTime * abs(time)  + vSize) * 2.0 ;



  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = vSize; // Tamaño de las partículas (puedes ajustarlo)
}
