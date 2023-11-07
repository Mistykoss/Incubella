
// Vertex shader para partículas
attribute vec3 color;
attribute float particleSize;
attribute vec3 targetPos;
uniform float time;
uniform vec2 u_mouse;


varying vec2 vUv;
varying float vSize;
varying vec3 vColor; // Variable que almacena el color de la partícula

float noise1d(float v){
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

vec3 lerp(vec3 actualPos, vec3 target, float time){
  vec3 relative = vec3(0.0);

  relative.x = actualPos.x + (target.x - actualPos.x ) * time;
  relative.y = actualPos.y + (target.y - actualPos.y ) * time;
  relative.z = actualPos.z + (target.z - actualPos.z ) * time;

  return  (relative);
}

void main() {
  vUv = uv;

  vSize = particleSize;
  float intensity = 0.5;
  float turbulence = 0.35;
  float animTime = 0.0001;
  vColor = color;

  // Transforma la posición de la partícula
  vec3 newPosition = position;
  float x = position.x;
  float z = position.z;

//vec3 targetpos = vec3(targetPos);


  newPosition.x =x + noise1d(animTime * abs(time)  + vSize) * 2.0 ;
  newPosition.z =z + noise1d(animTime * abs(time)  + vSize) * 2.0 ;
  float relativeTime = time *.1;


//newPosition = lerp (position, targetPos, relativeTime);

//agregar el movimiento del mouse
float relative = length(u_mouse.xy - newPosition.xz);
float mouseDistance = clamp(relative, 1.5, 15.0);

  //newPosition.y =  sin((mouseDistance * animTime) * vSize) * intensity;
  float r =  x*x + z*z;
  //newPosition.y =  cos(r) *5.0;


  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = vSize; // Tamaño de las partículas (puedes ajustarlo)
}
