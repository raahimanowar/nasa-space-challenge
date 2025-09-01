"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { Space_Mono } from 'next/font/google';

const spaceMono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
});

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

let idCounter = 0;
const generateUniqueId = () => `${Date.now()}_${idCounter++}`;

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

const Bullet: React.FC<{ position: THREE.Vector3; scale: number; velocity: THREE.Vector3 }> = ({ position, scale, velocity }) => {
    const quaternion = useMemo(() => {
        const dir = velocity.clone().normalize();
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return quat;
    }, [velocity]);

    return (
        <Trail width={0.5} length={5} color="#ff4400" attenuation={(t) => t * t}>
            <mesh position={position.toArray()} quaternion={quaternion}>
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

interface EngineFlameProps {
    pitch: number;
    isThrusting: boolean;
    shipPosition: { x: number; y: number; z: number };
}

const EngineFlame: React.FC<EngineFlameProps> = ({ pitch, isThrusting, shipPosition }) => {
    const flameRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        if (flameRef.current) {
            flameRef.current.position.x = shipPosition.x;
            flameRef.current.position.y = shipPosition.y;
            const time = state.clock.getElapsedTime();
            const noise = Math.sin(time * 20) * 0.1 + 1;
            const scale = isThrusting ? 1.5 * noise : 0.5 * noise;
            flameRef.current.scale.set(scale, scale, scale);
            flameRef.current.position.z = 2 + Math.abs(pitch) * 20;
        }
    });

    return (
        <group ref={flameRef} position={[shipPosition.x, shipPosition.y, -2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.8, -10, 16]} />
                <meshBasicMaterial
                    color="#ff4400"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <pointLight color="#ff8800" intensity={3} distance={6} />
        </group>
    );
};

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
    const [pitch, setPitch] = useState(0.2);
    const [isThrusting, setIsThrusting] = useState(false);
    const [velocity, setVelocity] = useState({ x: 0, y: 0 });
    const speed = 0.5;
    const shipScale = 0.015;
    const lastShot = useRef<number>(0);
    const lastThrustTime = useRef<number>(0);

    type KeyState = {
        ArrowLeft: boolean;
        ArrowRight: boolean;
        ArrowUp: boolean;
        ArrowDown: boolean;
        Space: boolean;
    };

    const [keys, setKeys] = useState<KeyState>({
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
        Space: false,
    });

    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.code === 'Space') {
                setKeys(prev => ({ ...prev, [e.code === 'Space' ? 'Space' : e.key]: true }));
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    setIsThrusting(true);
                    lastThrustTime.current = Date.now();
                }
                if (e.code === 'Space' && Date.now() - lastShot.current > 200) {
                    lastShot.current = Date.now();
                    const localMuzzle = new THREE.Vector3(0, 1.5 / shipScale, 10 / shipScale);
                    const euler = new THREE.Euler(pitch, Math.PI, 0, 'XYZ');
                    const worldOffset = localMuzzle.clone().applyEuler(euler).multiplyScalar(shipScale);
                    const bulletPosition = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z).add(worldOffset);
                    const bulletVelocity = new THREE.Vector3(0, Math.sin(pitch) * 0.3, -Math.cos(pitch) * 0.3);
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
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.code === 'Space') {
                setKeys(prev => ({ ...prev, [e.code === 'Space' ? 'Space' : e.key]: false }));
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    setIsThrusting(false);
                }
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (gameOver) return;
            e.preventDefault();
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            setIsThrusting(true);
            lastThrustTime.current = Date.now();
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
                const localMuzzle = new THREE.Vector3(0, 1.5 / shipScale, 10 / shipScale);
                const euler = new THREE.Euler(pitch, Math.PI, 0, 'XYZ');
                const worldOffset = localMuzzle.clone().applyEuler(euler).multiplyScalar(shipScale);
                const bulletPosition = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z).add(worldOffset);
                const bulletVelocity = new THREE.Vector3(0, Math.sin(pitch) * 0.3, -Math.cos(pitch) * 0.3);
                setBullets(prev => [...prev, {
                    id: generateUniqueId(),
                    position: bulletPosition,
                    velocity: bulletVelocity,
                    scale: 2,
                    distance: 0,
                }]);
            }
            setIsThrusting(false);
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
    }, [shipPosition, setBullets, gameOver, pitch]);

    useFrame((state, delta) => {
        if (gameOver) return;

        const damping = 0.85;
        let newVelocityX = velocity.x * damping;
        const newVelocityY = velocity.y * damping;

        if (keys.ArrowLeft) {
            newVelocityX = Math.max(newVelocityX - speed * delta * 15, -speed * 1.5);
            setIsThrusting(true);
            lastThrustTime.current = Date.now();
        }
        if (keys.ArrowRight) {
            newVelocityX = Math.min(newVelocityX + speed * delta * 15, speed * 1.5);
            setIsThrusting(true);
            lastThrustTime.current = Date.now();
        }
        if (keys.ArrowUp) {
            setPitch(prev => Math.min(prev + 0.01 * delta * 30, 0.5));
            setIsThrusting(true);
            lastThrustTime.current = Date.now();
        }
        if (keys.ArrowDown) {
            setPitch(prev => Math.max(prev - 0.01 * delta * 30, -0.5));
            setIsThrusting(true);
            lastThrustTime.current = Date.now();
        }

        if (Date.now() - lastThrustTime.current > 100) {
            setIsThrusting(false);
        }

        setVelocity({ x: newVelocityX, y: newVelocityY });

        setPosition(prev => ({
            ...prev,
            x: Math.min(Math.max(prev.x + newVelocityX, -25), 25),
        }));

        const time = state.clock.getElapsedTime();
        const bobY = Math.sin(time * 2) * 0.05;

        if (shipRef.current) {
            shipRef.current.position.y = shipPosition.y + bobY;
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
                rotation={[pitch, Math.PI, 0]}
                scale={shipScale}
                castShadow
            />
            <EngineFlame
                pitch={pitch}
                isThrusting={isThrusting}
                shipPosition={shipPosition}
            />
            {bullets.map(bullet => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    scale={bullet.scale}
                    velocity={bullet.velocity}
                />
            ))}
        </group>
    );
};

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
    }, [gameOver, setAsteroids]);

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
        if (gameOver) return;

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
            if (distanceToShip < shipRadius + asteroid.scale && !gameOver) {
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

const Game: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const [started, setStarted] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleButtonDown = (key: string) => {
        if (gameOver) return;
        const event = new KeyboardEvent('keydown', { key, code: key === 'Space' ? 'Space' : key });
        window.dispatchEvent(event);
    };

    const handleButtonUp = (key: string) => {
        if (gameOver) return;
        const event = new KeyboardEvent('keyup', { key, code: key === 'Space' ? 'Space' : key });
        window.dispatchEvent(event);
    };

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
                    background: 'radial-gradient(circle, #1a1a2e, #000000)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, rgba(255, 68, 0, 0.2) 0%, transparent 70%)',
                    zIndex: 0,
                }} />

                <h1 style={{
                    fontSize: 'clamp(2rem, 8vw, 4rem)',
                    marginBottom: '1rem',
                    background: 'linear-gradient(45deg, #ff8800, #ff4400)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(255, 136, 0, 0.3)',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    METEOR STRIKE
                </h1>

                <p style={{
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
                    maxWidth: '90%',
                    marginBottom: '2rem',
                    background: 'linear-gradient(45deg, #ffffff, #cccccc)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    padding: '0 0.5rem',
                    lineHeight: 1.6,
                    position: 'relative',
                    zIndex: 1,
                }}>
                    Defend Earth from incoming asteroids! Use <strong>Arrow Left/Right</strong> to move horizontally, <strong>Arrow Up/Down</strong> to tilt the ship, and <strong>Spacebar</strong> to shoot. On mobile, use the on-screen buttons.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        style={{
                            padding: '0.8rem 2rem',
                            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                            cursor: 'pointer',
                            background: 'rgba(255, 136, 0, 0.15)',
                            color: '#fff',
                            border: '1px solid rgba(255, 136, 0, 0.5)',
                            borderRadius: '10px',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 6px 24px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            touchAction: 'manipulation',
                        }}
                        onClick={handleStart}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.25)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 68, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.15)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.25)';
                            e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.15)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Start Mission
                    </button>

                    <button
                        style={{
                            padding: '0.8rem 1.5rem',
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            cursor: 'pointer',
                            background: 'rgba(100, 100, 100, 0.15)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            touchAction: 'manipulation',
                        }}
                        onClick={handleBackToHome}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(100, 100, 100, 0.25)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(100, 100, 100, 0.15)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(100, 100, 100, 0.25)';
                            e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'rgba(100, 100, 100, 0.15)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={spaceMono.className} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <button
                style={{
                    position: 'absolute',
                    top: 'clamp(0.8rem, 2vw, 1rem)',
                    left: 'clamp(0.8rem, 2vw, 1rem)',
                    padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.25rem)',
                    fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                    cursor: 'pointer',
                    background: 'rgba(255, 136, 0, 0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255, 136, 0, 0.5)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    touchAction: 'manipulation',
                    pointerEvents: 'auto',
                }}
                onClick={handleBackToHome}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 136, 0, 0.25)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 68, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 136, 0, 0.15)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
                onTouchStart={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 136, 0, 0.25)';
                    e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 136, 0, 0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                ← Back
            </button>

            <div
                style={{
                    position: 'absolute',
                    top: 'clamp(0.8rem, 2vw, 1rem)',
                    right: 'clamp(0.8rem, 2vw, 1rem)',
                    color: '#fff',
                    fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                    zIndex: 1000,
                    background: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(8px)',
                    padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 136, 0, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                }}
            >
                Score: <span style={{
                    background: 'linear-gradient(45deg, #ff8800, #ff4400)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    fontWeight: 'bold',
                }}>{score}</span>
            </div>

            {isMobile && started && !gameOver && (
                <div style={{
                    position: 'absolute',
                    bottom: 'clamp(0.8rem, 2vw, 1rem)',
                    left: 'clamp(0.8rem, 2vw, 1rem)',
                    right: 'clamp(0.8rem, 2vw, 1rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    zIndex: 1000,
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        pointerEvents: 'auto',
                    }}>
                        <button
                            style={{
                                width: 'clamp(40px, 10vw, 50px)',
                                height: 'clamp(40px, 10vw, 50px)',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                cursor: 'pointer',
                                background: 'rgba(255, 136, 0, 0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255, 136, 0, 0.5)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                            }}
                            onTouchStart={() => handleButtonDown('ArrowLeft')}
                            onTouchEnd={() => handleButtonUp('ArrowLeft')}
                            onMouseDown={() => handleButtonDown('ArrowLeft')}
                            onMouseUp={() => handleButtonUp('ArrowLeft')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ←
                        </button>
                        <button
                            style={{
                                width: 'clamp(40px, 10vw, 50px)',
                                height: 'clamp(40px, 10vw, 50px)',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                cursor: 'pointer',
                                background: 'rgba(255, 136, 0, 0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255, 136, 0, 0.5)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                            }}
                            onTouchStart={() => handleButtonDown('ArrowRight')}
                            onTouchEnd={() => handleButtonUp('ArrowRight')}
                            onMouseDown={() => handleButtonDown('ArrowRight')}
                            onMouseUp={() => handleButtonUp('ArrowRight')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            →
                        </button>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        pointerEvents: 'auto',
                    }}>
                        <button
                            style={{
                                width: 'clamp(40px, 10vw, 50px)',
                                height: 'clamp(40px, 10vw, 50px)',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                cursor: 'pointer',
                                background: 'rgba(255, 136, 0, 0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255, 136, 0, 0.5)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                            }}
                            onTouchStart={() => handleButtonDown('ArrowUp')}
                            onTouchEnd={() => handleButtonUp('ArrowUp')}
                            onMouseDown={() => handleButtonDown('ArrowUp')}
                            onMouseUp={() => handleButtonUp('ArrowUp')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ↑
                        </button>
                        <button
                            style={{
                                width: 'clamp(40px, 10vw, 50px)',
                                height: 'clamp(40px, 10vw, 50px)',
                                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                                cursor: 'pointer',
                                background: 'rgba(255, 136, 0, 0.2)',
                                color: '#fff',
                                border: '1px solid rgba(255, 136, 0, 0.5)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                touchAction: 'manipulation',
                            }}
                            onTouchStart={() => handleButtonDown('ArrowDown')}
                            onTouchEnd={() => handleButtonUp('ArrowDown')}
                            onMouseDown={() => handleButtonDown('ArrowDown')}
                            onMouseUp={() => handleButtonUp('ArrowDown')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            ↓
                        </button>
                    </div>
                    <button
                        style={{
                            width: 'clamp(60px, 15vw, 70px)',
                            height: 'clamp(60px, 15vw, 70px)',
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            cursor: 'pointer',
                            background: 'rgba(255, 68, 0, 0.3)',
                            color: '#fff',
                            border: '1px solid rgba(255, 68, 0, 0.7)',
                            borderRadius: '50%',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 16px rgba(255, 68, 0, 0.4)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation',
                        }}
                        onTouchStart={() => handleButtonDown('Space')}
                        onTouchEnd={() => handleButtonUp('Space')}
                        onMouseDown={() => handleButtonDown('Space')}
                        onMouseUp={() => handleButtonUp('Space')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 0, 0.4)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 0, 0.3)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        FIRE
                    </button>
                </div>
            )}

            {gameOver && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                        zIndex: 1000,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(12px)',
                        padding: 'clamp(1.5rem, 4vw, 2rem) clamp(2rem, 5vw, 2.5rem)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 136, 0, 0.3)',
                        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
                        width: 'clamp(250px, 80%, 400px)',
                    }}
                >
                    <div style={{
                        marginBottom: '1rem',
                        background: 'linear-gradient(45deg, #ff8800, #ff4400)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 'bold',
                    }}>Mission Failed</div>

                    <div style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(45deg, #ffffff, #cccccc)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        Final Score: <span style={{ fontWeight: 'bold' }}>{score}</span>
                    </div>

                    <button
                        style={{
                            padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            cursor: 'pointer',
                            background: 'rgba(255, 136, 0, 0.2)',
                            color: '#fff',
                            border: '1px solid rgba(255, 136, 0, 0.5)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 16px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.3s ease',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            touchAction: 'manipulation',
                        }}
                        onClick={handleRestart}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 68, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 68, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.3)';
                            e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 136, 0, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Redeploy
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