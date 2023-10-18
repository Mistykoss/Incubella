import { ACESFilmicToneMapping, SRGBColorSpace, WebGLRenderer } from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'

class RendererManager {
  constructor() {
    //size
    this.size = {
      x: window.innerWidth,
      y: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
    };
    //rederers
    this.web3DRenderer = new WebGLRenderer();
    this.web3DRenderer.setSize(this.size.x, this.size.y);

    this.web3DRenderComposer = null;
    this.web3DRenderPass = null;

    this.webHtmlRenderer = new CSS3DRenderer();
    this.webHtmlRenderer.setSize(this.size.x, this.size.y);

    this.domElement = null;

    //scenes
    this._web3DScene = null;
    this._webHtmlScene = null;

    //container reference
    this.containeRef = document.body;
  }
  debug() {
    console.log("Ready: ", this.web3D, "\nReady: ", this.webHtml);
  }

  debugScenes() {
    console.log(
      "_________________________________\nScene Enviroment:\n",
      this._web3DScene.children
    );
  }

  initRenderer(type, scene) {
    let renderer = null;

    if (type === "3D") {
      renderer = this.web3DRenderer;
      this._web3DScene = scene;

      ///configuracones adicionales para 3d
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;

      this.web3DRenderComposer = new EffectComposer(renderer);
    }
    if (type == "HTML") {
      renderer = this.webHtmlRenderer;
      this._webHtmlScene = scene;

      //setup renderers to DOM
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = 0;
      renderer.domElement.id = "renderer";
      renderer.domElement.classList.add("renderer");

      //elemento del DOM agregado a la raiz
      this.domElement = renderer.domElement;
    }

    //agregar el elemento al DOM
    this.containeRef.appendChild(renderer.domElement);
    //console.log("Render [", type, "] OK\n", renderer);
  }
}

//crear instancia unica del renderer
const RenderManager = new RendererManager();
export { RenderManager };
