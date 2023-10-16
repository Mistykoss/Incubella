
// Vertex shader para partículas
attribute vec3 color;
attribute float particleSize;
uniform float time;

varying float vSize;
varying vec3 vColor; // Variable que almacena el color de la partícula



void main() {
  vSize = particleSize;
  float intensity = 0.5;
  float animTime = 0.07;
  vColor = color;
  // Transforma la posición de la partícula
  vec3 newPosition = position;
  float x = position.x;
  float z = position.z;


  newPosition.y = sin((time * animTime) * vSize) * intensity;




  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = vSize; // Tamaño de las partículas (puedes ajustarlo)
}
