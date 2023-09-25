import { SRGBColorSpace, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Size } from "./WindowHandler";

//super clase
class SceneManager {
  constructor(cameraHandler) {
    this._scene = new Scene();
    this._camera = cameraHandler.camera;
    this._cameraContainer = cameraHandler.container;
    this.domElement = null;
    this._orbitControls = null;
  }

  //hacer uso de orbit o
  useOrbitControls() {
    //activar controles
    console.log("Controls [OrbitControls] listo!");
    console.log(this._camera, this.domElement);
    this._orbitControls = new OrbitControls(this._camera, this.domElement);
  }
  //setup function
  setupRenderer(renderer, size) {
    //configurar resolucion del render
    renderer.setSize(size.x, size.y);
  }
  setupDomElement(renderer){
    //agregar el render a la pagina
    this.domElement = renderer.domElement;
    document.body.appendChild(renderer.domElement);
  }

  //agregar elemento a la escena
  add(element) {
    this._scene.add(element);
  }

  //renderizar esta escena
  render() {
    //renderiza la escena
    this.renderer.render(this._scene, this._camera);
  }

  //activar loop de renderizado
  setRenderLoop(render) {
    //renderizar
    this.renderer.setAnimationLoop(render);
  }
}
//clase de web scene 3d
class WebScene extends SceneManager {
  constructor(cameraHandler) {
    super(cameraHandler);
    this.renderer = new WebGLRenderer();
    //inicializar renderer
    this.setupRenderer(this.renderer, Size);
    this.setupDomElement(this.renderer);
    this.init();
    ///
  }
  //init scene
  init() {
    //agrega la camara en la escena 3d
    this.add(this._cameraContainer);
    console.log("ESCENA [3D] LISTA!");
    
  }
}
//clase de html elements
class DomScene extends SceneManager {
  constructor(cameraHandler) {
    super(cameraHandler);
    this.renderer = new CSS3DRenderer();
    //inicializar renderer
    this.setupRenderer(this.renderer, Size);
    //iniciaizar controles

    ///
    console.log("ESCENA [HTML] LISTA!");
  }
  //configurar renderer css3d
  setupRenderer(renderer, size) {
    //llamar a la funcion base
    super.setupRenderer(renderer, size);
    //configurar opciones de CSS3DRENDER
    //setup renderers to DOM
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = 0;
  
    //configurar el domElement
    this.setupDomElement(renderer);
  }
}

export { WebScene, DomScene };
