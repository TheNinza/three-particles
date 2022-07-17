import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import fragment from "./shaders/fragment.glsl?raw";
import vertex from "./shaders/vertex.glsl?raw";
import image from "./assets/image.jpg";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "gsap";

export default class Sketch {
  constructor(options) {
    this.settings = {
      distortion: 0,
      bloomThreshold: 0.0,
      bloomStrength: 0.0,
      bloomRadius: 0.0,
    };

    this.tl = gsap.timeline();

    this.isPlaying = false;
    this.lastAnimationFrame = null;

    this.time = 0;
    this.container = options.dom;
    this.scene = new THREE.Scene();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.001,
      5000
    );

    this.camera.position.z = 1500;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.addPost();
    this.addObjects();
    this.setupResize();
    this.render();
    this.resize();
    // this.addDatSettings();
    this.addTrigger();
  }

  handleClick() {
    console.log("click");
    if (this.isPlaying) return;

    this.isPlaying = true;

    this.tl
      .fromTo(
        this.settings,
        {
          distortion: 0,
          bloomStrength: 0,
        },
        {
          distortion: 1,
          bloomStrength: 1.72,
          duration: 2,
          ease: "power2.inOut",
        }
      )
      .to(this.settings, {
        distortion: 0,
        bloomStrength: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          this.isPlaying = false;
        },
      });
  }

  addTrigger() {
    this.container.addEventListener("click", this.handleClick.bind(this));
  }

  addPost() {
    this.renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.bloomPass.threshold = this.settings.bloomThreshold;
    this.bloomPass.strength = this.settings.bloomStrength;
    this.bloomPass.radius = this.settings.bloomRadius;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);
  }

  addDatSettings() {
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "distortion", 0, 1, 0.01);
    this.gui.add(this.settings, "bloomThreshold", 0.0, 1.0, 0.01);
    this.gui.add(this.settings, "bloomStrength", 0.0, 10.0, 0.01);
    this.gui.add(this.settings, "bloomRadius", 0.0, 1.0, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.composer.setSize(this.width, this.height);

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.geometry = new THREE.PlaneBufferGeometry(
      640 * 1.5,
      960 * 1.5,
      640,
      960
    );

    // this.material = new THREE.MeshNormalMaterial();
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,
      // wireframe: true,
      uniforms: {
        time: {
          value: 0,
          type: "f",
        },
        distortion: {
          value: 0,
          type: "f",
        },
        imageTexture: {
          value: new THREE.TextureLoader().load(image),
          type: "t",
        },
      },
    });
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  render() {
    this.time += 0.05;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.distortion.value = this.settings.distortion;
    this.bloomPass.threshold = this.settings.bloomThreshold;
    this.bloomPass.strength = this.settings.bloomStrength;
    this.bloomPass.radius = this.settings.bloomRadius;

    this.renderer.render(this.scene, this.camera);

    this.lastAnimationFrame = window.requestAnimationFrame(
      this.render.bind(this)
    );
    this.composer.render();
  }
}
