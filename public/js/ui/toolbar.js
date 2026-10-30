/**
 * UI Toolbar Manager - Editor Tool Modes & Action Triggers
 */
export class ToolbarUI {
    constructor() {
        this.initToolButtons();
        this.initActionButtons();
    }

    initToolButtons() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                console.log(`Editor tool switched to: ${btn.textContent}`);
            });
        });
    }

    initActionButtons() {
        const playBtn = document.getElementById('btn-play');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                console.log("Entering Play / VR Test Mode...");
                // Hook up WebXR session request here if desired
                if (window.appEngine && window.appEngine.renderer.xr) {
                    // Toggle VR session logic
                }
            });
        }

        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                console.log("Exporting project package bundle...");
            });
        }
    }
}
