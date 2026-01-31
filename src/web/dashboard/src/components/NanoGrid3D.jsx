import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Optimized Agent Component
function Agent({ pos, type, status, state, onClick, isSelected }) {
    // Map simulation coords (0-50) to scene coords (-25 to 25)
    const position = [pos[0] - 25, pos[1] - 25, pos[2] - 25];

    const meshRef = useRef();

    // Color Mapping
    const color = useMemo(() => {
        if (type === 'bot') return '#0ea5e9'; // Sky Blue
        if (status === 'cancer') return '#f43f5e'; // Rose Red
        if (status === 'repair') return '#f59e0b'; // Amber
        return '#10b981'; // Emerald Green
    }, [type, status]);

    // Size Mapping
    const scale = type === 'bot' ? 1.0 : (status === 'cancer' ? 1.2 : 0.8);

    // Highlight Selection
    const emissiveIntensity = isSelected ? 2.0 : 0.5;

    useFrame((state, delta) => {
        if (status === 'cancer') {
            // Pulsing Effect
            meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 3) * 0.2);
        }
    });

    if (type === "station") {
        return (
            <group position={position}>
                <mesh>
                    <boxGeometry args={[3, 3, 3]} />
                    <meshStandardMaterial
                        color="#00ffcc"
                        emissive="#00ffcc"
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
                <pointLight color="#00ffcc" intensity={2} distance={10} />
            </group>
        )
    }

    return (
        <mesh ref={meshRef} position={position} scale={scale} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={type === 'bot' ? 1 : 0.8}
            />
            {type === 'bot' && state === 'ACTING' && (
                <pointLight color="#f59e0b" distance={5} intensity={5} />
            )}
        </mesh>
    );
}

function GridBox() {
    return (
        <gridHelper args={[50, 10, 0x1f2937, 0x1f2937]} position={[0, -25, 0]} />
    );
}

function Scene({ data, onSelect, selectedId }) {
    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />

            {/* Render Agents */}
            {data.agents && data.agents.map(agent => (
                <Agent
                    key={agent.id}
                    pos={agent.pos}
                    type={agent.type}
                    status={agent.status}
                    state={agent.state}
                    onClick={() => onSelect(agent)}
                    isSelected={selectedId === agent.id}
                />
            ))}

            <GridBox />

            {/* Bounding Box Wireframe */}
            <mesh>
                <boxGeometry args={[50, 50, 50]} />
                <meshBasicMaterial color="#334155" wireframe transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

export default function NanoGrid3D({ data, onSelect, selectedId }) {
    return (
        <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden relative">
            <Canvas camera={{ position: [40, 40, 40], fov: 50 }}>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <OrbitControls
                    autoRotate={false}
                    autoRotateSpeed={0.5}
                    enablePan={false}
                    minDistance={20}
                    maxDistance={100}
                />
                <Scene data={data} onSelect={onSelect} selectedId={selectedId} />
            </Canvas>

            <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-500 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Cancer
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> NanoBot
                </div>
                <div>Left Click: Rotate | Scroll: Zoom</div>
            </div>
        </div>
    )
}
