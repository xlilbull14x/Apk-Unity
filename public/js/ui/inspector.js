/**
 * UI Inspector Manager - Property Editor Synchronization
 */
export class InspectorUI {
    constructor() {
        this.initInputs();
        this.activeTarget = null;

        window.addEventListener('objectSelected', (e) => {
            this.inspect(e.detail);
        });
    }

    initInputs() {
        this.nameInput = document.querySelector('#property-editor input[type="text"]');
        this.colorInput = document.querySelector('#property-editor input[type="color"]');

        if (this.nameInput) {
            this.nameInput.addEventListener('input', (e) => {
                if (this.activeTarget) {
                    this.activeTarget.name = e.target.value;
                }
            });
        }

        if (this.colorInput) {
            this.colorInput.addEventListener('input', (e) => {
                if (this.activeTarget && this.activeTarget.material) {
                    this.activeTarget.material.color.set(e.target.value);
                }
            });
        }
    }

    inspect(mesh) {
        this.activeTarget = mesh;
        if (this.nameInput) this.nameInput.value = mesh.name;
        if (this.colorInput && mesh.material && mesh.material.color) {
            this.colorInput.value = '#' + mesh.material.color.getHexString();
        }
    }
}
