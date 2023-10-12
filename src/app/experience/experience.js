import {
  AdditiveBlending,
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { WebManager } from "./scenes/utils/WebManager";
import { CameraManager } from "./scenes/utils/CameraManager";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const CAM_MANAGER = new CameraManager(camera);
CAM_MANAGER.container.position.set(0, 100, 100);
CAM_MANAGER.camera.lookAt(new Vector3(0, 0, 0));

const webManager = new WebManager("Main", CAM_MANAGER);

const vertex = `
// Vertex shader para partículas
attribute vec3 color;
attribute float particleSize;
uniform float time;

varying float vSize;
varying vec3 vColor; // Variable que almacena el color de la partícula



void main() {
  vSize = particleSize;
  float intensity = 0.2;
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

`;
const fragment = `
varying vec3 vColor; // Variable que almacena el color de la partícula  
varying float vSize;

      void main() {

        
        
        // Calculamos la coordenada relativa al centro del fragmento
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // Calculamos la distancia del fragmento al centro del círculo
        float dist = length(coord);
        
        //ajustes de particulas
        vec3 lightColor = vColor; // Color de la luz
        float alpha = smoothstep(0.5, 0.4, dist);
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

`;

const mainSphereFragment = `
varying vec3 vertexNormal;

void main() {
  float dotFunction = dot(vertexNormal, vec3(0.0, 0.0, 1.0) );
  float intensity = pow(2.0 - dotFunction, 0.7);
  vec3 color = vec3(0.3, 0.6, 1.0) ;
  
  gl_FragColor = vec4(color, 1.0) * intensity;
}
`;

const mainSphereVertex = `
  varying vec3 vertexNormal;

  void main() {
    vertexNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

let particleGeometry;
let particleMaterial;
let animatedParticles = null;
let sphere = null;
let mainSphere = null;
let domItems = [];

//la escena web
webManager.setEnviroment(webManager.web3d, (web) => {
  const ambientLight = new AmbientLight();
  const axisHelper = new AxesHelper(5);

  // Crear una geometría para las partículas (por ejemplo, un BufferGeometry con muchas partículas)
  particleGeometry = new BufferGeometry();
  const particleCount = 10000; // Cantidad de partículas
  const positions = new Float32Array(particleCount * 3);
  const colorsArray = new Float32Array(particleCount * 3);
  const sizeArray = new Float32Array(particleCount);

  const maxRadius = 5; //tamano maximo de la nube
  const centerSize = 1;
  const area = 0.45; //ajusta el area ocmpleta de la nube de particulas
  const divisiones = 40; // mas divisiones mas colores
  const ringFrecuency = 0.1; //valor mas bajo es mas frecuencia
  const amplitude = 0.1; // valor mas alto mas larga es el ala
  const noiseIntensity = 10; //un valor mas alto agrega mas ruido
  const noiseAmplitude = 23; //un valor mas alto agrega mas ruido
  const radiusRandom = 4; //mayor valor mayor aros inversos

  const TWO_PI = 2 * Math.PI;
  const colors = [
    0x90a9ff,
    0x3fb0ff, // Celeste claro
    0x2596be, // azul bandera
    0xe9f5f9, // Azul neon

    // Puedes agregar más colores aquí...
  ];

  //  Crea un uniform para el tiempo
  const timeUniform = { value: 0.0 }; // Inicializa el valor del tiempo

  const separation = 4;
  // Crea un arreglo para almacenar las coordenadas x, y, z de las partículas
  const particlePositions = [];

  let counter = divisiones;
  for (let index = 0; index < divisiones; index++) {
    counter--;
    let relativeSum = (particleCount / divisiones) * index;
    let relativeCount = particleCount / divisiones + relativeSum;
    const divisionParticleCount = relativeCount - relativeSum;
    let rIndex = relativeSum;

    const random = Math.random() * index + centerSize;

    const insideRadius = random;

    console.log(insideRadius);

    for (; rIndex < relativeCount; rIndex++) {
      // Obtener el color para esta partícula
      // Calcula la posición Y para crear la onda en el borde del círculo

      const colorIndex = index % colors.length;
      const actualColor = colors[colorIndex];
      const color = new Color(actualColor);

      colorsArray[rIndex * 3] = color.r;
      colorsArray[rIndex * 3 + 1] = color.g;
      colorsArray[rIndex * 3 + 2] = color.b;
      //calcular anguloas reativos
      const angleIncrement = TWO_PI / divisionParticleCount;
      const angle = angleIncrement * rIndex;

      const circleNoise = Math.sin(angle * noiseAmplitude) * noiseIntensity;

      sizeArray[rIndex] = Math.random() * (index * 0.5) + centerSize;

      //noise

      //ecuaciones
      const xEcuation =
        Math.cos(rIndex * ringFrecuency) * (1 + amplitude * Math.sin(rIndex));
      const zEcuation =
        Math.sin(rIndex * ringFrecuency) * (1 + amplitude * Math.sin(rIndex));

      //plano cartesiano
      const x =
        insideRadius *
        xEcuation *
        (Math.random() -
          0.5 * (Math.random() * noiseIntensity + noiseAmplitude));
      const z =
        insideRadius *
        zEcuation *
        (Math.random() -
          0.5 * (Math.random() * noiseIntensity + noiseAmplitude));

      let y = 0;
      if (Math.random() <= 0.2) {
        console.log("menor");
        y = (Math.random() - 0.5) * 15;
      }
      //const x = (Math.cos(angle * ringParticleAmount) ) + (Math.sin(angle * ringParticleAmount));
      //const y = 0;
      //const z = insideRadius * Math.sin(angle * ringParticleAmount) + 0.5 * Math.sin(angle);

      positions[rIndex * 3] = x * area;
      positions[rIndex * 3 + 1] = y;
      positions[rIndex * 3 + 2] = z * area;
      //particlePositions.push(x*area, y *area, z*area)
    }
  }

  // Luego, puedes usar particlePositions para configurar la geometría de las partículas
  particleGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new BufferAttribute(colorsArray, 3));
  particleGeometry.setAttribute(
    "particleSize",
    new BufferAttribute(sizeArray, 1)
  );
  console.log(sizeArray);

  // Crear un material para las partículas (puedes personalizar esto según tus necesidades)
  particleMaterial = new ShaderMaterial({
    vertexShader: vertex, // Tu vertex shader existente
    fragmentShader: fragment, // Tu fragment shader existente
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
    },
  });


  sphere = new Mesh(
    new SphereGeometry(12, 32, 32),
    new ShaderMaterial({

      fragmentShader: mainSphereFragment,
      vertexShader: mainSphereVertex,
      side: BackSide
    })
  );


  mainSphere = new Mesh(
    new SphereGeometry(10.5, 32, 32),
    new MeshBasicMaterial({
      color: 0x000,      // Color base blanco
    })
  );
  

  // Crear un sistema de partículas
  const particleSystem = new Points(particleGeometry, particleMaterial);

  // Agregar el sistema de partículas a la escena (suponiendo que tienes una escena)
  web.add(particleSystem);
  web.add(sphere);
  web.add(mainSphere);
  //web.add(ambientLight);



  // Agregar el objeto cube a la escena (suponiendo que tienes una escena)
  web.add(axisHelper);
  //web.add(ambientLight);
});

//la escena html
webManager.setEnviroment(webManager.webHtml, (html) => {

  const dots = {
    chat: {
      title: "Token-gated chat",
      link: "https://img.icons8.com/material-rounded/24/filled-chat.png",
    },
    ntf: {
      title: "NFT ticketing",
      link: "https://img.icons8.com/ios-filled/50/image-file.png",
    },
    chain: {
      title: "On-chain Memberships",
      link: "https://img.icons8.com/external-obvious-glyph-kerismaker/48/external-block-chain-digital-service-glyph-obvious-glyph-kerismaker.png",
    },
    card: {
      title: "Access cards",
      link: "https://img.icons8.com/material-rounded/24/tab.png",
    },
  };
  
  for (const key in dots) {
    if (dots.hasOwnProperty(key)) {
      const dot = dots[key];
      console.log("Título:", );
      console.log("Enlace:", );

      const elementContainer = document.createElement("div");
      const element = document.createElement("div");
      const img = document.createElement("img");
      const span = document.createElement("span");
      const text = document.createElement("h2");
    
    
      element.classList.add("element");
      img.srcset = dot.link;
      text.innerHTML = dot.title;


      element.appendChild(span);
      element.appendChild(text);
      element.appendChild(img);
    
      elementContainer.appendChild(element);
    
      const header = new CSS3DObject(elementContainer);
    
      const scale = 0.15;
    
      header.scale.set(scale, scale, scale);
      header.position.set(1, 0, 0);
    
      html.add(header);
      domItems.push(header);
    }
  }
  

  const radio = 50;
  const center = new Vector3(0, 0, -20); // Vector3 que representa el centro
  
  for (let index = 0; index < domItems.length; index++) {
    const angle = (Math.PI * 2 * index) / domItems.length; // Calcular el ángulo para esta iteración
    const x = radio * Math.sin(angle);
    const z = radio * Math.cos(angle);
  
    const position = new Vector3(x, 0, z);
    position.add(center); // Sumar el vector del centro para obtener la posición final
  
    domItems[index].position.copy(position);
  }
  
  
});

webManager.setAnimations((delta) => {
  particleMaterial.uniforms.time.value = delta;
  particleMaterial.uniforms.time.needsUpdate = true;

  //animar esfera
  const angular = Math.sin(delta);
  sphere.position.y =  angular+10;
  mainSphere.position.y = angular +10;

  CAM_MANAGER.update();
  CAM_MANAGER.camera.lookAt(new Vector3(0, 0, 0));

  domItems.forEach(element => {
    let relative = 
    new Vector3().addVectors(CAM_MANAGER.container.position, element.position);

    let relativePos =
    new Vector3().addVectors(relative, CAM_MANAGER.camera.position);

    element.lookAt(relativePos);
    element.position.y = angular -1;
  });
});

//renderizar en el bucle
webManager.renderLoop();
webManager.debugScenes();

function LegacyDraw() {
  for (let index = 0; index < divisiones; index++) {
    let relativeSum = (particleCount / divisiones) * index;
    let relativeCount = particleCount / divisiones + relativeSum;
    const divisionParticleCount = relativeCount - relativeSum;
    let rIndex = relativeSum;

    for (; rIndex < relativeCount; rIndex++) {
      // Obtener el color para esta partícula
      const colorIndex = index % colors.length;
      const actualColor = colors[colorIndex];
      const color = new Color(actualColor);
      console.log(colorIndex);
      colorsArray[rIndex * 3] = color.r;
      colorsArray[rIndex * 3 + 1] = color.g;
      colorsArray[rIndex * 3 + 2] = color.b;

      sizeArray[rIndex] = lerp(5, 15, Math.random());

      /*
      * (Math.sin(rIndex *frecuency)+1 * index)) * altura

      * (Math.sin(rIndex *frecuency)+1 * index)) * altura
      */
      const angleIncrement = TWO_PI / divisionParticleCount;

      const yAngle = TWO_PI / rIndex;

      const angle = angleIncrement * rIndex;
      const insideRadius = lerp(minRadius, maxRadius, index);
      const circleFrecuency = Math.sin(rIndex * ringFrecuency) * index * altura;
      const circleNoise = Math.cos(rIndex * noiseIntensity);

      const x = Math.sin(angle * ringParticleAmount) * insideRadius;
      const y = circleFrecuency;
      const z = Math.cos(angle * ringParticleAmount) * insideRadius;

      positions[rIndex * 3] = x * area;
      positions[rIndex * 3 + 1] = y * area;
      positions[rIndex * 3 + 2] = z * area;
    }
    console.log(sizeArray);
  }
}

function onda() {
  for (let xIndex = 0; xIndex < particleCount; xIndex++) {
    for (let zIndex = 0; zIndex < particleCount; zIndex++) {
      const x = separation * (xIndex - particleCount / 2);
      const z = separation * (zIndex - particleCount / 2);
      const y = graph(x, z);

      // Agrega las coordenadas x, y, z a la matriz de posiciones de partículas
      particlePositions.push(x, y, z);
    }
  }
}

function graph(x, z) {
  const t = 5;
  const frecuency = 0.002;
  const altura = 8;

  return Math.sin(frecuency * (x ** 2 + z ** 2 + t)) * altura;
}

function lerp(start, end, t) {
  return start + t * (end - start);
}

function lerpNumber(min, max, probability) {
  // Generar un número aleatorio entre 0 y 1
  const randomValue = Math.random();

  if (randomValue <= probability) {
    // 75% de las veces, devuelve un valor menor o igual al mínimo
    return Math.random() * (min + 1);
  } else {
    // 25% de las veces, devuelve un valor mayor o igual al máximo
    return Math.random() * (max - min + 1) + min;
  }
}
