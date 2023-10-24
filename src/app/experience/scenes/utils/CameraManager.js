import { Group, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";

const mouseData = {
  screenWidth:
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth, // Ancho de la pantalla
  screenHeight:
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight, // Alto de la pantalla
  fixedValue: 0.5,
  intensity: 50,
  x: 0, // Última posición X del mouse
  y: 0, // Última posición Y del mouse
  mouse: new Vector2(),
  u_mouse: new Vector2(),
  raycaster: new Raycaster(),
  plane: null,
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
    this.mouseData = mouseData;
    this.raycaster = new Raycaster();
    this.plane = null;
    this.isPlane = false;

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

  activeOrbit() {
    this.orbitControls = new OrbitControls(this.container, this.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.rotateSpeed = 0.2;
    this.orbitControls.dampingFactor = 0.025;
    this.orbitControls.maxPolarAngle = Math.PI * 0.35;
    this.orbitControls.minPolarAngle = Math.PI * 0.21;

    //activar evento
    this.orbitControls.addEventListener("start", () => {
      const cortinas = document.getElementById("cortain").children;
      for (const cortina of cortinas) {
        cortina.classList.add("active-cortain");
      }
      console.log(cortinas)
    });

        //desactivar evento
        this.orbitControls.addEventListener("end", () => {
          const cortinas = document.getElementById("cortain").children;
          for (const cortina of cortinas) {
            cortina.classList.remove("active-cortain");
          }
          console.log(cortinas)
        });
  }

  update() {
    this.normalizedMouse.set(mouseData.x, -mouseData.y, 0);
    this.activeParallax();

    if (this.plane) {
      this.raycaster.setFromCamera(mouseData.u_mouse, this.camera);
      const intersected = this.raycaster.intersectObjects([this.plane]);

      if (intersected[0]) {
        const point = intersected[0].point;
        //console.log(point.x, point.z)
        mouseData.mouse.set(point.x, point.z);
      }
    }
  }
  activeParallax() {
    this.camera.position.lerp(this.normalizedMouse, 0.009);
  }
}

window.addEventListener("mousemove", (event) => {
  const mouseX = event.clientX; // Posición X actual del mouse
  const mouseY = event.clientY; // Posición Y actual del mouse
  const relativeX = mouseX / mouseData.screenWidth - mouseData.fixedValue;
  const relativeY = mouseY / mouseData.screenHeight - mouseData.fixedValue;

  mouseData.x = relativeX * mouseData.intensity; // Valor normalizado de la posición X
  mouseData.y = relativeY * mouseData.intensity; // Valor normalizado de la posición Y

  mouseData.u_mouse.set(relativeX * 2, -relativeY * 2);
});
