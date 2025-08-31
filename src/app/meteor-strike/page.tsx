"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const StarField = dynamic(() => import("../../components/StarField"), {
  ssr: false,
});

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet extends GameObject {
  speed: number;
}

interface Asteroid extends GameObject {
  speed: number;
  rotation: number;
  image: string;
}

// Responsive game dimensions - will be calculated based on viewport
const getGameDimensions = () => {
  if (typeof window !== 'undefined') {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    return {
      GAME_WIDTH: Math.min(vw * 0.98, 1200), // Larger game window
      GAME_HEIGHT: Math.min(vh * 0.85, 900), // Taller game window
      SPACESHIP_WIDTH: Math.max(Math.min(vw * 0.12, 120), 70), // Bigger spaceship
      SPACESHIP_HEIGHT: Math.max(Math.min(vw * 0.09, 90), 50), // Bigger spaceship
      ASTEROID_SIZE: Math.max(Math.min(vw * 0.05, 40), 28), // Smaller asteroids
      BULLET_WIDTH: Math.max(Math.min(vw * 0.012, 10), 5),
      BULLET_HEIGHT: Math.max(Math.min(vh * 0.025, 20), 10),
      EARTH_HEIGHT: Math.max(Math.min(vh * 0.35, 220), 180),
    };
  }
  
  // Fallback for SSR
  return {
    GAME_WIDTH: 1200,
    GAME_HEIGHT: 900,
    SPACESHIP_WIDTH: 120,
    SPACESHIP_HEIGHT: 90,
    ASTEROID_SIZE: 40,
    BULLET_WIDTH: 10,
    BULLET_HEIGHT: 20,
    EARTH_HEIGHT: 220,
  };
};

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPACESHIP_WIDTH = 60;
const SPACESHIP_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const ASTEROID_SIZE = 40;
const EARTH_HEIGHT = 150;

export default function MeteorStrike() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [spaceshipX, setSpaceshipX] = useState(GAME_WIDTH / 2 - SPACESHIP_WIDTH / 2);
  const [currentSpaceship, setCurrentSpaceship] = useState(0);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [keys, setKeys] = useState<{[key: string]: boolean}>({});
  const [dimensions, setDimensions] = useState(getGameDimensions());
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = getGameDimensions();
      setDimensions(newDimensions);
      // Update spaceship position to stay within bounds
      setSpaceshipX(prev => Math.min(prev, newDimensions.GAME_WIDTH - newDimensions.SPACESHIP_WIDTH));
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial dimensions

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const asteroidImage = '/images/asteroid.png';
  
  const spaceships = [
    '/images/spaceship 1.png',
    '/images/spaceship 2.png',
  ];

  // Game controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: true }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [e.key]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Shooting bullets
  const shootBullet = useCallback(() => {
    const newBullet: Bullet = {
      id: Date.now().toString(),
      x: spaceshipX + dimensions.SPACESHIP_WIDTH / 2 - dimensions.BULLET_WIDTH / 2,
      y: dimensions.GAME_HEIGHT - dimensions.EARTH_HEIGHT - dimensions.SPACESHIP_HEIGHT - 10,
      width: dimensions.BULLET_WIDTH,
      height: dimensions.BULLET_HEIGHT,
      speed: 8,
    };
    setBullets(prev => [...prev, newBullet]);
  }, [spaceshipX, dimensions]);

  // Spawn asteroids with single asteroid image
  const spawnAsteroid = useCallback(() => {
    const newAsteroid: Asteroid = {
      id: Date.now().toString(),
      x: Math.random() * (dimensions.GAME_WIDTH - dimensions.ASTEROID_SIZE),
      y: -dimensions.ASTEROID_SIZE,
      width: dimensions.ASTEROID_SIZE,
      height: dimensions.ASTEROID_SIZE,
      speed: 1 + Math.random() * 2,
      rotation: 0,
      image: asteroidImage,
    };
    setAsteroids(prev => [...prev, newAsteroid]);
  }, [asteroidImage, dimensions]);

  // Collision detection
  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (gameState !== 'playing') return;

    // Move spaceship
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      setSpaceshipX(prev => Math.max(0, prev - 5));
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      setSpaceshipX(prev => Math.min(dimensions.GAME_WIDTH - dimensions.SPACESHIP_WIDTH, prev + 5));
    }
    if (keys[' ']) {
      shootBullet();
    }

    // Update bullets
    setBullets(prev => 
      prev
        .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
        .filter(bullet => bullet.y > -bullet.height)
    );

    // Update asteroids
    setAsteroids(prev => 
      prev
        .map(asteroid => ({ 
          ...asteroid, 
          y: asteroid.y + asteroid.speed,
          rotation: asteroid.rotation + 2
        }))
        .filter(asteroid => {
          if (asteroid.y + asteroid.height >= dimensions.GAME_HEIGHT - dimensions.EARTH_HEIGHT) {
            setHighScore(prev => Math.max(prev, score));
            setGameState('gameOver');
            return false;
          }
          return asteroid.y < dimensions.GAME_HEIGHT + asteroid.height;
        })
    );

    // Bullet-asteroid collision and scoring (atomic update)
    setBullets(prevBullets => {
      const bulletsToRemove: Set<string> = new Set();
      const asteroidIdsToRemove: Set<string> = new Set();
      // Use current asteroids for collision check
      setAsteroids(prevAsteroids => {
        prevBullets.forEach(bullet => {
          prevAsteroids.forEach(asteroid => {
            if (checkCollision(bullet, asteroid)) {
              bulletsToRemove.add(bullet.id);
              asteroidIdsToRemove.add(asteroid.id);
            }
          });
        });
        // Score only once per asteroid
        if (asteroidIdsToRemove.size > 0) {
          setScore(prev => prev + asteroidIdsToRemove.size);
        }
        // Remove collided asteroids
        return prevAsteroids.filter(a => !asteroidIdsToRemove.has(a.id));
      });
      // Remove collided bullets
      return prevBullets.filter(bullet => !bulletsToRemove.has(bullet.id));
    });

    // Spawn new asteroids (much slower rate)
    if (Math.random() < 0.008) { // Reduced from 0.015 to 0.008
      spawnAsteroid();
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, keys, shootBullet, spawnAsteroid]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpaceshipX(dimensions.GAME_WIDTH / 2 - dimensions.SPACESHIP_WIDTH / 2);
    setBullets([]);
    setAsteroids([]);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setBullets([]);
    setAsteroids([]);
  };

  return (
    <div className="min-h-screen bg-space-black relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Meteor Strike
            </h1>
            
            <div className="space-y-4">
              <h2 className="text-2xl text-white mb-4">Choose Your Spaceship</h2>
              <div className="flex gap-4 justify-center">
                {spaceships.map((ship, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSpaceship(index)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentSpaceship === index
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-500 hover:border-gray-300'
                    }`}
                    title={`Select Spaceship ${index + 1}`}
                    aria-label={`Select Spaceship ${index + 1}`}
                  >
                    <Image
                      src={ship}
                      alt={`Spaceship ${index + 1}`}
                      width={60}
                      height={40}
                      className="w-16 h-12 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Game
            </button>
            
            <div className="text-gray-300 space-y-2">
              <p>Use Arrow Keys or A/D to move</p>
              <p>Space bar to shoot</p>
              <p>Defend Earth from asteroids!</p>
            </div>
          </div>
        )}

        {/* Game Playing */}
        {gameState === 'playing' && (
          <div className="relative">
            {/* Score */}
            <div className="absolute top-4 left-4 text-white text-xl font-bold z-20 space-y-1">
              <div>Score: {score}</div>
              {highScore > 0 && <div className="text-yellow-400">Best: {highScore}</div>}
            </div>
            
            {/* Game Container */}
            <div className="game-container relative border-2 border-gray-500 bg-black/50 overflow-hidden">
              {/* Half Earth at bottom - Much more visible */}
              <div className="earth-container absolute bottom-0 w-full overflow-hidden bg-gradient-to-t from-blue-600/30 to-transparent">
                <Image
                  src="/images/earth.png"
                  alt="Earth"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover object-center"
                  style={{ 
                    transform: 'translateY(-5%)', // Show full height of Earth container
                    minHeight: '150%',
                    opacity: '1', // Full opacity
                  }}
                />
                {/* Earth atmosphere glow effect - stronger */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-400/20 via-green-400/10 to-transparent pointer-events-none"></div>
                {/* Earth label for visibility */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-black/50 px-2 py-1 rounded">
                  EARTH
                </div>
              </div>
              
              {/* Spaceship */}
              <div
                className="spaceship-container absolute transition-all duration-75"
                style={{ transform: `translateX(${spaceshipX}px)` }}
              >
                <Image
                  src={spaceships[currentSpaceship]}
                  alt="Spaceship"
                  width={dimensions.SPACESHIP_WIDTH}
                  height={dimensions.SPACESHIP_HEIGHT}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Bullets */}
              {bullets.map(bullet => (
                <div
                  key={bullet.id}
                  className="bullet absolute bg-yellow-400 rounded-full"
                  style={{ transform: `translate(${bullet.x}px, ${bullet.y}px)` }}
                />
              ))}
              
              {/* Asteroids */}
              {asteroids.map(asteroid => (
                <div
                  key={asteroid.id}
                  className="asteroid absolute"
                  style={{ 
                    transform: `translate(${asteroid.x}px, ${asteroid.y}px) rotate(${asteroid.rotation}deg)` 
                  }}
                >
                  <Image
                    src={asteroid.image}
                    alt="Asteroid"
                    width={dimensions.ASTEROID_SIZE}
                    height={dimensions.ASTEROID_SIZE}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile Controls */}
            <div className="md:hidden flex justify-center gap-8 mt-4">
              <button
                onMouseDown={() => setKeys(prev => ({ ...prev, ArrowLeft: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, ArrowLeft: false }))}
                onTouchStart={() => setKeys(prev => ({ ...prev, ArrowLeft: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, ArrowLeft: false }))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold select-none"
                title="Move Left"
              >
                ←
              </button>
              <button
                onMouseDown={() => setKeys(prev => ({ ...prev, ' ': true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, ' ': false }))}
                onTouchStart={() => setKeys(prev => ({ ...prev, ' ': true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, ' ': false }))}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold select-none"
                title="Fire"
              >
                FIRE
              </button>
              <button
                onMouseDown={() => setKeys(prev => ({ ...prev, ArrowRight: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, ArrowRight: false }))}
                onTouchStart={() => setKeys(prev => ({ ...prev, ArrowRight: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, ArrowRight: false }))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold select-none"
                title="Move Right"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-red-500 mb-4">Game Over!</h1>
            <h2 className="text-3xl text-white">Final Score: {score}</h2>
            {score === highScore && score > 0 && (
              <p className="text-yellow-400 text-xl font-bold">🎉 New High Score! 🎉</p>
            )}
            <p className="text-gray-300 text-xl">The asteroids reached Earth!</p>
            
            <div className="space-y-4">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold text-xl rounded-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 mr-4"
              >
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-xl rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
