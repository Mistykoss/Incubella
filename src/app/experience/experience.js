import {
  AdditiveBlending,
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  IcosahedronGeometry,
  ImageUtils,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  Group
} from "three";

import * as dat from "dat.gui";

import { WebManager } from "./scenes/utils/WebManager";
import { CameraManager } from "./scenes/utils/CameraManager";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import TWEEN, { Tween, add } from "@tweenjs/tween.js";

//shaders
import f_Particles from "./scenes/shaders/f_Particles.glsl";
import v_Particles from "./scenes/shaders/v_Particles.glsl";

import f_relleno from "./scenes/shaders/f_relleno.glsl";
import v_relleno from "./scenes/shaders/v_relleno.glsl";

import f_mainSphere from "./scenes/shaders/f_mainSphere.glsl";
import v_mainSphere from "./scenes/shaders/v_mainSphere.glsl";

import f_pSphere from "./scenes/shaders/f_pSphere.glsl";
import v_pSphere from "./scenes/shaders/v_pSphere.glsl";

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const primeraPantalla = new Vector3(0, 100, 100);
const segundaPantalla = new Vector3(0, 30, 30);
const debugPantalla = new Vector3(0, 500, 500);

let isSecondScreen = false;
let isInScreen = false;

const CAM_MANAGER = new CameraManager(camera);
CAM_MANAGER.container.position.copy(primeraPantalla);
//CAM_MANAGER.container.position.set(0, 100, 100);


const webManager = new WebManager("Main", CAM_MANAGER);

//global variables

let particleGeometry;
let particleMaterial;

let sphere = null;
let dotSphere = null;
let particles = null;
let mainSphere = null;
let secondSphere = null;
let sphereParticle = null;
let secondParticles = null;

let domItems = [];
let domItemsSecond = [];
let canTravelTo = false;
let target = null;

//nueva esfera
let sphereGeometry = null;

let n_Material = null;
let p_Sphere = null;
let p_SphereMaterial = null;

let axisHelper = null;



// Variables
const maxParticleCount = 1000;
const particleCount = 500;
const r = 60  ;
const rHalf = r / 2;
let vertexpos = 0;
let colorpos = 0;
let numConnected = 0;

  // Create particles
  const particlesGeometry = new BufferGeometry();
  const particlePositions = new Float32Array(maxParticleCount * 3);
  const particlesData = [];
  let linesGeometry = null;
  let linesMaterial = null;

  let s_positions = null;
  let s_colors = null;




let sp_ParticlesCount = 1200;
let sp_ParticlesGeometry = new BufferGeometry();
let sp_ParticlesPosition = new Float32Array(sp_ParticlesCount);
let sp_Particles = null;
let sp_ParticlesMaterial = new PointsMaterial( {
  color: 0x0dd5fd,
  size: 3,
  blending: AdditiveBlending,
  transparent: true,
  sizeAttenuation: false
} );
let sp_ParticlesData = [];
let sp_radio = 12;
let sp_radioHalf = sp_radio/2;

let sp_segments = sp_ParticlesCount* sp_ParticlesCount;
let sp_linesGeometry = new BufferGeometry();
let sp_linesMaterial = new LineBasicMaterial( {
  color: 0x0dd5fd,
  vertexColors: true,
  blending: AdditiveBlending,
  transparent: true
} );
let sp_linesPositions = new Float32Array(sp_segments *3);
let sp_linesColors = new Float32Array(sp_segments *3);
let sp_linesParticles = null;


const minDistance = 3.5;
const maxConnections = 2;
const particleSpeed = 150; // valor mas alto, mas lento

const colorSphere = new Color(0x0dd5fd);


//valor de factor de las particulas
const particleProps = {
  opacity: 1.0
}



//la escena web
webManager.setEnviroment(webManager.web3d, (web) => {
//INICIO NUEVA ESFERA


for (let i = 0; i < sp_ParticlesCount; i++) {
  const x = Math.random() * sp_radio - sp_radio / 2;
  const y = Math.random() * sp_radio - sp_radio / 2;
  const z = Math.random() * sp_radio - sp_radio / 2;

  sp_ParticlesPosition[i * 3] = x;
  sp_ParticlesPosition[i * 3 + 1] = y;
  sp_ParticlesPosition[i * 3 + 2] = z;

  const v = new Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2);
  const velocity = new Vector3(v.x, v.y, v.z);
  velocity.normalize().divideScalar(particleSpeed);

  sp_ParticlesData.push({ velocity: velocity, numConnections: 0 });
}

  // Luego, puedes usar particlePositions para configurar la geometría de las partículas
  sp_ParticlesGeometry.setAttribute(
    "position",
    new BufferAttribute(sp_ParticlesPosition, 3)
  );


    // Luego, puedes usar particlePositions para configurar la geometría de las partículas
    sp_linesGeometry.setAttribute(
      "position",
      new BufferAttribute(sp_linesPositions, 3).setUsage( DynamicDrawUsage ) );
    sp_linesGeometry.setAttribute(
      "color",
      new BufferAttribute(sp_linesColors, 3).setUsage( DynamicDrawUsage ) );

      sp_linesGeometry.computeBoundingSphere();

      sp_linesGeometry.setDrawRange( 0, 0 );



//agregar 
sp_Particles = new Points(sp_ParticlesGeometry, sp_ParticlesMaterial);
sp_linesParticles = new LineSegments(sp_linesGeometry, sp_linesMaterial)

web.add(sp_Particles);
web.add(sp_linesParticles);




  //FINAL DE LA NUEVA ESFERA
  const ambientLight = new AmbientLight();
  ambientLight.intensity = 2;
   axisHelper = new AxesHelper(20);

  axisHelper.position.copy(new Vector3(0, 32, 0));

  //web.add(axisHelper);

  // Crear una geometría para las partículas (por ejemplo, un BufferGeometry con muchas partículas)
  particleGeometry = new BufferGeometry();

  const particleCount = 30000; // Cantidad de partículas
  const colors = [
    0x0dd5fd, //azul
    0x0dd5fd, //azul
    0x0c94fc, // Celeste claro
    0x0c94fc, // Celeste claro
    0xa133d7, // morado
    0x2573b0, // azul bandera
    0x2573b0, // azul bandera

    // Puedes agregar más colores aquí...
  ];
  const sizeArray = new Float32Array(particleCount);
  const positions = new Float32Array(particleCount * 3);
  const colorsArray = new Float32Array(particleCount * 3);

  const area = 1; //ajusta el area ocmpleta de la nube de particulas
  const centerSize = 3;
  const amplitude = 0.1; // valor mas alto mas larga es el ala
  const divisiones = 40; // mas divisiones mas colores
  let counter = divisiones;
  let noiseAmplitude = 10; //un valor mas alto agrega mas ruido
  let noiseIntensity = 1; //un valor mas alto agrega mas ruido
  let ringFrecuency = 0.1; //valor mas bajo es mas frecuencia
  const TWO_PI = 2 * Math.PI;

  const n_particleCount = 3000;
  const p_rellenoGeometry = new BufferGeometry();
  const p_rellenoPosition = new Float32Array(n_particleCount * 3);

  //generar las particulas
  for (let index = 0; index < divisiones; index++) {
    counter--;
    let relativeSum = (particleCount / divisiones) * index;
    let relativeCount = particleCount / divisiones + relativeSum;
    const divisionParticleCount = relativeCount - relativeSum;
    let rIndex = relativeSum;

    const random = Math.random() *  index + centerSize;
    const insideRadius = random;

    for (; rIndex < relativeCount; rIndex++) {
      // Obtener el color para esta partícula
      // Calcula la posición Y para crear la onda en el borde del círculo

      const colorIndex =  index % colors.length;
      const colorRIndex =  colorIndex % colors.length;
      const actualColor = colors[colorRIndex];
      const color = new Color(actualColor);

      colorsArray[rIndex * 3] = color.r;
      colorsArray[rIndex * 3 + 1] = color.g;
      colorsArray[rIndex * 3 + 2] = color.b;
      //calcular anguloas reativos
      const angleIncrement = TWO_PI / divisionParticleCount;
      const angle = angleIncrement * rIndex;

      const rNumber = Math.random() * 15;
      const rMinNumber = Math.random() * 5 +1;
      const log = Math.abs(Math.tan(rIndex + 1) * Math.tan(index +  rNumber)) * rNumber;
      //console.log(log);
      sizeArray[rIndex] = Math.min(Math.max(log,rMinNumber), rNumber);

      //noise
      if(index > divisiones-5){
        noiseIntensity = noiseIntensity + 8;
        noiseIntensity = noiseAmplitude + 5;
        ringFrecuency = ringFrecuency + 0.5;
      }

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

      let y = Math.min(Math.tan(angle + rNumber + index), 5);
      //const x = (Math.cos(angle * ringParticleAmount) ) + (Math.sin(angle * ringParticleAmount));
      //const y = 0;
      //const z = insideRadius * Math.sin(angle * ringParticleAmount) + 0.5 * Math.sin(angle);

      positions[rIndex * 3] = x * area;
      positions[rIndex * 3 + 1] = y;
      positions[rIndex * 3 + 2] = z * area;
      //particlePositions.push(x*area, y *area, z*area)
    }
  }

  console.log(sizeArray, "AQUI!!")

  const nRadius = 150;

  const n_colorsArray = new Float32Array(n_particleCount * 3);
  const n_sizeArray = new Float32Array(n_particleCount);

  // Crear un material para las partículas (puedes personalizar esto según tus necesidades)
  n_Material = new ShaderMaterial({
    vertexShader: v_relleno, // Tu vertex shader existente
    fragmentShader: f_relleno, // Tu fragment shader existente
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
    },
  });

  for (let index = 0; index < p_rellenoPosition.length; index++) {
    const x = (Math.random() - 0.5) * nRadius * 2;
    const y = (Math.random() - 0.35) * nRadius;
    const z = (Math.random() - 0.5) * nRadius * 2;

    if (index > (n_particleCount * 3) / 5) {
      n_sizeArray[index] = Math.random() * ((index % 15) - 1) + 2;
    } else {
      n_sizeArray[index] = Math.random() * ((index % 5) - 1) + 2;
    }

    const colorIndex = index % colors.length;
    const actualColor = colors[colorIndex];
    const color = new Color(actualColor);

    n_colorsArray[index * 3] = color.r;
    n_colorsArray[index * 3 + 1] = color.g;
    n_colorsArray[index * 3 + 2] = color.b;

    p_rellenoPosition[index * 3] = x;
    p_rellenoPosition[index * 3 + 1] = y;
    p_rellenoPosition[index * 3 + 2] = z;
  }

  // Luego, puedes usar particlePositions para configurar la geometría de las partículas
  p_rellenoGeometry.setAttribute(
    "position",
    new BufferAttribute(p_rellenoPosition, 3)
  );
  //ESCONDER
  
  p_rellenoGeometry.setAttribute(
    "color",
    new BufferAttribute(n_colorsArray, 3)
  );

  
  p_rellenoGeometry.setAttribute(
    "particleSize",
    new BufferAttribute(n_sizeArray, 1)
  );

  particleGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new BufferAttribute(colorsArray, 3));
  particleGeometry.setAttribute(
    "particleSize",
    new BufferAttribute(sizeArray, 1)
  .setUsage( DynamicDrawUsage ));

  console.log(particleGeometry)
  // Crear un material para las partículas (puedes personalizar esto según tus necesidades)
  // Cargar la textura
const textureUrl = new URL("./effects/particle.png", import.meta.url);


  particleMaterial = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      u_texture: {value: new TextureLoader().load(textureUrl.href) },
      u_mouse: {value: new Vector2()},
      opacityFactor: {value: particleProps.opacity},
    },
    vertexShader: v_Particles, // Tu vertex shader existente
    fragmentShader: f_Particles, // Tu fragment shader existente
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    
  });

  //OBJETOS
  sphere = new Mesh(
    new SphereGeometry(12, 32, 32),
    new ShaderMaterial({
      fragmentShader: f_mainSphere,
      vertexShader: v_mainSphere,
      side: BackSide,
    })
  );

  mainSphere = new Mesh(
    new SphereGeometry(10.5, 32, 32),
    new MeshBasicMaterial({
      color: 0x000, // Color base blanco
    })
  );

  secondSphere = new Mesh(
    new SphereGeometry(30, 60, 30),
    new MeshStandardMaterial({
      color: "white",
    })
  );

  sphereParticle = new ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      uniform float time;
      varying vec3 vPosition;

      float random(float x) {
        return fract(sin(x * 12.9898) * 43758.5453);
    }

    
      void main() {
        vec3 newPosition = position + normalize(position) * (0.2 * sin(time + position.x));
        vPosition = newPosition;
        // Animamos el tamaño de las partículas a lo largo del tiempo
        float noise = random(position.z);
        float size = 0.2 + 0.1 * sin(time * 2.0) * noise; // Ajusta la frecuencia y la amplitud según tus preferencias

        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        gl_PointSize = size * 55.0;// Tamaño de las partículas (puedes ajustarlo)

      }
    `,
    fragmentShader: `
      void main() {
        vec3 color = vec3(1.0, 1.0, 1.0) ;
        gl_FragColor = vec4(color, .3);
      }
    `,
    wireframe: true,
  });

  const fragmentShaderSphere = `
      void main() {
        vec3 vColor = vec3(1.0, 1.0, 1.0);

        
        // Calculamos la coordenada relativa al centro del fragmento
        vec2 coord = gl_PointCoord - vec2(0.5);
        
        // Calculamos la distancia del fragmento al centro del círculo
        float dist = length(coord);
        
        //ajustes de particulas
        vec3 lightColor = vColor; // Color de la luz
        float alpha = smoothstep(0.5, 0.1, dist);
        float alphaIntensity = 0.01;
        float lightIntensity = .45;

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

  secondParticles = new Mesh(new IcosahedronGeometry(13, 5), sphereParticle);

  dotSphere = new ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: sphereParticle.vertexShader,
    fragmentShader: fragmentShaderSphere,
    transparent: true,
  });
  // Supongamos que tienes una geometría de referencia llamada "otraGeometria"

  // Crear una BufferGeometry para las partículas y copiar las posiciones de otraGeometría
  const particleSphere = new BufferGeometry().copy(secondParticles.geometry);

  // Aplicar el shader material a la geometría de las partículas
  particleSphere.computeVertexNormals(); // Importante para los sombreados
  particles = new Points(particleSphere, dotSphere);

  particles.position.set(0, 10, 0);
  secondParticles.position.set(0, 10, 0);

  sphere.position.set(0, 10, 0);
  mainSphere.position.set(0, 10, 0);
  // Crear un sistema de partículas
  const particleSystem = new Points(particleGeometry, particleMaterial);

  const p_Relleno = new Points(p_rellenoGeometry, n_Material);

  //NEW SPHERE HERE!
  sphereGeometry = new SphereGeometry(20, 15, 30);

  p_Sphere = new BufferGeometry().copy(sphereGeometry);

  p_SphereMaterial = new ShaderMaterial({
    vertexShader: v_pSphere,
    fragmentShader: f_pSphere,
    uniforms: {
      time: { value: 0.0 },
    },
  });

  p_SphereVelocity = [];

  for (let index = 0; index < 496; index++) {
    p_SphereVelocity[index] = Math.random() * 2.5 + 1;
  }

  p_Sphere.setAttribute(
    "velocity",
    new BufferAttribute(new Float32Array(496), 1)
  );

  console.log(p_SphereVelocity);

  console.log(p_Sphere);

  p_Sphere = new Points(p_Sphere, p_SphereMaterial);


  //ESFER NUEVA AQUI





for (let i = 0; i < maxParticleCount; i++) {
  const x = Math.random() * r - r / 2;
  const y = Math.random() * r - r / 2;
  const z = Math.random() * r - r / 2;

  particlePositions[i * 3] = x;
  particlePositions[i * 3 + 1] = y;
  particlePositions[i * 3 + 2] = z;

  const v = new Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2);
  particlesData.push({ velocity: v.normalize().divideScalar(50), numConnections: 0 });
}

const particlesMaterial = new PointsMaterial({
  color: 0xffffff,
  size: 15,
  blending: AdditiveBlending,
  transparent: true,
  sizeAttenuation: false,
});

particlesGeometry.setAttribute('position', new BufferAttribute(particlePositions, 3));
const s_particles = new Points(particlesGeometry, particlesMaterial);
//web.add(s_particles);
// Create lines
linesGeometry = new BufferGeometry();
const segments = maxParticleCount * maxParticleCount;
s_positions = new Float32Array(segments * 3);
s_colors = new Float32Array(segments * 3);

linesMaterial = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending, transparent: true });

linesGeometry.setAttribute('position', new BufferAttribute(s_positions, 3));
linesGeometry.setAttribute('color', new BufferAttribute(s_colors, 3));

const lines = new LineSegments(linesGeometry, linesMaterial);

//web.add(lines);








  ///

  // Agregar el sistema de partículas a la escena (suponiendo que tienes una escena)
  //web.add(p_Sphere);

  web.add(p_Relleno);
  web.add(particleSystem);
  const plane = new Mesh(
    new PlaneGeometry(300, 300, 10),
    new MeshBasicMaterial({wireframe: true})
  );
  
  CAM_MANAGER.plane = plane;
  plane.rotation.x = -Math.PI/2;

  web.add(plane)
  //web.add(mainSphere);
  //web.add(sphere);

  // Agregar el objeto Mesh (partículas) a la escena
  //web.add(particles);
  //web.add(secondParticles);
  //axisHelper.position.copy(primeraPantalla)
  //web.add(axisHelper);

  particles.visible = false;
  secondParticles.visible = false;
  plane.visible = false;

  web.add(axisHelper);
});




const segundaVista = new Vector3(0, 30, 0);
target = new Vector3(0, 15, 0);



const screenAnim = animatePosition(
  CAM_MANAGER.container.position,
  segundaPantalla,
  4500
);
const viewAnim = animatePosition(target, segundaVista, 4200);


const opacityAnim = animateValue(
  particleProps,
  "opacity",
  0.05,
  4500
);
//opacityFactor = 0.1;

const handlreClick = (event)=>{
  console.log(event.target)
  isSecondScreen = true;
  console.log("viajar", isSecondScreen);
  screenAnim.start();
  viewAnim.start();
  opacityAnim.start();
};
//la escena html

let grupoDotsContainer = null;
const grupoDots = new Group();

let displayBContainer =  new Group();


webManager.setEnviroment(webManager.webHtml, (html) => {
  //agregar primera pantalla
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
  grupoDotsContainer = new Group();
  for (const key in dots) {
    if (dots.hasOwnProperty(key)) {
      const dot = dots[key];
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

      elementContainer.addEventListener("pointerdown", handlreClick);
      
      elementContainer.appendChild(element);

      const header = new CSS3DObject(elementContainer);
      const scale = 0.1;

      header.scale.set(scale, scale, scale);
      header.position.set(1, 0, 0);

      console.log(grupoDots)
      grupoDots.add(header);
      domItems.push(header);
    }
  }

  //configurar centro


  grupoDots.position.set(0,0, -15);
  grupoDotsContainer.position.set(0,15, 0);
  grupoDotsContainer.add(grupoDots);
  html.add(grupoDotsContainer);

  //segunda pantalla

  for (let index = 0; index < 5; index++) {
    const element = document.createElement("div");
    const elementContainer = document.createElement("div");
    element.innerHTML = "Lorem" + index;
    element.classList.add("element-b");
    elementContainer.appendChild(element);

    const header = new CSS3DObject(elementContainer);
    const scale = 0.04;

    header.scale.set(scale, scale, scale);
    displayBContainer.add(header);
    domItemsSecond.push(header);
  }

  CAM_MANAGER.displayA = domItems;
  CAM_MANAGER.displayB = domItemsSecond;

  html.add(displayBContainer);
  //posicionar los segunda pantalla
  const radioS = 25;
  const centerS = new Vector3(0, 35, 0); // Vector3 que representa el centro

  for (let index = 0; index < domItemsSecond.length; index++) {
    const fixed = 1;
    const fixedAngle = -5;
    const angle = (Math.PI * fixed * index) / domItemsSecond.length; // Calcular el ángulo para esta iteración
    const x = radioS * Math.sin(angle - fixedAngle);
    const y = radioS * Math.cos(angle - fixedAngle);

    const position = new Vector3(x, y, 0);
    console.log(position)
    position.add(centerS); // Sumar el vector del centro para obtener la posición final

    domItemsSecond[index].position.copy(position);
  }

  //vista relativo
  /*
  let relative = new Vector3().addVectors(
    CAM_MANAGER.container.position,
    header.position
  );
  let relativePos = new Vector3().addVectors(
    relative,
    CAM_MANAGER.camera.position
  );

  header.lookAt(relativePos);
  */
  ///

  //posicionar
  const radio = 40;
  const center = new Vector3(0, 10, 0); // Vector3 que representa el centro

  for (let index = 0; index < domItems.length; index++) {
    const angle = (Math.PI * 2 * index) / domItems.length; // Calcular el ángulo para esta iteración
    const x = radio * Math.sin(angle);
    const z = radio * Math.cos(angle);

    const position = new Vector3(x, 0, z);
    position.add(center); // Sumar el vector del centro para obtener la posición final

    domItems[index].position.copy(position);
  }
});


const sp_V = new Vector3();

webManager.setAnimations((delta) => {


  TWEEN.update();


    let vertexpos = 0
    let colorpos = 0
    let numConnected = 0

  for (let i = 0; i < sp_ParticlesCount; i++) {
    const particleData = sp_ParticlesData[i];
  
    sp_V.set(
      sp_ParticlesPosition[i * 3],
      sp_ParticlesPosition[i * 3 + 1],
      sp_ParticlesPosition[i * 3 + 2]
    )
      .add(particleData.velocity)
      .setLength(sp_radio);
    
    sp_ParticlesPosition[i * 3] = sp_V.x;
    sp_ParticlesPosition[i * 3 + 1] = sp_V.y;
    sp_ParticlesPosition[i * 3 + 2] = sp_V.z;
    

    if (sp_ParticlesPosition[i * 3 + 1] < -sp_radioHalf || sp_ParticlesPosition[i * 3 + 1] > sp_radioHalf) {
      sp_ParticlesData[i].velocity.y = -sp_ParticlesData[i].velocity.y;
    }
    
    if (sp_ParticlesPosition[i * 3] < -sp_radioHalf || sp_ParticlesPosition[i * 3] > sp_radioHalf) {
      sp_ParticlesData[i].velocity.x = -sp_ParticlesData[i].velocity.x;
    }
    
    if (sp_ParticlesPosition[i * 3 + 2] < -sp_radioHalf || sp_ParticlesPosition[i * 3 + 2] > sp_radioHalf) {
      sp_ParticlesData[i].velocity.z = -sp_ParticlesData[i].velocity.z;
    }
    

    //actualizar las lineas
    for (let j = i + 1; j < sp_ParticlesCount; j++) {
      const particleDataB = sp_ParticlesData[j];

      const dx = sp_ParticlesPosition[i * 3] -     sp_ParticlesPosition[j * 3]
      const dy = sp_ParticlesPosition[i * 3 + 1] - sp_ParticlesPosition[j * 3 + 1]
      const dz = sp_ParticlesPosition[i * 3 + 2] - sp_ParticlesPosition[j * 3 + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < minDistance) {
        particleData.numConnections++;
        particleDataB.numConnections++;

        const alpha = 0.8 - dist / minDistance;

      //XYZ
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[i * 3];
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[i * 3 + 1];
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[i * 3 + 2];

       //XYZ
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[j * 3];
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[j * 3 + 1];
       sp_linesPositions[vertexpos++] = sp_ParticlesPosition[j * 3 + 2];

       //RGB
        sp_linesColors[colorpos++] = alpha + colorSphere.r;
        sp_linesColors[colorpos++] = alpha + colorSphere.g;
        sp_linesColors[colorpos++] = alpha + colorSphere.b;

        //RGB
        sp_linesColors[colorpos++] = alpha + colorSphere.r;
        sp_linesColors[colorpos++] = alpha + colorSphere.g;
        sp_linesColors[colorpos++] = alpha + colorSphere.b;

        numConnected++
      }
    }
  }

  
  
  sp_ParticlesGeometry.attributes.position.needsUpdate = true;
  sp_linesGeometry.setDrawRange(0, numConnected * 2)
  sp_linesGeometry.attributes.position.needsUpdate = true;
  sp_linesGeometry.attributes.color.needsUpdate = true;

  //rotar 
  sp_Particles.rotation.y = delta *0.05;
  sp_linesParticles.rotation.y = delta *0.05;

  //dotSphere.uniforms.time.value = delta * 0.5;
  //dotSphere.uniforms.time.needsUpdate = true;
//
  //p_SphereMaterial.uniforms.time.value = delta * 0.5;
  //p_SphereMaterial.uniforms.time.needsUpdate = true;

  particleMaterial.uniforms.time.value = delta;
  particleMaterial.uniforms.time.needsUpdate = true;

  particleMaterial.uniforms.opacityFactor.value = particleProps.opacity;
  particleMaterial.uniforms.opacityFactor.needsUpdate = true;

  particleMaterial.uniforms.u_mouse.value.x = CAM_MANAGER.mouseData.mouse.x;
  particleMaterial.uniforms.u_mouse.value.y = CAM_MANAGER.mouseData.mouse.y;
  particleMaterial.uniforms.u_mouse.needsUpdate = true;

  //n_Material.uniforms.time.value = delta;
  //n_Material.uniforms.time.needsUpdate = true;
//
  //sphereParticle.uniforms.time.value = delta * 0.5;
  //sphereParticle.uniforms.time.needsUpdate = true;



  //animar esfera
  const angular = Math.sin(delta);

  CAM_MANAGER.camera.lookAt(target);
  CAM_MANAGER.orbitControls.update();

  TWEEN.update();

  if (isSecondScreen) {
    isInScreen = true;
    CAM_MANAGER.isDisplayA = false;
    


    
  
    //viewAnim.update();
    //screenAnim.update();
    //opacityAnim.update();

    
    screenAnim.onComplete(() => {

      //desactivar los controles de orbita

      CAM_MANAGER.orbitControls.minPolarAngle = Math.PI * 0.25;
      CAM_MANAGER.isDisplayB = true;
      CAM_MANAGER.orbitControls.maxPolarAngle = Math.PI * 0.25;

      isSecondScreen = false;
      //s_particles.visible = true;
      domItemsSecond.forEach((element) => {
        element.element
          .getElementsByClassName("element-b")[0]
          .classList.add("active");
      });

      domItems.forEach((element) => {
        element.element
          .getElementsByClassName("element")[0]
          .classList.add("desactive");
      });
    });
  } else {
    //primera pantalla
    
    if (!isInScreen) {
      //CAM_MANAGER.update();
      

      sp_Particles.position.y = angular +20;
      sp_linesParticles.position.y = angular +20;
    }
    domItems.forEach((element) => {
      let relative = new Vector3().addVectors(
        CAM_MANAGER.container.position,
        element.position
      );

      let fixed = new Vector3().addVectors(
        relative,
        grupoDotsContainer.position
      );
      let relativePos = new Vector3().addVectors(
        fixed,
        CAM_MANAGER.camera.position
      );

      element.lookAt(relativePos);
      element.position.y = angular - 1;
    });

    domItemsSecond.forEach((element) => {
      let relative = new Vector3().addVectors(
        CAM_MANAGER.container.position,
        element.position
      );

      let relativeFixed = new Vector3().subVectors(relative, target);

      let relativePos = new Vector3().addVectors(
        relativeFixed,
        CAM_MANAGER.camera.position
      );
      let relativePosFixed = new Vector3().subVectors(
        relativePos,
        displayBContainer.position
      );

      element.lookAt(relativePosFixed);
    });

    //mover los dots

    let relative = new Vector3().addVectors(
      CAM_MANAGER.container.position,
      grupoDotsContainer.position
    );

    let relativePos = new Vector3().addVectors(
      relative,
      CAM_MANAGER.camera.position
    );

    let relativeFixed = new Vector3(relativePos.x, relativePos.y, relativePos.z);
    relativeFixed.y = 0;

    grupoDotsContainer.lookAt(relativeFixed);
  }


  //mover los dots

  let relative = new Vector3().addVectors(
    CAM_MANAGER.container.position,
    displayBContainer.position
  );

  let relativePos = new Vector3().addVectors(
    relative,
    CAM_MANAGER.camera.position
  );

  displayBContainer.lookAt(relativePos);
  axisHelper.position.copy(displayBContainer.position);
  axisHelper.rotation.copy(displayBContainer.rotation);

  TWEEN.update();

});

//renderizar en el bucle
CAM_MANAGER.activeOrbit();
webManager.postProcesing = true;
webManager.renderLoop();
webManager.debugScenes();

//funciones de ayuda

function animatePosition(objeto, nuevaPosicion, tiempoAnimacion) {
  // Creamos una nueva instancia de Tween para animar la posición
  const tween = new TWEEN.Tween(objeto)
    .to(nuevaPosicion, tiempoAnimacion)
    .easing(TWEEN.Easing.Quadratic.InOut);

  //tween.start();
  // Retorna el objeto de animación para control externo
  return tween;
}


function animateValue(normal,target,  newValue, tiempoAnimacion) {

  const tween = new TWEEN.Tween(normal)
    .to({ [target]: newValue }, tiempoAnimacion) // Establecer 'opacity' como propiedad de destino
    .easing(TWEEN.Easing.Quadratic.InOut);
  return tween;
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

// Crear un objeto para almacenar los valores que se modificarán
const cameraControls = {
  positionY: CAM_MANAGER.container.position.y,
  positionZ: CAM_MANAGER.container.position.z,
};

// Crear una instancia de dat.GUI
const gui = new dat.GUI();

// Agregar controles para modificar la posición y y z de la cámara
const cameraFolder = gui.addFolder("Camera Position");
cameraFolder
  .add(cameraControls, "positionY", -100, 100)
  .step(0.005)
  .name("Y Position")
  .onChange(() => {
    CAM_MANAGER.container.position.y = cameraControls.positionY;
  });
cameraFolder
  .add(cameraControls, "positionZ", -100, 100)
  .step(0.005)
  .name("Z Position")
  .onChange(() => {
    CAM_MANAGER.container.position.z = cameraControls.positionZ;
  });
