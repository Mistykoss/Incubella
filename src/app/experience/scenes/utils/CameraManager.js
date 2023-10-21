import { Group, PerspectiveCamera, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";


const mouseData = {
  screenWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, // Ancho de la pantalla
  screenHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight, // Alto de la pantalla
  fixedValue: 0.5,
  intensity: 80,
  x: null, // Última posición X del mouse
  y: null, // Última posición Y del mouse
};



export class CameraManager {
  constructor(camera) {
    //componentes del modulo
    this.camera = camera; // referenccia de la camara
    this.container = new Group(); //contenedor de la camara
    this.distance = 8;
    this.domElement = null;
    this.orbitControls = null;
    this.normalizedMouse = new Vector3();


    // this.rendererManager = new RENDER_MANAGER();
    //inicializar camara
    this.init();
  }
  //configurar valores por defecto para esta camara
  init() {
    //posicion dentro del contenedor por defecto
    this.camera.position.set(0, 0, 0);
    //agregar la camara al contenedor
    this.container.add(this.camera);
    //posicion del contenedor por defecto
    this.container.position.set(0, 0, 35);
  }

  activeOrbit(){
    this.orbitControls = new OrbitControls(this.camera, this.domElement);
  }

  update(){
    this.normalizedMouse.set( mouseData.x, -mouseData.y, 0);
    this.activeParallax();
  }
  activeParallax(){
    this.camera.position.lerp(this.normalizedMouse, 0.009);
  }
}




window.addEventListener("mousemove", (event)=>{

  const mouseX = event.clientX; // Posición X actual del mouse
  const mouseY = event.clientY; // Posición Y actual del mouse

  mouseData.x = (mouseX / mouseData.screenWidth - mouseData.fixedValue) * mouseData.intensity; // Valor normalizado de la posición X
  mouseData.y = (mouseY / mouseData.screenHeight - mouseData.fixedValue) * mouseData.intensity; // Valor normalizado de la posición Y


})
