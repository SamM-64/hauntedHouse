import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

//FPS
javascript: (function () {
  var script = document.createElement("script");
  script.onload = function () {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
  document.head.appendChild(script);
})();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//Models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

gltfLoader.load("/models/hauntedHouse4/scene.gltf", (gltf) => {
  {
    gltf.scene.position.set(0, 0, 4);
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    scene.add(gltf.scene);
  }
});

gltfLoader.load("/animate/ghost1/scene.gltf", (gltf) => {
  {
    gltf.scene.position.set(-2, 4.2, -2);
    gltf.scene.scale.set(0.005, 0.005, 0.005);
    scene.add(gltf.scene);
  }
});
gltfLoader.load("/animate/moon/scene.gltf", (gltf) => {
  {
    gltf.scene.position.set(3, 5, -6);
    gltf.scene.scale.set(1.5, 1.5, 1.5);
    scene.add(gltf.scene);
  }
});

let mixer2 = null;
gltfLoader.load("/animate/zombie/scene.gltf", (gltf) => {
  {
    mixer2 = new THREE.AnimationMixer(gltf.scene);
    const action = mixer2.clipAction(gltf.animations[0]);

    action.play();
    gltf.scene.rotateY(1.2, 1, 1.5);
    gltf.scene.position.set(-7, -0.6, 0.5);
    gltf.scene.scale.set(0.9, 0.9, 0.9);
    scene.add(gltf.scene);
  }
});
gltfLoader.load("/animate/wolf_with_animations/scene.gltf", (gltf) => {
  {
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[3]);

    action.play();
    gltf.scene.rotateY(1.2, 1, 1.5);
    gltf.scene.position.set(2, 0.4, 3);
    gltf.scene.scale.set(1.5, 1.5, 1.5);
    scene.add(gltf.scene);
  }
});

//Fog
const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * House
 */
// Group
const house = new THREE.Group();
scene.add(house);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 1, 3);

scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#0xfffff", 1);
moonLight.position.set(0, 1, 0);
scene.add(moonLight);

// Door
const doorLight = new THREE.PointLight("#ff7d46", 3, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#262837");

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //Update mixer
  if (mixer !== null) {
    mixer.update(deltaTime);
  }
  if (mixer2 !== null) {
    mixer2.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
