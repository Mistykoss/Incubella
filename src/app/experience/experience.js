import { Size } from './utils/WindowHandler'
import {CameraManager} from './utils/CameraManager'
import {WebScene, DomScene} from './utils/SceneManager'

import { DomElement } from './utils/DomElement'
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, SphereGeometry } from 'three'


//configurar camara
const _camera = new PerspectiveCamera(45, Size.ratio, 0.1, 1000);
const CAM_MANAGER = new CameraManager(_camera);
//crear una nueva escena
const WEB_SCENE = new WebScene(CAM_MANAGER);
const DOM_SCENE = new DomScene(CAM_MANAGER);
DOM_SCENE.useOrbitControls();

  //esfera de la primera pantalla
  const homeSphere = new Mesh(
    new SphereGeometry(1, 24, 12),
    new MeshBasicMaterial({ color: "red", wireframe: true })
  );

//agregarlo
WEB_SCENE.add(homeSphere);


//agregar un div a la escena
const sHeaderComponent = document.createElement("div");
sHeaderComponent.innerHTML = 'Member only';
sHeaderComponent.classList.add("sub-header");

const domSubHeader = new DomElement(sHeaderComponent);

//agregar el contenido  a la escena
DOM_SCENE.add(domSubHeader._element);


//render scene
function render(){
    
    WEB_SCENE.render();
    DOM_SCENE.render();  
    console.log("renderizando");   
}
WEB_SCENE.setRenderLoop(render);