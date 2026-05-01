import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useScroll, Float } from '@react-three/drei';
import * as THREE from 'three';

export function Model() {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/icon.glb');
    const scroll = useScroll();

    useFrame((state, delta) => {
        if (!group.current) return;

        // Scroll progress (0 to 1)
        const r1 = scroll.range(0, 1);

        // Smooth rotation based on scroll
        // Base rotation + scroll influence
        // Adding continuous slow rotation
        group.current.rotation.y = THREE.MathUtils.damp(
            group.current.rotation.y,
            -r1 * Math.PI * 2 + state.clock.elapsedTime * 0.2, // Spin and scroll rotate
            4,
            delta
        );

        // Subtle tilt based on scroll
        group.current.rotation.x = THREE.MathUtils.damp(
            group.current.rotation.x,
            r1 * 0.5,
            4,
            delta
        );

        // Zoom out effect on scroll (Simplified)
        const scale = 1.3 - r1 * 0.2;
        group.current.scale.setScalar(
            THREE.MathUtils.damp(group.current.scale.x, scale, 4, delta)
        );

        // Float movement (Start higher, move down)
        group.current.position.y = THREE.MathUtils.damp(
            group.current.position.y,
            0.5 - r1 * 3, // Start at y=0.5, move down
            4,
            delta
        );
    });

    return (
        <Float
            speed={2} // Animation speed
            rotationIntensity={0.5} // XYZ rotation intensity
            floatIntensity={0.5} // Up/down float intensity
            floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within
        >
            <group ref={group} dispose={null}>
                <primitive
                    object={scene}
                    position={[0, 0, 0]}
                />
            </group>
        </Float>
    );
}

// Preload the model
useGLTF.preload('/icon.glb');
