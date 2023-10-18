// Vertex Shader

uniform float time; // Tiempo para controlar la rotación

void main() {
  // Calcula los ángulos de rotación en función del tiempo
  float angleX = time; // Ángulo de rotación en el eje X
  float angleY = time; // Ángulo de rotación en el eje Y

  // Calcula las matrices de rotación para los ejes X e Y
  mat4 rotationX = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, cos(angleX), -sin(angleX), 0.0,
    0.0, sin(angleX), cos(angleX), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 rotationY = mat4(
    cos(angleY), 0.0, sin(angleY), 0.0,
    0.0, 1.0, 0.0, 0.0,
    -sin(angleY), 0.0, cos(angleY), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  // Aplica las rotaciones a las coordenadas del vértice en ambos ejes
  vec4 rotatedPosition = rotationY * rotationX * vec4(position, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * rotatedPosition;
}
