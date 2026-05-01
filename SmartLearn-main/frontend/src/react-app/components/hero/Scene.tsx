import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ScrollControls, ContactShadows } from '@react-three/drei';
import { Model } from './Model';

export function Scene() {
    return (
        <div className="h-[600px] w-full lg:h-[800px] relative">
            <Canvas
                shadows
                dpr={[1, 2]} // Adaptive DPR
                camera={{ position: [0, 8, 14], fov: 25 }}
                gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
                className="w-full h-full"
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <spotLight
                        position={[10, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={1}
                        castShadow
                    />

                    {/* Environment for realistic reflections */}
                    <Environment preset="city" />

                    {/* Scroll Controls envelope the model */}
                    <ScrollControls pages={0} damping={0.2} style={{ top: '10px', left: '0px', bottom: '10px', right: '10px', width: 'auto', height: 'auto', animation: 'none' }}>
                        <Model />
                    </ScrollControls>

                    {/* Soft Shadow */}
                    <ContactShadows
                        position={[0, -2.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4.5}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
