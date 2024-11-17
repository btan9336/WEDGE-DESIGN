// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load wireframe model
const loader = new THREE.OBJLoader();
const wireframeUrls = ['models/wireframe1.obj'];

let model;
loader.load(wireframeUrls[0], function (object) {
  // Center the object in the middle of the screen
  object.position.set(0, 0, 0);  // Position at the origin
  object.scale.set(0.15, 0.15, 0.15);  // Scale down to 15%

  // Apply flat shading
  object.traverse(function(child) {
    if (child.isMesh) {
      child.material.flatShading = true;  // Apply flat shading to mesh
      child.material.needsUpdate = true;  // Update material to reflect the changes
    }
  });

  // No shadow
  object.castShadow = false;
  object.receiveShadow = false;

  scene.add(object);
  model = object;
});

// Set up strong lighting (no shadows)
const light = new THREE.AmbientLight(0xffffff, 2); // Strong ambient light
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Strong directional light
directionalLight.position.set(1, 1, 1).normalize();
directionalLight.castShadow = false;  // Disable shadows for the light
scene.add(directionalLight);

// Camera positioning
camera.position.z = 5;

// Handle device orientation (level)
let alpha = 0, beta = 0, gamma = 0;

window.addEventListener('deviceorientation', function(event) {
  // Get orientation angles (in degrees)
  alpha = event.alpha;  // rotation around Z-axis
  beta = event.beta;    // rotation around X-axis
  gamma = event.gamma;  // rotation around Y-axis

  // Update model rotation based on device orientation
  if (model) {
    model.rotation.x = THREE.MathUtils.degToRad(beta);  // Convert degrees to radians
    model.rotation.y = THREE.MathUtils.degToRad(gamma); // Convert degrees to radians
    model.rotation.z = THREE.MathUtils.degToRad(alpha); // Convert degrees to radians
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Slow self-rotation
  if (model) {
    model.rotation.x += 0.001; // Slow self-rotation on the X-axis
    model.rotation.y += 0.001; // Slow self-rotation on the Y-axis
    model.rotation.z += 0.001; // Slow self-rotation on the Z-axis
  }

  renderer.render(scene, camera);
}
animate();

// Window resize handling
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


