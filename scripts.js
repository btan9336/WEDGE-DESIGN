let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let objects = [];
let wireframeObjects = [];
let currentIntersectedObject = null;
let lastClickedObject = null;
let hoveredObject = null;

let lastInteractionTime = Date.now();
let cameraDefaultPosition = new THREE.Vector3(0, 0, 50); // Default camera position
let frustumSize = 100; // Adjust to your needs
let initialMousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const maxMoveDistance = 10; // Maximum allowable distance in pixels

let isDragging = false;
let mouseDownPosition = new THREE.Vector2();
let dragStartPosition = new THREE.Vector2();
let hoveredFaceIndex = -1; // Track which face is currently hovered
const faceTexts = ["EPOCH 01", "SAND AS A MATERIAL", "CATALOGUE", "GALLERY", "CONTACT"]; // The template texts
let exploreLink = document.getElementById("explore-link"); // Get the explore-link element
let cornerInfo = document.querySelector(".corner-info"); // Get the corner-info element
let isTextChanging = false; // To prevent rapid text changes

// Text for corner-info for each face
const faceInfoTexts = [
    "This collection is inspired by discarded and neglected  furniture found throughout London. These formerly functional objects, now deteriorated due to time and disuse, serve as the foundation for a design exploration that connects historical and contemporary elements.",
    "Binder jetting is a 3D printing process that creates solid objects by layering a liquid binding agent on a powder bed, offering energy efficiency and compatibility with materials like quartz sand, metal, and ceramics. Using quartz sand, we produced durable, uniquely textured pieces suitable for both indoor and outdoor environments.",
    "Here, you can download detailed information about our products.",
    "Experience a virtual tour through our gallery, showcasing images of our products along with their stories and inspirations.",
    "Please do not hesitate to get in touch if you are interested in making a purchase, discussing collaboration opportunities, or simply wish to say hello."
];

function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Set to transparent background
    document.body.appendChild(renderer.domElement);

    camera = new THREE.OrthographicCamera(
        -frustumSize / 2, frustumSize / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 1000
    );
    camera.position.copy(cameraDefaultPosition);
    camera.lookAt(scene.position);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    let loader = new THREE.OBJLoader();
    const objUrls = ['models/face1.obj', 'models/face2.obj', 'models/face3.obj', 'models/face4.obj', 'models/face5.obj'];
    const wireframeUrls = ['models/wireframe1.obj'];
    const links = ['./epoch01/index.html', './sandAsMaterial/index.html', './catalogue/index.html', './gallery/index.html', './contactPage/index.html'];

    objUrls.forEach((url, index) => {
        loader.load(url, (object) => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    const wireframeMaterial = new THREE.MeshBasicMaterial({
                        color: 0x000DFF, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0
                    });

                    const fillMaterial = new THREE.MeshStandardMaterial({
                        color: 0x000DFF,// Changed to blue
                        transparent: true,
                        opacity: 0
                    });

                    child.material = fillMaterial;

                    const wireframe = new THREE.WireframeGeometry(child.geometry);
                    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
                    wireframeMesh.position.copy(child.position);
                    wireframeMesh.rotation.copy(child.rotation);
                    wireframeMesh.scale.copy(child.scale);

                    scene.add(wireframeMesh);
                    child.userData.wireframeMesh = wireframeMesh;
                }
            });
            object.position.set(0, 0, 0);
            object.userData = { url: links[index] };
            objects.push(object);
            scene.add(object);
        });
    });

    wireframeUrls.forEach((url) => {
        loader.load(url, (object) => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                }
            });
            wireframeObjects.push(object);
            scene.add(object);
        });
    });
    
// Event Listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);

    fitToScreen();
}

function fitToScreen() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 1.8;
    camera.right = frustumSize * aspect / 1.8;
    camera.top = frustumSize / 1.8;
    camera.bottom = -frustumSize / 1.8;
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    fitToScreen();
}

// Mouse down event handler
function onMouseDown(event) {
    lastInteractionTime = Date.now();
    if (hoveredObject) {
        lastClickedObject = hoveredObject;
        initialMousePosition = { x: event.clientX, y: event.clientY };
        isDragging = false;
    }
}

// Mouse up event handler
function onMouseUp(event) {
    if (!isDragging && lastClickedObject && hoveredObject === lastClickedObject) {
        const dx = event.clientX - initialMousePosition.x;
        const dy = event.clientY - initialMousePosition.y;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);

        if (distanceMoved <= maxMoveDistance) {
            window.location.href = lastClickedObject.userData.url;
        }
    }
    lastClickedObject = null;
    isDragging = false;
}


function onMouseMove(event) {
    lastInteractionTime = Date.now();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects, true);

    currentIntersectedObject = null;
    objects.forEach(object => {
        object.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.opacity = 0;
                if (child.userData.wireframeMesh) {
                    child.userData.wireframeMesh.material.opacity = 0;
                }
            }
        });
    });

    
    if (intersects.length > 0) {
        currentIntersectedObject = intersects[0].object;
        currentIntersectedObject.material.opacity = 1;
        if (currentIntersectedObject.userData.wireframeMesh) {
            currentIntersectedObject.userData.wireframeMesh.material.opacity = 1;
        }
        document.body.style.cursor = "pointer";

        // Determine which face is being hovered
        let index = objects.indexOf(currentIntersectedObject.parent);
        if (index !== hoveredFaceIndex && !isTextChanging) {
            hoveredFaceIndex = index;
            changeExploreLinkText(faceTexts[hoveredFaceIndex]); // Update explore-link
            changeCornerInfoText(faceInfoTexts[hoveredFaceIndex]); // Update corner-info
        }
    } else {
        document.body.style.cursor = "default";
        if (hoveredFaceIndex !== -1 && !isTextChanging) {
            hoveredFaceIndex = -1;
            changeExploreLinkText("Interact to explore");
            changeCornerInfoText("At WEDGE, we embrace the concept of the Grassmann product from differential geometry—building higher-dimensional objects by expanding existing ones—as our guiding philosophy to pioneer a new era in interior design through innovative technology integration.");
        }
    }

    if (isDragging && currentIntersectedObject) {
        const deltaX = event.clientX - dragStartPosition.x;
        const deltaY = event.clientY - dragStartPosition.y;

        currentIntersectedObject.rotation.y += deltaX * 0.005;
        currentIntersectedObject.rotation.x += deltaY * 0.005;

        dragStartPosition.set(event.clientX, event.clientY);
    }
}

// Function to change the explore-link text with a faster fade effect
function changeExploreLinkText(newText) {
    isTextChanging = true;

    // Fade out the text first
    exploreLink.classList.add("fade-out");

    // Wait for the fade out to complete, then change the text and fade it back in
    setTimeout(() => {
        exploreLink.textContent = newText;
        exploreLink.classList.remove("fade-out");
        exploreLink.classList.add("fade-in");

        // Wait for the fade in to complete, then allow further changes
        setTimeout(() => {
            exploreLink.classList.remove("fade-in");
            isTextChanging = false;
        }, 200); // Match the faster transition duration (0.2s)
    }, 200); // Match the faster transition duration (0.2s)
}

// Function to change the corner-info text with a fade effect
function changeCornerInfoText(newText) {
    isTextChanging = true;

    // Fade out the corner-info first
    cornerInfo.classList.add("fade-out");

    // Wait for the fade out to complete, then change the text and fade it back in
    setTimeout(() => {
        cornerInfo.textContent = newText;
        cornerInfo.classList.remove("fade-out");
        cornerInfo.classList.add("fade-in");

        // Wait for the fade in to complete, then allow further changes
        setTimeout(() => {
            cornerInfo.classList.remove("fade-in");
            isTextChanging = false;
        }, 10); // Match the faster transition duration (0.2s)
    }, 150); // Match the faster transition duration (0.2s)
}

function onMouseClick(event) {
    lastInteractionTime = Date.now();

    if (currentIntersectedObject && !isDragging) {
        lastClickedObject = currentIntersectedObject;
        setTimeout(() => {
            if (lastClickedObject) {
                window.location.href = lastClickedObject.parent.userData.url;
                lastClickedObject = null;
            }
        }, 0);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate both mesh and wireframe together
    objects.forEach(object => {
        if (object.userData.wireframeMesh) {
            object.userData.wireframeMesh.rotation.copy(object.rotation); // Keep mesh and wireframe in sync
        }
    });

    controls.update();
    renderer.render(scene, camera);
}


init();
animate();

