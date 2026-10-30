/**
 * Scene Manager - Tracks Game Objects, Hierarchy, and Properties
 */
export class SceneManager {
    constructor(threeScene) {
        this.scene = threeScene;
        this.objects = new Map();
        this.selectedObject = null;

        // Create a default initial cube
        this.spawnPrimitive('cube', { x: 0, y: 0.5, z: 0 }, '#007acc', 'Grabbable_Cube_01');
    }

    spawnPrimitive(type, position = {x:0, y:0.5, z:0}, color = '#ff5533', name = 'New_Object') {
        let geometry;
        if (type === 'cube') geometry = new THREE.BoxGeometry(1, 1, 1);
        else if (type === 'sphere') geometry = new THREE.SphereGeometry(0.7, 32, 32);
        else geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);

        const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(position.x, position.y, position.z);
        mesh.name = name;
        
        this.scene.add(mesh);
        this.objects.set(mesh.uuid, mesh);
        this.selectObject(mesh);

        return mesh;
    }

    selectObject(mesh) {
        this.selectedObject = mesh;
        console.log(`Selected object in scene: ${mesh.name}`);
        // Dispatch UI update event if needed
        window.dispatchEvent(new CustomEvent('objectSelected', { detail: mesh }));
    }

    removeObject(uuid) {
        const obj = this.objects.get(uuid);
        if (obj) {
            this.scene.remove(obj);
            this.objects.delete(uuid);
            if (this.selectedObject === obj) this.selectedObject = null;
        }
    }
}
