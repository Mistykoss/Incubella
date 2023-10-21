
// Vertex shader para partículas
attribute vec3 color;
attribute float particleSize;
uniform float time;


varying vec2 vUv;
varying float vSize;
varying vec3 vColor; // Variable que almacena el color de la partícula



void main() {
  vUv = uv;

  vSize = particleSize;
  float intensity = 0.5;
  float turbulence = 0.35;
  float animTime = 0.07;
  vColor = color;
  // Transforma la posición de la partícula
  vec3 newPosition = position;
  float x = position.x;
  float z = position.z;


  newPosition.y = sin((time * animTime) * vSize) * intensity;

  newPosition.x =x + sin((time + vSize) ) *  turbulence + z;
  newPosition.z =z + sin((time + vSize) ) *  turbulence -x;




  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = vSize; // Tamaño de las partículas (puedes ajustarlo)
}
