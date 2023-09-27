import { Group, PerspectiveCamera } from "three";
import { Size } from "./WindowHandler";

export class CameraManager{
    constructor(camera){
        //componentes del modulo
        this.camera = camera; // referenccia de la camara
        this.container = new Group(); //contenedor de la camara
        this.distance = 8;
        //inicializar camara
        this.init();
    }
        //configurar valores por defecto para esta camara
        init(){
            //posicion dentro del contenedor por defecto
            this.camera.position.set(0,0, 0);
            //agregar la camara al contenedor 
            this.container.add(this.camera);
             //posicion del contenedor por defecto
            this.container.position.set(0,0,8);
            console.log("[CAMARA] LISTA");
        }
}