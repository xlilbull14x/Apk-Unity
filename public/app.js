// --- 1. THREE.JS ENGINE SETUP ---
const container = document.getElementById('viewport-container');
const canvas = document.getElementById('canvas-3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);
scene.fog = new THREE.FogExp2(0x121212, 0.025);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

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

// Lighting & Environment
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const grid = new THREE.GridHelper(20, 20, 0x007acc, 0x262626);
grid.position.y = -0.01;
scene.add(grid);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- 2. SCENE OBJECTS & STATE ---
let sceneObjects = [];
let selectedObject = null;
let isPlaying = false;
let globalSpeedMultiplier = 1.0;

function addPrimitive(type) {
    let mesh;
    let mat = new THREE.MeshStandardMaterial({ color: 0x007acc, roughness: 0.3 });

    if (type === 'cube') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mat);
        mesh.name = "Modded_Cube_" + (sceneObjects.length + 1);
    } else if (type === 'sphere') {
        mat.color.setHex(0xf59e0b);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), mat);
        mesh.name = "Energy_Orb_" + (sceneObjects.length + 1);
    } else if (type === 'weapon') {
        mat.color.setHex(0x60a5fa);
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.8), mat);
        mesh.name = "VR_Blaster_" + (sceneObjects.length + 1);
    }

    mesh.position.set((Math.random() - 0.5) * 3, 1, (Math.random() - 0.5) * 3);
    mesh.castShadow = true;
    mesh.userData = { grabbable: true, physics: 'Dynamic', hp: 100 };

    scene.add(mesh);
    sceneObjects.push(mesh);
    updateHierarchy();
    selectObject(mesh);
}

function updateHierarchy() {
    const list = document.getElementById('hierarchy-list');
    list.innerHTML = '';
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
    const intersects = raycaster.intersectObjects(sceneObjects);
    if (intersects.length > 0) selectObject(intersects[0].object);
});

// --- 3. SERVER API APK UPLOAD HANDLER ---
async function uploadAPK(event) {
    const file = event.target.files[0];
    if (!file) return;

    const logBox = document.getElementById('apk-status-log');
    logBox.innerHTML = `<p style="color:#f59e0b;">⏳ Uploading & decompiling ${file.name} to server...</p>`;

    const formData = new FormData();
    formData.append('apkFile', file);

    try {
        const response = await fetch('/api/upload-apk', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            logBox.innerHTML = `
                <p style="color:#4ade80;">✔ ${result.message}</p>
                <p style="color:#aaa; font-size:10px;">File: ${result.data.filename} (${result.data.sizeMB} MB)</p>
                <p style="color:#aaa; font-size:10px;">Assets Extracted: ${result.data.extractedAssets.length} files</p>
            `;
            addPrimitive('cube');
            sceneObjects[sceneObjects.length - 1].name = result.data.filename.replace('.apk', '') + "_Prefab";
            updateHierarchy();
        } else {
            logBox.innerHTML = `<p style="color:#ef4444;">❌ Error: ${result.message}</p>`;
        }
    } catch (err) {
        logBox.innerHTML = `<p style="color:#ef4444;">❌ Network connection error.</p>`;
    }
}

// --- 4. MOVABLE VR CHEAT MENU LOGIC ---
const menu = document.getElementById('vr-mod-menu');
const header = document.getElementById('menu-drag-handle');
let isDraggingMenu = false, startX, startY;

header.onmousedown = (e) => {
    isDraggingMenu = true;
    startX = e.clientX - menu.offsetLeft;
    startY = e.clientY - menu.offsetTop;
    e.preventDefault();
};

window.onmousemove = (e) => {
    if (!isDraggingMenu) return;
    menu.style.left = (e.clientX - startX) + 'px';
    menu.style.top = (e.clientY - startY) + 'px';
    menu.style.right = 'auto';
};

window.onmouseup = () => { isDraggingMenu = false; };

function toggleMenuCollapse() {
    const body = document.getElementById('menu-body');
    body.style.display = body.style.display === 'none' ? 'flex' : 'none';
}

function updateModToggles() {
    const is2x = document.getElementById('mod-speed').checked;
    globalSpeedMultiplier = is2x ? 2.0 : 1.0;
}

// --- 5. TABS & INSPECTOR ---
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (tabName === 'hierarchy') {
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.getElementById('hierarchy-list').style.display = 'block';
        document.getElementById('apk-panel').style.display = 'none';
    } else {
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.getElementById('hierarchy-list').style.display = 'none';
        document.getElementById('apk-panel').style.display = 'flex';
    }
}

function updateInspector() {
    const container = document.getElementById('inspector-content');
    if (!selectedObject) {
        container.innerHTML = `<p style="color: #777; text-align: center; margin-top: 20px;">Select an object in the viewport or hierarchy.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="prop-section">
            <h4>Object Properties</h4>
            <div class="prop-row">
                <span>Name</span>
                <input type="text" value="${selectedObject.name}" onchange="selectedObject.name = this.value; updateHierarchy();">
            </div>
        </div>
        <div class="prop-section">
            <h4>Transform</h4>
            <div class="prop-row">
                <span>Position X</span>
                <input type="number" step="0.1" value="${selectedObject.position.x.toFixed(2)}" onchange="selectedObject.position.x = parseFloat(this.value)">
            </div>
            <div class="prop-row">
                <span>Position Y</span>
                <input type="number" step="0.1" value="${selectedObject.position.y.toFixed(2)}" onchange="selectedObject.position.y = parseFloat(this.value)">
            </div>
        </div>
    `;
}

function togglePlayMode() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-btn');
    if (isPlaying) {
        btn.innerText = "⏹ Stop Simulation";
        btn.style.background = "#d9534f";
        transformControls.detach();
    } else {
        btn.innerText = "▶ Test Simulation";
        btn.style.background = "var(--accent)";
        if (selectedObject) transformControls.attach(selectedObject);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize default object
addPrimitive('cube');

// Main Render Loop
renderer.setAnimationLoop(() => {
    if (isPlaying) {
        sceneObjects.forEach((obj) => {
            obj.rotation.y += 0.02 * globalSpeedMultiplier;
        });
    }
    renderer.render(scene, camera);
});
