import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LOD,
  Points,
  ShaderMaterial,
  TextureLoader,
} from "three";

const textureURL = new URL("particle.png", import.meta.url);

export default class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particlesMaterial = null;
  }

  CreateParticles(props) {
    console.log(props)
    // Configuración de la geometría de las partículas
    const geometry = new BufferGeometry();
    const positions = new Float32Array(props.amount * 3);
    const colors = new Float32Array(props.amount * 3);
    const sizes = new Float32Array(props.amount);

    // Creación y configuración de cada partícula
    for (let i = 0; i < props.amount; i++) {
      const radius = Math.pow(Math.random(), 0.5) * props.areaSize;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const z = radius * Math.sin(theta) * Math.sin(phi);
      const y = radius * Math.cos(theta);

      // Asignar posición a la geometría
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Calcular el factor de interpolación para el color
      const factor = radius / props.amount;

      // Interpolar entre el color interno y externo
      const color = new Color();
      color.copy(props.colorInner).lerp(props.colorOuter, factor);

      // Asignar color a la geometría
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Asignar tamaño aleatorio inicial a las partículas
      const rawSize = Math.random() * props.size;
      sizes[i] = rawSize < props.minSize ? props.minSize-2 : rawSize;

    }

    // Añadir atributos a la geometría
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.setAttribute("size", new BufferAttribute(sizes, 1));

    // Cargar la textura
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(textureURL);

    // Crear el material de las partículas
    const material = new ShaderMaterial({
      uniforms: {
        particleTexture: { value: texture }, // Textura de las partículas
        uTime: { value: 0.0 }, // Uniforme para el tiempo
      },
      vertexShader: `
      uniform float uTime; // Tiempo para la animación
attribute float size;
attribute vec3 color;
varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Calcula la distancia al agujero negro
  float distanceToBlackHole = length(position);
  
  // Calcula el ángulo de rotación en función del tiempo y la distancia al agujero negro
  float rotationAngle = uTime * 0.15 + distanceToBlackHole * 0.1;
  
  // Calcula las coordenadas rotadas en el eje x/z
  float rotatedX = position.x * cos(rotationAngle) - position.z * sin(rotationAngle);
  float rotatedZ = position.x * sin(rotationAngle) + position.z * cos(rotationAngle);
  
  // Aplica el desplazamiento y la rotación a la posición de la partícula
  mvPosition.x += rotatedX * 0.1;
  mvPosition.z += rotatedZ * 0.1;
  
  gl_PointSize = size * (size / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}

      
      
      
      `,
      fragmentShader: `
      varying vec3 vColor; // Variable que almacena el color de la partícula  
      void main() {

        
        
        // Calculamos la coordenada relativa al centro del fragmento
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // Calculamos la distancia del fragmento al centro del círculo
        float dist = length(coord);
        
        //ajustes de particulas
        vec3 lightColor = vColor; // Color de la luz
        float alpha = smoothstep(0.5, 0.4, dist);
        float alphaIntensity = 0.15;
        float lightIntensity = 1.0;

        // Descartamos los fragmentos que están fuera del radio de 0.5,
        // asignando un valor de opacidad de cero
        if (dist > 0.5) discard;

        // Calculamos el brillo de la partícula
  float brightness = pow(1.0 - dist, 2.0) * lightIntensity;

  // Calculamos el color final de la partícula con el brillo
  vec3 finalColor = vColor + lightColor * brightness;
      
        // Asignamos el color de la partícula al fragmento
        gl_FragColor = vec4(finalColor, alpha * alphaIntensity);
      }
      

    `,

      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    // Crear el objeto de partículas
    const particles = new Points(geometry, material);

    // Crear el objeto LOD
    const particleLOD = new LOD();
    particleLOD.addLevel(particles, 0);

    this.particlesMaterial = material;
    // Agregar el objeto LOD a la escena
    this.scene.add(particleLOD);
  }

  updateTime(time) {
    this.particlesMaterial.uniforms.uTime.value = time;
  }
}
