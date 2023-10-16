import {
  AdditiveBlending,
  AmbientLight,
  AxesHelper,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  IcosahedronGeometry,
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

import * as dat  from "dat.gui";

import { WebManager } from "./scenes/utils/WebManager";
import { CameraManager } from "./scenes/utils/CameraManager";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import TWEEN from "@tweenjs/tween.js";

//shaders
import f_Particles from "./scenes/shaders/f_Particles.glsl";
import v_Particles from "./scenes/shaders/v_Particles.glsl";

import f_mainSphere from "./scenes/shaders/f_mainSphere.glsl";
import v_mainSphere from "./scenes/shaders/v_mainSphere.glsl";

const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const primeraPantalla = new Vector3(0, 100, 100);
const segundaPantalla = new Vector3(0, 45, 10);

let isSecondScreen = false;
let isInScreen = false;

const CAM_MANAGER = new CameraManager(camera);
CAM_MANAGER.container.position.copy(primeraPantalla);
console.log(CAM_MANAGER.container.position);
//CAM_MANAGER.container.position.set(0, 100, 100);

CAM_MANAGER.camera.lookAt(new Vector3(0, 0, 0));

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

//la escena web
webManager.setEnviroment(webManager.web3d, (web) => {
  const ambientLight = new AmbientLight();
  ambientLight.intensity = 2;
  const axisHelper = new AxesHelper(20);

  // Crear una geometría para las partículas (por ejemplo, un BufferGeometry con muchas partículas)
  particleGeometry = new BufferGeometry();

  const particleCount = 5000; // Cantidad de partículas
  const colors = [
    0x90a9ff,
    0x3fb0ff, // Celeste claro
    0x2596be, // azul bandera
    0xe9f5f9, // Azul neon

    // Puedes agregar más colores aquí...
  ];
  const sizeArray = new Float32Array(particleCount);
  const positions = new Float32Array(particleCount * 3);
  const colorsArray = new Float32Array(particleCount * 3);

  const area = 0.5; //ajusta el area ocmpleta de la nube de particulas
  const centerSize = 1;
  const amplitude = 0.1; // valor mas alto mas larga es el ala
  const divisiones = 40; // mas divisiones mas colores
  let counter = divisiones;
  const noiseAmplitude = 23; //un valor mas alto agrega mas ruido
  const noiseIntensity = 10; //un valor mas alto agrega mas ruido
  const ringFrecuency = 0.1; //valor mas bajo es mas frecuencia
  const TWO_PI = 2 * Math.PI;

  //generar las particulas
  for (let index = 0; index < divisiones; index++) {
    counter--;
    let relativeSum = (particleCount / divisiones) * index;
    let relativeCount = particleCount / divisiones + relativeSum;
    const divisionParticleCount = relativeCount - relativeSum;
    let rIndex = relativeSum;

    const random = Math.random() * index + centerSize;
    const insideRadius = random;

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

      sizeArray[rIndex] = Math.random() * (index * 0.3) + centerSize;

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

  // Crear un material para las partículas (puedes personalizar esto según tus necesidades)
  particleMaterial = new ShaderMaterial({
    vertexShader: v_Particles, // Tu vertex shader existente
    fragmentShader: f_Particles, // Tu fragment shader existente
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
    },
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
    transparent: true
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

  // Agregar el sistema de partículas a la escena (suponiendo que tienes una escena)
  web.add(particleSystem);
  web.add(mainSphere);
  web.add(sphere);

    // Agregar el objeto Mesh (partículas) a la escena
    web.add(particles);
    web.add(secondParticles);

    particles.visible = false;
    secondParticles.visible = false;

});

//la escena html
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

      elementContainer.appendChild(element);

      const header = new CSS3DObject(elementContainer);
      const scale = 0.15;

      header.scale.set(scale, scale, scale);
      header.position.set(1, 0, 0);

      html.add(header);
      domItems.push(header);
    }
  }

  //segunda pantalla

  for (let index = 0; index < 5; index++) {
    
  const element = document.createElement("div");
  const elementContainer = document.createElement("div");
  element.innerHTML = "Lorem";
  element.classList.add("element-b");
  elementContainer.appendChild(element);

  const header = new CSS3DObject(elementContainer);
  const scale = 0.04;

  header.scale.set(scale, scale, scale);
  html.add(header);
  domItemsSecond.push(header);
  }
  //posicionar los segunda pantalla
  const radioS = 22;
  const centerS = new Vector3(0, 0, -8); // Vector3 que representa el centro


  for (let index = 0; index < domItemsSecond.length; index++) {
    const fixed = 1;
    const fixedAngle = -39.4;
    const angle = (Math.PI * fixed * index) / domItems.length; // Calcular el ángulo para esta iteración
    const x = radioS * Math.sin(angle - fixedAngle);
    const z = radioS * Math.cos(angle - fixedAngle);

    const position = new Vector3(x, 0, z);
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

const segundaVista = new Vector3(0, 0, -19);
target = new Vector3(0, 0, -8);


//DETECTAR EL TOQUE DE LA PANTALLA
document.addEventListener("click", () => {
  isSecondScreen = true;
  console.log("viajar", isSecondScreen);
});

const screenAnim = animatePosition(
  CAM_MANAGER.container.position,
  segundaPantalla,
  4500
);
const viewAnim = animatePosition(
  target,
  segundaVista,
  1200
);

webManager.setAnimations((delta) => {
  dotSphere.uniforms.time.value = delta * 0.5;
  dotSphere.uniforms.time.needsUpdate = true;

  particleMaterial.uniforms.time.value = delta;
  particleMaterial.uniforms.time.needsUpdate = true;


  sphereParticle.uniforms.time.value = delta * 0.5;
  sphereParticle.uniforms.time.needsUpdate = true;

  //animar esfera
  const angular = Math.sin(delta);

  if (isSecondScreen) {
    isInScreen = true;
    viewAnim.update();
    screenAnim.update();
    screenAnim.onComplete(()=>{
      isSecondScreen = false;
      particles.visible = true;
      secondParticles.visible = true;
      domItemsSecond.forEach((element) => {
        element.element.getElementsByClassName("element-b")[0].classList.add("active")
      });

      domItems.forEach((element) => {
        element.element.getElementsByClassName("element")[0].classList.add("desactive")
      });
    })
  } else {
    //primera pantalla
    console.log("NORMAL");
    if(!isInScreen){

     // CAM_MANAGER.update();

      sphere.position.y = angular + 10;
      mainSphere.position.y = angular + 10;
    }
    domItems.forEach((element) => {
      let relative = new Vector3().addVectors(
        CAM_MANAGER.container.position,
        element.position
      );

      let relativePos = new Vector3().addVectors(
        relative,
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

      
      let relativeFixed = new Vector3().subVectors(
        relative,
        target
      )

      let relativePos = new Vector3().addVectors(
        relativeFixed,
        CAM_MANAGER.camera.position
      );


      element.lookAt(relativePos);
    });


  }

  CAM_MANAGER.camera.lookAt(target);
});

//renderizar en el bucle
webManager.renderLoop();
webManager.debugScenes();


//funciones de ayuda

function animatePosition(objeto, nuevaPosicion, tiempoAnimacion) {
  // Creamos una nueva instancia de Tween para animar la posición
  const tween = new TWEEN.Tween(objeto)
    .to(nuevaPosicion, tiempoAnimacion)
    .easing(TWEEN.Easing.Quadratic.InOut);

    tween.start();
  // Retorna el objeto de animación para control externo
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
const cameraFolder = gui.addFolder('Camera Position');
cameraFolder.add(cameraControls, 'positionY', -100, 100).step(0.005).name('Y Position').onChange(() => {
  CAM_MANAGER.container.position.y = cameraControls.positionY;
});
cameraFolder.add(cameraControls, 'positionZ', -100, 100).step(0.005).name('Z Position').onChange(() => {
  CAM_MANAGER.container.position.z = cameraControls.positionZ;
});
