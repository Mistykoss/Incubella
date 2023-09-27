import { Size } from "./utils/WindowHandler";
import { CameraManager } from "./utils/CameraManager";
import { WebScene, DomScene } from "./utils/SceneManager";
import * as dat from "dat.gui";
import { goToSecond } from "../template/DotsTemplate";
import TWEEN from "@tweenjs/tween.js";

import {
  AmbientLight,
  Clock,
  Color,
  DefaultLoadingManager,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { DotItems, goToSecond } from "../template/DotsTemplate";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import ParticleSystem from "./utils/effects/ParticleSystem";
import PostProcessing from "./utils/effects/PostProcessing";

const mouseNormalized = new Vector2();

//configurar camara
const _camera = new PerspectiveCamera(45, Size.ratio, 0.1, 1000);
export const CAM_MANAGER = new CameraManager(_camera);
//crear una nueva escena
const WEB_SCENE = new WebScene(CAM_MANAGER);
const DOM_SCENE = new DomScene(CAM_MANAGER);

//particle sytems
const particleSystem = new ParticleSystem(WEB_SCENE);

//DOM_SCENE.useOrbitControls();

const ambientLight = new AmbientLight();
const pointLight = new PointLight(0xfc4b08);
const pointLightHelper = new PointLightHelper(pointLight, 0.4);
pointLight.distance = 8;
pointLight.intensity = 35;

//esfera de la primera pantalla
const homeSphere = new Mesh(
  new SphereGeometry(1, 40, 42),
  new MeshStandardMaterial({
    color: 0x01e3556,
    wireframe: false,
    roughness: 0.8,
    metalness: 0.5,
  })
);

//esfera de la primera pantalla
const lines = new Mesh(
  new IcosahedronGeometry(1.4, 2),
  new MeshBasicMaterial({ color: 0x06798bc, wireframe: true })
);

//agregar particulas a la escena
const particleProps = {
  size: 12,
  minSize: 10,
  amount: 2000,
  areaSize: 8,
  colorInner: new Color(0x00ff0fc),
  colorOuter: new Color(0x07af8ff),
};
particleSystem.CreateParticles(particleProps);

homeSphere.position.set(0, 0, 0);
pointLight.position.set(1.4, -0.5, 0.4);

//agregar postprocesado
WEB_SCENE.enablePostProcesing();
WEB_SCENE.setPostProcessing(PostProcessing.bloomPass);

//agregarlo
WEB_SCENE.add(homeSphere);
WEB_SCENE.add(lines);
WEB_SCENE.add(ambientLight);
WEB_SCENE.add(pointLight);
//WEB_SCENE.add(pointLightHelper);

//agregar un div a la escena
const dots = DotItems;
const dotList = [];
//crear cada dot
dots.forEach((element) => {
  //esfera de la primera pantalla
  const guid = new Mesh(
    new SphereGeometry(0.4, 8, 6),
    new MeshBasicMaterial({ color: "green" })
  );

  const item = new CSS3DObject(element);

  const _scale = (1.2 / Size.x) * 8;
  item.scale.set(_scale, _scale, _scale);

  dotList.push(item);

  DOM_SCENE.add(item);
  WEB_SCENE.add(guid);
});

console.log(CAM_MANAGER.container.position);

posicionarVectoresEnCirculo(new Vector3(), 2.4, dotList);

//render scene
const clock = new Clock();
let mouse = new Vector3();
let aux = true;

function render() {
  const time = clock.getElapsedTime();
  particleSystem.updateTime(time);

  WEB_SCENE.render();
  DOM_SCENE.render();
  console.log("renderizando");

  TWEEN.update();
  if (goToSecond) {
    if (aux) {
      console.log("Activar camara");
      aux = false;
      animatePosition(2200, CAM_MANAGER.container, new Vector3(0, 1, 2));
    }
  }

  CAM_MANAGER.camera.position.lerp(mouse, 0.01);
  CAM_MANAGER.camera.lookAt(new Vector3(0, 0, 0));
}
WEB_SCENE.setRenderLoop(render);

function posicionarVectoresEnCirculo(vectorCentral, radio, items) {
  const anguloEntreVectores = (2 * Math.PI) / items.length;

  for (let i = 0; i < items.length; i++) {
    const actual = items[i];
    const angulo = i * anguloEntreVectores;
    actual.position.x = radio * Math.cos(angulo);
    actual.position.y = radio * Math.sin(angulo);
    actual.position.z = 0; // Mantener la misma coordenada z
  }
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function GUID() {
  // Crear una instancia de dat.GUI
  const gui = new dat.GUI();

  // Crear un objeto para almacenar los parámetros
  const params = {
    positionX: homeSphere.position.x,
    positionY: homeSphere.position.y,
    positionZ: homeSphere.position.z,
  };

  // Agregar controles a dat.GUI para modificar la posición del objeto
  gui.add(params, "positionX", -50, 50).onChange(updatePosition);
  gui.add(params, "positionY", -50, 50).onChange(updatePosition);
  gui.add(params, "positionZ", -50, 50).onChange(updatePosition);
}

function updatePosition() {
  homeSphere.position.set(params.positionX, params.positionY, params.positionZ);
}

// Función para animar la posición de un objeto
function animatePosition(duration, objectToAnimate, targetPosition) {
  const initialPosition = objectToAnimate.position.clone(); // Copia la posición inicial del objeto

  // Crea un nuevo tween para la animación
  const tween = new TWEEN.Tween(initialPosition)
    .to(targetPosition, duration) // Establece la posición final y la duración de la animación
    .easing(TWEEN.Easing.Sinusoidal.Out) // Aplica "ease-in"
    .onUpdate(() => {
      // Callback que se ejecuta en cada fotograma de la animación
      // Actualiza la posición del objeto con los valores interpolados
      objectToAnimate.position.copy(initialPosition);
    })
    .start(); // Inicia la animación

  // Agrega la animación al grupo de animaciones de Tween.js
  TWEEN.add(tween);
}

function getNormalizedMousePosition(event) {
  // Obtén las coordenadas del mouse relativas al tamaño del viewport
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1; // Valor entre -1 y 1
  const mouseY = (event.clientY / window.innerHeight) * -2 + 1; // Valor entre -1 y 1 (invertido para que sea coherente con la coordenada Y en Three.js)

  return { x: mouseX, y: mouseY };
}

// Ejemplo de cómo usar la función con un evento de ratón
window.addEventListener("mousemove", (event) => {
  const normalizedMousePos = getNormalizedMousePosition(event);
  console.log("Mouse X:", normalizedMousePos.x);
  console.log("Mouse Y:", normalizedMousePos.y);
  mouse.set(normalizedMousePos.x, normalizedMousePos.y, 0);
});
