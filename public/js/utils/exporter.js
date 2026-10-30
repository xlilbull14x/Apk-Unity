/**
 * Project Exporter Utility - Packages Scene Data and Scripts for Download
 */
export class ProjectExporter {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    exportProjectToJSON() {
        const sceneData = {
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            objects: []
        };

        if (this.sceneManager && this.sceneManager.objects) {
            this.sceneManager.objects.forEach((mesh, uuid) => {
                sceneData.objects.push({
                    uuid: uuid,
                    name: mesh.name,
                    type: mesh.geometry.type,
                    position: [mesh.position.x, mesh.position.y, mesh.position.z],
                    rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                    scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
                    color: mesh.material && mesh.material.color ? '#' + mesh.material.color.getHexString() : '#ffffff'
                });
            });
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sceneData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "vr_game_creator_project.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        console.log("Project successfully exported to JSON file.");
    }
}
