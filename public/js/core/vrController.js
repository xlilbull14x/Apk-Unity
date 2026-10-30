/**
 * VR Controller System - Handles WebXR Hand Controllers & Interactions
 */
export class VRControllerSystem {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.controllers = [];
        
        this.initVRControllers();
    }

    initVRControllers() {
        if (!this.renderer.xr) return;

        // Setup controller grips and target rays
        for (let i = 0; i < 2; i++) {
            const controller = this.renderer.xr.getController(i);
            
            controller.addEventListener('selectstart', (e) => this.onSelectStart(e));
            controller.addEventListener('selectend', (e) => this.onSelectEnd(e));
            
            this.scene.add(controller);
            this.controllers.push(controller);

            // Optional visual controller ray / pointer line
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -5)
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x007acc });
            const line = new THREE.Line(geometry, material);
            controller.add(line);
        }
    }

    onSelectStart(event) {
        const controller = event.target;
        // Trigger grab / interaction logic here
        console.log('VR Controller trigger pressed down', controller);
    }

    onSelectEnd(event) {
        const controller = event.target;
        // Release grabbed object logic here
        console.log('VR Controller trigger released', controller);
    }

    update() {
        // Per-frame controller tracking logic can go here
    }
}
