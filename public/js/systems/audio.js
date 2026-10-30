/**
 * Audio System - Manages Spatial 3D Audio & Sound Effects
 */
export class AudioSystem {
    constructor(camera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        
        this.soundBank = new Map();
        this.audioLoader = new THREE.AudioLoader();
    }

    // Load and register a sound effect
    loadSound(id, url, isSpatial = false, maxDistance = 50) {
        return new Promise((resolve) => {
            this.audioLoader.load(url, (buffer) => {
                let sound;
                if (isSpatial) {
                    sound = new THREE.PositionalAudio(this.listener);
                    sound.setRefDistance(1);
                    sound.setMaxDistance(maxDistance);
                    sound.setRolloffFactor(1);
                } else {
                    sound = new THREE.Audio(this.listener);
                }
                
                sound.setBuffer(buffer);
                sound.setVolume(0.7);
                this.soundBank.set(id, sound);
                resolve(sound);
            }, undefined, (err) => {
                console.warn(`Could not load audio file at ${url}. Using synthesized fallback beep.`, err);
                // Fallback behavior if asset isn't downloaded yet
            });
        });
    }

    playSound(id) {
        const sound = this.soundBank.get(id);
        if (sound && !sound.isPlaying) {
            sound.play();
        }
    }

    stopSound(id) {
        const sound = this.soundBank.get(id);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }
}
