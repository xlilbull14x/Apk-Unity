/**
 * VR Creator Engine - Main Entry Point
 */
import { SceneManager } from './sceneManager.js';
import { VRControllerSystem } from './vrController.js';

export class VREngine {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.initThree();
        this.sceneManager = new SceneManager(this.scene);
        this.vrController = new VRControllerSystem(this.renderer, this.scene);
        
        this.setupEventListeners();
    }

    initThree() {
        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.xr.enabled = true; // Enable WebXR VR support

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 5);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        // Ground Grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x007acc, 0x333333);
        this.scene.add(gridHelper);
    }

    startRenderLoop() {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.renderer.render(this.scene, this.camera);
        });
    }

    update() {
        // Update controllers, animations, or active physics loops per tick
        if (this.vrController) {
            this.vrController.update();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }
}

// Automatically boot engine if canvas is present on DOM load
window.addEventListener('DOMContentLoaded', () => {
    const canvasEl = document.getElementById('render-canvas');
    if (canvasEl) {
        window.appEngine = new VREngine(canvasEl);
        window.appEngine.startRenderLoop();
    }
});
