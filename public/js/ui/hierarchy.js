/**
 * UI Hierarchy Manager - Manages Scene Tree View & Node Selection
 */
export class HierarchyUI {
    constructor() {
        this.treeContainer = document.getElementById('hierarchy-tree');
        this.setupListeners();
    }

    setupListeners() {
        // Listen for selection changes from the engine
        window.addEventListener('objectSelected', (e) => {
            this.highlightNodeByName(e.detail.name);
        });
    }

    refreshTree(sceneObjects) {
        if (!this.treeContainer) return;
        // Rebuild or update DOM list elements based on current scene state
        console.log("Refreshing hierarchy tree with items:", sceneObjects);
    }

    highlightNodeByName(name) {
        const items = this.treeContainer.querySelectorAll('.tree-item');
        items.forEach(item => {
            if (item.textContent.trim() === name) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}
