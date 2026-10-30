/**
 * Physics System - Manages Gravity, RigidBody Collisions, and Velocities
 */
export class PhysicsSystem {
    constructor() {
        this.bodies = [];
        this.gravity = -9.81;
    }

    registerBody(mesh, options = { mass: 1, isStatic: false }) {
        const physicsBody = {
            mesh: mesh,
            mass: options.isStatic ? 0 : options.mass,
            isStatic: options.isStatic,
            velocity: new THREE.Vector3(0, 0, 0),
            forces: new THREE.Vector3(0, 0, 0)
        };
        
        this.bodies.push(physicsBody);
        return physicsBody;
    }

    applyForce(body, forceVector) {
        if (!body.isStatic) {
            body.velocity.add(forceVector.clone().divideScalar(body.mass));
        }
    }

    update(deltaTime) {
        for (let body of this.bodies) {
            if (body.isStatic) continue;

            // Apply gravity if falling
            body.velocity.y += this.gravity * deltaTime;

            // Update mesh position based on velocity
            body.mesh.position.addScaledVector(body.velocity, deltaTime);

            // Simple floor collision check (Y = 0 plane)
            if (body.mesh.position.y < 0.5) {
                body.mesh.position.y = 0.5;
                body.velocity.y = -body.velocity.y * 0.2; // Bounce damping loss
                body.velocity.x *= 0.9; // Surface friction drag
                body.velocity.z *= 0.9;
            }
        }
    }
}
