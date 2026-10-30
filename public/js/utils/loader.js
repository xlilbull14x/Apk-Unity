/**
 * Asset Loader Utility - Handles GLTF Models and Texture Loading
 */
export class AssetLoader {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.textureLoader = new THREE.TextureLoader();
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => resolve(texture),
                undefined,
                (error) => reject(console.error('Error loading texture:', error))
            );
        });
    }

    async importModel(fileUrl, objectName = 'Imported_Model') {
        // Placeholder wrapper for GLTFLoader / OBJLoader integration
        console.log(`Importing model from ${fileUrl} as ${objectName}`);
        // When using Three.js GLTFLoader, you would parse and add mesh to sceneManager here.
    }
}
