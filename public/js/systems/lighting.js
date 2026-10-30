/**
 * Lighting System - Manages Sun, Ambient, and Dynamic Point Lights
 */
export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = {
            ambient: null,
            sun: null,
            points: []
        };
        
        this.initDefaultLighting();
    }

    initDefaultLighting() {
        // Soft ambient base light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.lights.ambient);

        // Directional Sun Light with Shadows
        this.lights.sun = new THREE.DirectionalLight(0xfff5e6, 0.9);
        this.lights.sun.position.set(10, 20, 10);
        this.lights.sun.castShadow = true;
        
        // Configure shadow properties
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 50;
        
        const d = 15;
        this.lights.sun.shadow.camera.left = -d;
        this.lights.sun.shadow.camera.right = d;
        this.lights.sun.shadow.camera.top = d;
        this.lights.sun.shadow.camera.bottom = -d;
        
        this.scene.add(this.lights.sun);
    }

    addPointLight(color = 0x007acc, intensity = 1, position = {x: 0, y: 2, z: 0}, distance = 10) {
        const pointLight = new THREE.PointLight(color, intensity, distance);
        pointLight.position.set(position.x, position.y, position.z);
        
        this.scene.add(pointLight);
        this.lights.points.push(pointLight);
        return pointLight;
    }

    setDayPreset() {
        this.scene.background.setHex(0x111111);
        this.lights.sun.color.setHex(0xfff5e6);
        this.lights.sun.intensity = 0.9;
        this.lights.ambient.intensity = 0.5;
    }

    setNightPreset() {
        this.scene.background.setHex(0x050508);
        this.lights.sun.color.setHex(0x3b82f6);
        this.lights.sun.intensity = 0.2;
        this.lights.ambient.intensity = 0.15;
    }
}
