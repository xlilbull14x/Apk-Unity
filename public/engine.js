// --- 1. THREE.JS ENGINE SETUP ---
const container = document.getElementById('viewport-container');
const canvas = document.getElementById('canvas-3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.FogExp2(0x1a1a1a, 0.015);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 3, 6);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;

document.getElementById('vr-button-container').appendChild(VRButton.createButton(renderer));

const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.target.set(0, 1, 0);
orbitControls.update();

const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.size = 0.75;
scene.add(transformControls);

transformControls.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
});

// --- 2. LIGHTING & DRAGGABLE SUN SETUP ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 12, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// Visual Sun Representation in the 3D world (selectable & draggable like Unity)
const sunGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(dirLight.position);
sunMesh.name = "☀️ Directional Sun Light";
scene.add(sunMesh);

// Grid & Ground
scene.add(new THREE.GridHelper(30, 30, 0x007acc, 0x262626));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- 3. OBJECT & PHYSICS MANAGEMENT ---
let sceneObjects = [];
let selectedObject = null;
let isPlaying = false;
let gameSettings = { movement: 'gorillatag', gravity: 9.8 };

// Automatically give every object physics and colliders by default
function spawnObject(type) {
    let mesh;
    let mat = new THREE.MeshStandardMaterial({ color: 0x007acc, roughness: 0.3 });

    if (type === 'cube') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat);
        mesh.name = "Box_" + (sceneObjects.length + 1);
    } else if (type === 'sphere') {
        mat.color.setHex(0xf59e0b);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), mat);
        mesh.name = "Sphere_" + (sceneObjects.length + 1);
    } else if (type === 'platform') {
        mat.color.setHex(0x10b981);
        mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 4), mat);
        mesh.name = "Platform_" + (sceneObjects.length + 1);
    }

    mesh.position.set((Math.random() - 0.5) * 4, 1.5, (Math.random() - 0.5) * 4);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Automatic Physics & Collider Data
    mesh.userData = {
        hasCollider: true,
        useGravity: true,
        velocity: new THREE.Vector3(0, 0, 0)
    };

    scene.add(mesh);
    sceneObjects.push(mesh);
    updateHierarchy();
    selectObject(mesh);
}

function updateHierarchy() {
    const list = document.getElementById('hierarchy-list');
    list.innerHTML = '';
    
    // Always include sun in hierarchy for easy lighting inspection
    const sunLi = document.createElement('li');
    sunLi.innerText = sunMesh.name;
    if (selectedObject === sunMesh) sunLi.classList.add('selected');
    sunLi.onclick = () => selectObject(sunMesh);
    list.appendChild(sunLi);

    sceneObjects.forEach(obj => {
        const li = document.createElement('li');
        li.innerText = obj.name;
        if (selectedObject === obj) li.classList.add('selected');
        li.onclick = () => selectObject(obj);
        list.appendChild(li);
    });
}

function selectObject(obj) {
    selectedObject = obj;
    if (obj) transformControls.attach(obj);
    else transformControls.detach();
    updateHierarchy();
    updateInspector();
}

// Mouse Selection Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (event.target !== canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const allItems = [sunMesh, ...sceneObjects];
    const intersects = raycaster.intersectObjects(allItems);
    if (intersects.length > 0) selectObject(intersects[0].object);
});

// --- 4. INSPECTOR & SUN LIGHT CONTROLS ---
function updateInspector() {
    const container = document.getElementById('inspector-content');
    if (!selectedObject) {
        container.innerHTML = `<p style="color: #777; text-align: center; margin-top: 20px;">Select an object or light source.</p>`;
        return;
    }

    if (selectedObject === sunMesh) {
        container.innerHTML = `
            <div class="prop-section">
                <h4>☀️ Sun Lighting (Directional)</h4>
                <div class="prop-row">
                    <span>Position X</span>
                    <input type="number" step="0.5" value="${sunMesh.position.x}" onchange="sunMesh.position.x = parseFloat(this.value); dirLight.position.copy(sunMesh.position)">
                </div>
                <div class="prop-row">
                    <span>Position Y (Height)</span>
                    <input type="number" step="0.5" value="${sunMesh.position.y}" onchange="sunMesh.position.y = parseFloat(this.value); dirLight.position.copy(sunMesh.position)">
                </div>
                <div class="prop-row">
                    <span>Light Intensity</span>
                    <input type="number" step="0.1" value="${dirLight.intensity}" onchange="dirLight.intensity = parseFloat(this.value)">
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="prop-section">
            <h4>Object Settings</h4>
            <div class="prop-row">
                <span>Name</span>
                <input type="text" value="${selectedObject.name}" onchange="selectedObject.name = this.value; updateHierarchy();">
            </div>
        </div>
        <div class="prop-section">
            <h4>Unity Physics & Colliders</h4>
            <div class="prop-row">
                <span>Box Collider</span>
                <input type="checkbox" ${selectedObject.userData.hasCollider ? 'checked' : ''} onchange="selectedObject.userData.hasCollider = this.checked">
            </div>
            <div class="prop-row">
                <span>Automatic Gravity</span>
                <input type="checkbox" ${selectedObject.userData.useGravity ? 'checked' : ''} onchange="selectedObject.userData.useGravity = this.checked">
            </div>
        </div>
    `;
}

// --- 5. GAME MOVEMENT WIZARD & TEST MODE ---
function openGameWizard() {
    document.getElementById('game-wizard-modal').style.display = 'flex';
}

function closeGameWizard() {
    document.getElementById('game-wizard-modal').style.display = 'none';
}

function launchGamePlayMode() {
    gameSettings.movement = document.getElementById('movement-style').value;
    gameSettings.gravity = parseFloat(document.getElementById('gravity-slider').value);
    closeGameWizard();

    isPlaying = true;
    transformControls.detach();
    document.getElementById('play-btn').innerText = "⏹ Stop Game Test";
    document.getElementById('play-btn').style.background = "#d9534f";
    
    // Position camera into VR player perspective
    camera.position.set(0, 1.7, 4);
    orbitControls.enabled = false;
}

// Toggle back from Play Mode to Editor Mode
document.getElementById('play-btn').onclick = () => {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('play-btn').innerText = "▶ Test Game & Movement";
        document.getElementById('play-btn').style.background = "var(--accent)";
        orbitControls.enabled = true;
        if (selectedObject) transformControls.attach(selectedObject);
    } else {
        openGameWizard();
    }
};

// --- 6. ASSET UPLOADER ---
async function uploadModel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.getElementById('upload-status');
    status.innerText = `Uploading ${file.name}...`;

    const formData = new FormData();
    formData.append('modelFile', file);

    const res = await fetch('/api/upload-model', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
        status.innerText = `✔ Successfully imported ${data.filename}!`;
        spawnObject('cube');
        sceneObjects[sceneObjects.length - 1].name = data.filename;
        updateHierarchy();
    } else {
        status.innerText = `❌ Upload failed.`;
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (tab === 'hierarchy') {
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.getElementById('hierarchy-list').style.display = 'block';
        document.getElementById('asset-panel').style.display = 'none';
    } else {
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.getElementById('hierarchy-list').style.display = 'none';
        document.getElementById('asset-panel').style.display = 'flex';
    }
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize scene with a default platform and cube
spawnObject('platform');
sceneObjects[0].position.set(0, 0, 0);
spawnObject('cube');

// Main Animation & Physics Loop
renderer.setAnimationLoop(() => {
    // If testing game mode, apply automatic gravity & movement simulation
    if (isPlaying) {
        sceneObjects.forEach(obj => {
            if (obj.userData.useGravity && obj.position.y > 0.4) {
                obj.userData.velocity.y -= (gameSettings.gravity * 0.001);
                obj.position.add(obj.userData.velocity);
                
                // Ground collision stop
                if (obj.position.y <= 0.4) {
                    obj.position.y = 0.4;
                    obj.userData.velocity.set(0, 0, 0);
                }
            }
        });

        // Simulate Gorilla Tag arm swing or joystick movement when testing in browser
        camera.position.z -= 0.02;
    }

    // Sync sun mesh position with directional light
    dirLight.position.copy(sunMesh.position);

    renderer.render(scene, camera);
});
