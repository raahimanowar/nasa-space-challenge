"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { Space_Mono } from 'next/font/google';

// Space-themed font
const spaceMono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
});

// Define the types for our game objects
interface Bullet {
    id: string;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    scale: number;
    distance: number;
}

interface Asteroid {
    id: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
    speed: number;
}

// Counter for generating unique IDs
let idCounter = 0;
const generateUniqueId = () => `${Date.now()}_${idCounter++}`;

// Earth Model Component
const EarthScene: React.FC = () => {
    const { scene: earthScene } = useGLTF('/models/earth.glb');
    const earthRef = useRef<THREE.Group>(null!);

    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group>
            <primitive
                ref={earthRef}
                object={earthScene}
                position={[0, -70, 0]}
                scale={335}
                castShadow
                receiveShadow
            />
        </group>
    );
};

// Bullet Model Component with Trail
const Bullet: React.FC<{ position: THREE.Vector3; scale: number }> = ({ position, scale }) => {
    return (
        <Trail width={0.5} length={5} color="#ff4400" attenuation={(t) => t * t}>
            <mesh position={position.toArray()}>
                <cylinderGeometry args={[0.4, 0.4, 1.2, 12]} />
                <meshStandardMaterial
                    color="#ff4400"
                    emissive="#ff8800"
                    emissiveIntensity={2}
                    transparent
                    opacity={Math.min(scale + 0.2, 1)}
                />
                <pointLight color="#ff4400" intensity={2 * scale} distance={4} />
                <group scale={scale}>
                    <mesh>
                        <cylinderGeometry args={[0.2, 0.2, 1.4, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                </group>
            </mesh>
        </Trail>
    );
};

// Spaceship Component
interface SpaceshipModelProps {
    bullets: Bullet[];
    setBullets: React.Dispatch<React.SetStateAction<Bullet[]>>;
    gameOver: boolean;
    position: THREE.Vector3;
}

const SpaceshipModel: React.FC<SpaceshipModelProps> = ({ bullets, setBullets, gameOver, position }) => {
    const { scene: shipScene } = useGLTF('/models/spaceship.glb');
    const shipRef = useRef<THREE.Group>(null!);
    const [shipPosition, setPosition] = useState({ x: 0, y: -11, z: 0 });
    const speed = 0.5;
    const lastShot = useRef<number>(0);

    type KeyState = {
        ArrowLeft: boolean;
        ArrowRight: boolean;
        Space: boolean;
    };

    const [keys, setKeys] = useState<KeyState>({
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,
    });
    
    // Mobile touch controls state
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.code === 'Space') {
                setKeys(prev => ({ ...prev, [e.code === 'Space' ? 'Space' : e.key]: true }));
                if (e.code === 'Space' && Date.now() - lastShot.current > 200) {
                    lastShot.current = Date.now();
                    const bulletPosition = new THREE.Vector3(
                        shipPosition.x,
                        shipPosition.y + 1.5,
                        shipPosition.z - 10
                    );
                    const bulletVelocity = new THREE.Vector3(0, 0, -0.3);
                    setBullets(prev => [...prev, {
                        id: generateUniqueId(),
                        position: bulletPosition,
                        velocity: bulletVelocity,
                        scale: 2,
                        distance: 0,
                    }]);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.code === 'Space') {
                setKeys(prev => ({ ...prev, [e.code === 'Space' ? 'Space' : e.key]: false }));
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (gameOver) return;
            e.preventDefault();
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (gameOver || !touchStartRef.current) return;
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartRef.current.x;
            const screenWidth = window.innerWidth;
            const worldWidth = 50; 
            const moveAmount = (deltaX / screenWidth) * worldWidth;
            
            setPosition(prev => ({
                ...prev,
                x: Math.min(Math.max(prev.x + moveAmount, -25), 25),
            }));
            touchStartRef.current.x = touchX;
        };

        const handleTouchEnd = () => {
            if (gameOver) return;
            if (Date.now() - lastShot.current > 200) {
                lastShot.current = Date.now();
                const bulletPosition = new THREE.Vector3(
                    shipPosition.x,
                    shipPosition.y + 1.5,
                    shipPosition.z - 10
                );
                const bulletVelocity = new THREE.Vector3(0, 0, -0.3);
                setBullets(prev => [...prev, {
                    id: generateUniqueId(),
                    position: bulletPosition,
                    velocity: bulletVelocity,
                    scale: 2,
                    distance: 0,
                }]);
            }
            touchStartRef.current = null;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [shipPosition, setBullets, gameOver]);

    useFrame(() => {
        if (gameOver) return;
        if (keys.ArrowLeft) {
            setPosition(prev => ({
                ...prev,
                x: Math.max(prev.x - speed, -25),
            }));
        }
        if (keys.ArrowRight) {
            setPosition(prev => ({
                ...prev,
                x: Math.min(prev.x + speed, 25),
            }));
        }

        setBullets(prev => {
            const updated = prev
                .map(bullet => {
                    const newDistance = bullet.distance + bullet.velocity.length();
                    const newScale = Math.max(1.5 - (newDistance / 50), 0.1);
                    return {
                        ...bullet,
                        position: bullet.position.add(bullet.velocity.clone()),
                        distance: newDistance,
                        scale: newScale,
                    };
                })
                .filter(bullet => bullet.scale > 0.1);
            return updated;
        });
    });

    useEffect(() => {
        position.set(shipPosition.x, shipPosition.y, shipPosition.z);
    }, [shipPosition, position]);

    return (
        <group>
            <primitive
                ref={shipRef}
                object={shipScene}
                position={[shipPosition.x, shipPosition.y, shipPosition.z]}
                rotation={[0.2, Math.PI, 0]}
                scale={0.03}
                castShadow
            />
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    scale={bullet.scale}
                />
            ))}
        </group>
    );
};

// Star Background Component
const StarBackground = () => {
    const count = 5000;
    const [positions] = useState(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        return positions;
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ffffff"
                sizeAttenuation
                transparent
                opacity={0.8}
            />
        </points>
    );
};

// Asteroid Field Component
interface AsteroidFieldProps {
    asteroids: Asteroid[];
    setAsteroids: React.Dispatch<React.SetStateAction<Asteroid[]>>;
    gameOver: boolean;
}

const AsteroidField: React.FC<AsteroidFieldProps> = ({ asteroids, setAsteroids, gameOver }) => {
    const spawnInterval = useRef<NodeJS.Timeout | null>(null);
    const { scene } = useGLTF('/models/Desertboulder.glb');

    const spawnAsteroid = () => {
        const randomX = (Math.random() - 0.5) * 50;
        const randomY = -15 + Math.random() * 10;
        const z = -200;
        const randomScale = 1.5 + Math.random() * 1.5;
        const randomSpeed = 0.08 + Math.random() * 0.12;
        const newAsteroid: Asteroid = {
            id: generateUniqueId(),
            position: new THREE.Vector3(randomX, randomY, z),
            rotation: new THREE.Euler(0, 0, 0),
            scale: randomScale,
            speed: randomSpeed,
        };
        setAsteroids(prev => [...prev, newAsteroid]);
    };

    useEffect(() => {
        spawnAsteroid();
        if (!gameOver) {
            spawnInterval.current = setInterval(spawnAsteroid, 2000 + Math.random() * 2000);
        }
        return () => {
            if (spawnInterval.current) {
                clearInterval(spawnInterval.current);
            }
        };
    }, [gameOver, setAsteroids ]);

    useFrame(() => {
        if (gameOver) return;
        setAsteroids(prev => {
            const updated = prev
                .map(asteroid => ({
                    ...asteroid,
                    position: new THREE.Vector3(
                        asteroid.position.x,
                        asteroid.position.y,
                        asteroid.position.z + asteroid.speed
                    ),
                    scale: asteroid.scale + 0.0005,
                    rotation: asteroid.rotation,
                }))
                .filter(asteroid => asteroid.position.z < 50);
            return updated;
        });
    });

    return (
        <group>
            {asteroids.map(asteroid => (
                <AsteroidModel
                    key={asteroid.id}
                    position={asteroid.position}
                    rotation={asteroid.rotation}
                    scale={asteroid.scale}
                />
            ))}
        </group>
    );
};

// Asteroid Model Component
const AsteroidModel: React.FC<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
}> = ({ position, rotation, scale }) => {
    const { scene } = useGLTF('/models/Desertboulder.glb');
    const modelRef = useRef<THREE.Group>(null);
    const clonedScene = useRef(scene.clone());

    useFrame(() => {
        if (modelRef.current) {
            modelRef.current.rotation.x += 0.01 * Math.random();
            modelRef.current.rotation.y += 0.01 * Math.random();
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={clonedScene.current}
            position={position}
            rotation={rotation}
            scale={scale}
            castShadow
        />
    );
};

// Main Scene Component with Collision Detection
interface SceneProps {
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    gameOver: boolean;
}

const Scene: React.FC<SceneProps> = ({ setScore, setGameOver, gameOver }) => {
    const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const earthPosition = new THREE.Vector3(0, -65, 0);
    const earthRadius = 50;
    const shipPosition = new THREE.Vector3(0, -10, 0);
    const shipRadius = 1;
    const startTime = useRef(Date.now());

    useFrame(() => {
        if (Date.now() - startTime.current < 2000) return;

        const hitAsteroidIds = new Set<string>();
        const hitBulletIds = new Set<string>();

        bullets.forEach(bullet => {
            asteroids.forEach(asteroid => {
                const distance = bullet.position.distanceTo(asteroid.position);
                if (distance < asteroid.scale * 1.5) {
                    hitAsteroidIds.add(asteroid.id);
                    hitBulletIds.add(bullet.id);
                    setScore(prev => prev + 100);
                }
            });
        });

        asteroids.forEach(asteroid => {
            const distanceToEarth = asteroid.position.distanceTo(earthPosition);
            if (distanceToEarth < earthRadius + asteroid.scale && !gameOver) {
                console.log('Game Over: Asteroid hit Earth');
                setGameOver(true);
            }
        });

        asteroids.forEach(asteroid => {
            const distanceToShip = asteroid.position.distanceTo(shipPosition);
            if (distanceToShip < shipRadius + asteroid.scale) {
                console.log('Game Over: Asteroid hit Spaceship');
                setGameOver(true);
            }
        });

        if (hitAsteroidIds.size > 0 || hitBulletIds.size > 0) {
            setAsteroids(prevAsteroids => prevAsteroids.filter(a => !hitAsteroidIds.has(a.id)));
            setBullets(prevBullets => prevBullets.filter(b => !hitBulletIds.has(b.id)));
        }
    });

    return (
        <>
            <color attach="background" args={['#000000']} />
            <StarBackground />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 10]} intensity={1.0} castShadow />
            <pointLight position={[100, 100, 100]} intensity={2} castShadow color="#ffd700" />
            <EarthScene />
            <AsteroidField asteroids={asteroids} setAsteroids={setAsteroids} gameOver={gameOver} />
            <SpaceshipModel bullets={bullets} setBullets={setBullets} gameOver={gameOver} position={shipPosition} />
            <fog attach="fog" args={['#000', 20, 100]} />
        </>
    );
};

// Main Game Component
const Game: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const [started, setStarted] = useState<boolean>(false);
    const router = useRouter();

    // Handle chunk load errors
    useEffect(() => {
        const handleChunkLoadError = () => {
            console.error('Chunk load error detected, reloading page...');
            window.location.reload();
        };

        window.addEventListener('error', (event) => {
            if (event.message.includes('Loading chunk')) {
                handleChunkLoadError();
            }
        });

        return () => {
            window.removeEventListener('error', handleChunkLoadError);
        };
    }, []);

    const handleStart = () => {
        setStarted(true);
        setResetKey(prev => prev + 1);
        idCounter = 0;
    };

    const handleRestart = () => {
        setScore(0);
        setGameOver(false);
        setResetKey(prev => prev + 1);
        idCounter = 0;
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    if (!started) {
        return (
            <div
                className={spaceMono.className}
                style={{
                    position: 'relative',
                    width: '100vw',
                    height: '100vh',
                    background: 'radial-gradient(circle, #1a1a2e, #000000)', // Space-like gradient
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                }}
            >
                <h1 style={{ fontSize: '48px', marginBottom: '20px', textShadow: '0 0 10px #ff4400' }}>
                    Meteor Strike
                </h1>
                <p style={{ fontSize: '24px', maxWidth: '600px', marginBottom: '40px' }}>
                    Defend Earth from incoming asteroids! Use <strong>Arrow Keys</strong> to move your spaceship and <strong>Spacebar</strong> to shoot.
                </p>
                <button
                    style={{
                        padding: '15px 30px',
                        fontSize: '24px',
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #ff4400, #ff8800)',
                        color: '#fff',
                        border: '2px solid #ff4400',
                        borderRadius: '10px',
                        boxShadow: '0 0 15px #ff4400',
                        transition: 'transform 0.2s',
                    }}
                    onClick={handleStart}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className={spaceMono.className} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            {/* Back to Home Button */}
            <button
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '10px 20px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    background: 'linear-gradient(45deg, #ff4400, #ff8800)',
                    color: '#fff',
                    border: '2px solid #ff4400',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px #ff4400',
                    zIndex: 1000,
                    transition: 'transform 0.2s',
                }}
                onClick={handleBackToHome}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                Back to Home
            </button>

            {/* Score Display */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    color: '#fff',
                    fontSize: '24px',
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.5)',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: '1px solid #ff4400',
                    boxShadow: '0 0 5px #ff4400',
                }}
            >
                Score: {score}
            </div>

            {/* Game Over Screen */}
            {gameOver && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: '48px',
                        zIndex: 1000,
                        background: 'rgba(0,0,0,0.7)',
                        padding: '20px 40px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        border: '2px solid #ff4400',
                        boxShadow: '0 0 20px #ff4400',
                    }}
                >
                    <div>Game Over</div>
                    <div style={{ fontSize: '24px', marginTop: '20px' }}>
                        Final Score: {score}
                    </div>
                    <button
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            background: 'linear-gradient(45deg, #ff4400, #ff8800)',
                            color: '#fff',
                            border: '2px solid #ff4400',
                            borderRadius: '5px',
                            boxShadow: '0 0 10px #ff4400',
                            transition: 'transform 0.2s',
                        }}
                        onClick={handleRestart}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        Restart Game
                    </button>
                </div>
            )}
            <Canvas
                shadows
                camera={{
                    position: [0, 0, 30],
                    fov: 75,
                    near: 0.1,
                    far: 1000,
                }}
                style={{ height: '100vh' }}
            >
                <Scene key={resetKey} setScore={setScore} setGameOver={setGameOver} gameOver={gameOver} />
            </Canvas>
        </div>
    );
};

useGLTF.preload('/models/earth.glb');
useGLTF.preload('/models/spaceship.glb');
useGLTF.preload('/models/Desertboulder.glb');

export default Game;