import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const portoTexture = textureLoader.load("/textures/porto-square.png");
const hackingTexture = textureLoader.load(
  "/textures/hacking-for-good-square.png"
);
const machineTexture = textureLoader.load("/textures/machine-square.png");
const freestyleTexture = textureLoader.load(
  "/textures/404-freestyle-square.png"
);
const boredkidsTexture = textureLoader.load("/textures/boredkids-square.png");
const metamorphoseTexture = textureLoader.load(
  "/textures/metamorphose-square.png"
);

const PROJECTS_SETUP = [
  {
    texture: hackingTexture,
    initialPosition: { x: -1.4, y: 1.4 },
  },
  {
    texture: freestyleTexture,
    initialPosition: { x: 0, y: 1.4 },
  },
  {
    texture: portoTexture,
    initialPosition: { x: 0, y: 0 },
  },
  {
    texture: metamorphoseTexture,
    initialPosition: { x: 1.4, y: 0 },
  },
  {
    texture: machineTexture,
    initialPosition: { x: -1.4, y: -1.4 },
  },
  {
    texture: boredkidsTexture,
    initialPosition: { x: 1.4, y: -1.4 },
  },
];
/**
 * Test mesh
 */
// Geometry
let objectsToTest = [];

const geometry = new THREE.PlaneGeometry(1, 1, 16, 16);

// Material
const material = new THREE.MeshBasicMaterial({
  transparent: true,
});

PROJECTS_SETUP.forEach((project, i) => {
  let mesh;
  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: project.texture, transparent: true })
  );
  mesh.position.set(project.initialPosition.x, project.initialPosition.y);
  scene.add(mesh);
  objectsToTest.push(mesh);
});

gui.add(objectsToTest[0].position, "x").step(0.001).name("x");
gui.add(objectsToTest[0].position, "y").step(0.001).name("y");
gui.add(objectsToTest[0].position, "z").step(0.001).name("z");
gui.add(objectsToTest[0].scale, "x").step(0.001).name("ScaleX");
gui.add(objectsToTest[0].scale, "y").step(0.001).name("ScaleY");
gui.add(objectsToTest[0].scale, "z").step(0.001).name("ScaleZ");
gui
  .add(objectsToTest[0].material, "opacity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("opacity");

const raycaster = new THREE.Raycaster();

let currentlyFocused = { mesh: null, index: null };
let gridView = true;
let lastClickTime = 0;

//On click zoom animation
document.addEventListener("click", (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -((event.clientY / sizes.height) * 2 - 1);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objectsToTest);
  if (intersects.length && Date.now() - lastClickTime > 1000) {
    if (gridView) {
      objectsToTest.forEach((mesh, i) => {
        if (mesh === intersects[0].object) {
          const newMesh = new THREE.Mesh(
            geometry,
            intersects[0].object.material.clone()
          );
          newMesh.position.x = PROJECTS_SETUP[i].initialPosition.x;
          newMesh.position.y = PROJECTS_SETUP[i].initialPosition.y;
          newMesh.position.z = 0.1;
          scene.add(newMesh);
          mesh.material.opacity = 0.5;
          currentlyFocused.mesh = newMesh;
          currentlyFocused.index = i;

          gsap.to(newMesh.position, {
            duration: 1,
            ease: "power2.inOut",
            x: "2",
            y: "0",
          });
          gsap.to(newMesh.scale, {
            duration: 1,
            ease: "power2.inOut",
            x: "4",
            y: "4",
          });
        }
        gsap.to(mesh.position, {
          duration: 1,
          ease: "power2.inOut",
          x: mesh.position.x * 0.5 + 1.4 - 5 * aspectRatio,
          y: mesh.position.y * 0.5 + 1.4 - 5,
        });
        gsap.to(mesh.scale, {
          duration: 1,
          ease: "power2.inOut",
          x: "0.5",
          y: "0.5",
        });
      });
      gridView = false;
    } else if (intersects[0].object !== objectsToTest[currentlyFocused.index]) {
      const intersectedIndex = objectsToTest.indexOf(intersects[0].object);
      currentlyFocused.mesh.position.z = 0;
      gsap.to(objectsToTest[currentlyFocused.index].material, {
        duration: 1,
        ease: "power2.inOut",
        opacity: 1,
      });
      gsap.to(objectsToTest[intersectedIndex].material, {
        duration: 1,
        ease: "power2.inOut",
        opacity: 0.5,
      });
      gsap.to(currentlyFocused.mesh.material, {
        duration: 1,
        ease: "power2.inOut",
        opacity: 0,
      });
      gsap
        .to(currentlyFocused.mesh.scale, {
          duration: 1,
          ease: "power2.inOut",
          x: 0,
          y: 0,
          // x: 1.75,
          // y: 1.75,
        })
        .eventCallback("onComplete", () => {
          currentlyFocused.mesh.geometry.dispose();
          currentlyFocused.mesh.material.dispose();
          scene.remove(currentlyFocused.mesh);
          currentlyFocused.mesh = mesh;
          currentlyFocused.index = intersectedIndex;
        });
      const mesh = new THREE.Mesh(
        geometry,
        objectsToTest[intersectedIndex].material.clone()
      );
      mesh.material.opacity = 0;
      mesh.scale.set(4, 4, 1);

      mesh.position.x =
        (PROJECTS_SETUP[intersectedIndex].initialPosition.x -
          PROJECTS_SETUP[currentlyFocused.index].initialPosition.x) *
          4 *
          1.5 +
        2;
      mesh.position.y =
        (PROJECTS_SETUP[intersectedIndex].initialPosition.y -
          PROJECTS_SETUP[currentlyFocused.index].initialPosition.y) *
        4 *
        1.5;
      mesh.position.z = 0.1;
      scene.add(mesh);
      gsap.to(mesh.position, {
        duration: 1,
        ease: "power2.inOut",
        x: "2",
        y: "0",
      });
      gsap.to(mesh.material, {
        duration: 1,
        ease: "power2.inOut",
        opacity: 1,
      });
    }
    lastClickTime = Date.now();
  }
});

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

  aspectRatio = sizes.width / sizes.height;

  if (!gridView) {
    objectsToTest.forEach((mesh) => {
      mesh.position.x =
        PROJECTS_SETUP[objectsToTest.indexOf(mesh)].initialPosition.x * 0.5 +
        1.4 -
        5 * aspectRatio;
    });
  }

  // Update camera
  camera.left = -5 * aspectRatio;
  camera.right = 5 * aspectRatio;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
let aspectRatio = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  -5 * aspectRatio,
  5 * aspectRatio,
  5,
  -5,
  0.1,
  100
);
camera.position.set(0, 0, 3);
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

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
