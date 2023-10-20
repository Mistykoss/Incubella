// Vertex Shader

uniform float time; // Tiempo para controlar la rotación
uniform float velocity; // Tiempo para controlar la rotación

void main() {
  float angle = time * velocity;
  float radius = 20.0;

  vec3 newPosition = position;

  newPosition.x += velocity * time;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = 5.0;
}
