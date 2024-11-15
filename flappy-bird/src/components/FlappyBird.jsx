import React, { useState, useEffect, useCallback } from 'react';
import redOrbImage from '/src/assets/cinammon.webp';
import blueOrbImage from '/src/assets/monster-green.webp';
import pipeImage from '/src/assets/lamp.webp';
import playerImage from '/src/assets/grant.webp';
import birthdayVideo from '/src/assets/happy_birthday.mov';

const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const BASE_SPEED = 3;
const MAX_SPEED = 8;
const ORB_SPAWN_RATE = 300;
const PIPE_DISTANCE = 400;
const MAX_FOCUS = 100;
const FOCUS_DECAY_RATE = 0.3;
const SPEED_DECAY_RATE = 0.005;
const PIPE_GAPS = {
    easy: 325,
    medium: 275,
    hard: 200
};
const PIPE_SPAWN_RATE = 2000;
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const ORB_SIZE = 25;
const PIPE_WIDTH = 150;
const PIPE_HEIGHT = 200;
const PLAYER_SIZE = 60;
const BIRTHDAY_SCORE = 23;
const PARTICLE_COLORS = [
    '#ff6b00',
    '#ff8c00',
    '#ffa500',
    '#ffcc00',
];

const MAX_TRAIL_PARTICLES = 15;
const PARTICLE_DECAY_RATE = 0.03;

const FlappyBird = () => {
  const [birdPosition, setBirdPosition] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [orbs, setOrbs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [passedPipes, setPassedPipes] = useState(new Set());
  const [focusMeter, setFocusMeter] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(BASE_SPEED);
  const [trailParticles, setTrailParticles] = useState([]);
  const [showBirthday, setShowBirthday] = useState(false);

  const startGame = () => {
    setShowMenu(false);
    setGameStarted(true);
    setBirdPosition(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setOrbs([]);
    setScore(0);
    setPassedPipes(new Set());
    setFocusMeter(0);
    setGameSpeed(BASE_SPEED);
    setIsGameOver(false);
    setTrailParticles([]);
    setShowBirthday(false);
  };

  const jump = useCallback(() => {
    if (!isGameOver && !showMenu && !showBirthday) {
      const focusReduction = 1 - (focusMeter / MAX_FOCUS) * 0.5;
      setBirdVelocity(JUMP_FORCE * focusReduction);
      if (!gameStarted) {
        setGameStarted(true);
      }
    }
  }, [isGameOver, gameStarted, showMenu, focusMeter, showBirthday]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        jump();
      }
      if (e.code === 'Escape' && !showMenu && !showBirthday) {
        setShowMenu(true);
        setGameStarted(false);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const addParticle = () => {
      const speedRatio = (gameSpeed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
      if (Math.random() > speedRatio * 1.5) return;

      const particleCount = Math.floor(Math.random() * 2) + 2;
      const newParticles = Array.from({ length: particleCount }).map(() => ({
        id: Date.now() + Math.random(),
        x: 100 + (Math.random() * 10 - 5),
        y: birdPosition + (Math.random() * 10 - 5),
        opacity: 0.9,
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * 360,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        speedX: -1 - Math.random() * 2,
        speedY: (Math.random() - 0.5) * 2,
      }));

      setTrailParticles(prev => {
        const combined = [...newParticles, ...prev];
        return combined.slice(0, MAX_TRAIL_PARTICLES);
      });
    };

    const updateParticles = () => {
      setTrailParticles(prev => 
        prev.map(particle => ({
          ...particle,
          opacity: particle.opacity - PARTICLE_DECAY_RATE,
          scale: particle.scale - PARTICLE_DECAY_RATE * 0.5,
          x: particle.x + particle.speedX * gameSpeed,
          y: particle.y + particle.speedY,
          rotation: particle.rotation + 5,
          speedY: particle.speedY + 0.1
        })).filter(particle => particle.opacity > 0 && particle.scale > 0)
      );
    };

    const particleSpawnInterval = setInterval(addParticle, 50);
    const particleUpdateInterval = setInterval(updateParticles, 20);

    return () => {
      clearInterval(particleSpawnInterval);
      clearInterval(particleUpdateInterval);
    };
  }, [gameStarted, isGameOver, birdPosition, gameSpeed]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      setFocusMeter(prev => Math.max(0, prev - FOCUS_DECAY_RATE));
      setGameSpeed(prev => Math.max(BASE_SPEED, prev - SPEED_DECAY_RATE));
    
      setBirdPosition((prev) => {
        const newPosition = prev + birdVelocity;
        if (newPosition > GAME_HEIGHT || newPosition < 0) {
          setIsGameOver(true);
          return prev;
        }
        return newPosition;
      });

      setBirdVelocity((prev) => prev + GRAVITY);

      setPipes((prevPipes) => {
        return prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - gameSpeed,
        })).filter((pipe) => pipe.x > -60);
      });

      setOrbs((prevOrbs) => {
        return prevOrbs.map((orb) => ({
          ...orb,
          x: orb.x - gameSpeed,
        })).filter((orb) => orb.x > -ORB_SIZE);
      });

      pipes.forEach((pipe) => {
        if (pipe.x < 100 && !passedPipes.has(pipe.id)) {
          setPassedPipes((prev) => new Set([...prev, pipe.id]));
          const newScore = score + 1;
          setScore(newScore);

          // Check for birthday score
          if (newScore === BIRTHDAY_SCORE) {
            setShowBirthday(true);
            setGameStarted(false);
          }
        }
      });

      setOrbs((prevOrbs) => {
        return prevOrbs.filter((orb) => {
          const collected = 
            Math.abs(orb.x - 100) < 30 &&
            Math.abs(orb.y - birdPosition) < 30;
          
          if (collected) {
            if (orb.type === 'red') {
              setFocusMeter(prev => Math.min(MAX_FOCUS, prev + 25));
            } else {
              setGameSpeed(prev => Math.min(MAX_SPEED, prev + 0.5));
            }
          }
          return !collected;
        });
      });

    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, birdVelocity, pipes, passedPipes, birdPosition, gameSpeed, score]);

  useEffect(() => {
    if (!gameStarted) return;

    const spawnPipe = setInterval(() => {
      const height = Math.random() * (GAME_HEIGHT - PIPE_GAPS[difficulty] - 100) + 50;
      const pipeId = Date.now();
      setPipes((prev) => [...prev, { 
        id: pipeId, 
        x: GAME_WIDTH + PIPE_DISTANCE, 
        height 
      }]);
    }, PIPE_SPAWN_RATE);

    const spawnOrb = setInterval(() => {
      const orbY = Math.random() * (GAME_HEIGHT - 100) + 50;
      const orbX = GAME_WIDTH + Math.random() * PIPE_DISTANCE;
      const orbType = Math.random() < 0.3 ? 'red' : 'blue';
      setOrbs((prev) => [...prev, {
        x: orbX,
        y: orbY,
        type: orbType
      }]);
    }, ORB_SPAWN_RATE);

    return () => {
      clearInterval(spawnPipe);
      clearInterval(spawnOrb);
    };
  }, [gameStarted, difficulty]);

  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
    }
  }, [isGameOver, score, highScore]);

  useEffect(() => {
    const checkCollision = () => {
      for (const pipe of pipes) {
        if (
          pipe.x < 100 + 40 && pipe.x + 60 > 100 &&
          (birdPosition < pipe.height || birdPosition > pipe.height + PIPE_GAPS[difficulty])
        ) {
          setIsGameOver(true);
          setShowMenu(true);
          setGameStarted(false);
        }
      }
    };

    if (gameStarted) {
      checkCollision();
    }
  }, [birdPosition, pipes, gameStarted, difficulty]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-sky-200" onClick={jump}>
      <svg 
        className="w-full h-full"
        viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Trail particles */}
        {trailParticles.map(particle => (
          <g 
            key={particle.id} 
            transform={`translate(${particle.x}, ${particle.y}) rotate(${particle.rotation})`}
          >
            <circle
              cx={0}
              cy={0}
              r={PLAYER_SIZE / 4 * particle.scale}
              fill={particle.color}
              opacity={particle.opacity}
              style={{
                filter: `
                  brightness(1.5)
                  blur(1px)
                  drop-shadow(0 0 3px ${particle.color})
                `
              }}
            />
          </g>
        ))}

        {/* Player */}
        <image
          href={playerImage}
          x={100 - PLAYER_SIZE / 2}
          y={birdPosition - PLAYER_SIZE / 2}
          width={PLAYER_SIZE}
          height={PLAYER_SIZE}
          style={{
            filter: `
              hue-rotate(${(focusMeter / MAX_FOCUS) * -20}deg)
              saturate(${1 + (focusMeter / MAX_FOCUS) * 2})
              brightness(${1 + (focusMeter / MAX_FOCUS) * 0.5})
              contrast(${1 + (focusMeter / MAX_FOCUS) * 0.3})
              drop-shadow(0 0 5px rgba(255, 107, 0, ${gameSpeed / MAX_SPEED}))
            `
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe) => (
          <g key={pipe.id}>
            <image
              href={pipeImage}
              x={pipe.x}
              y={0}
              width={PIPE_WIDTH}
              height={pipe.height}
              preserveAspectRatio="none"
            />
            
            <image
              href={pipeImage}
              x={pipe.x}
              y={pipe.height + PIPE_GAPS[difficulty]}
              width={PIPE_WIDTH}
              height={GAME_HEIGHT - (pipe.height + PIPE_GAPS[difficulty])}
              preserveAspectRatio="none"
            />
          </g>
        ))}

        {/* Orbs */}
        {orbs.map((orb, i) => (
          <g key={i} transform={`translate(${orb.x}, ${orb.y})`}>
            <image
              href={orb.type === 'red' ? redOrbImage : blueOrbImage}
              x={-ORB_SIZE}
              y={-ORB_SIZE}
              width={ORB_SIZE * 2}
              height={ORB_SIZE * 2}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
              }}
            >
              <animate
                attributeName="width"
                values={`${ORB_SIZE * 2};${(ORB_SIZE - 2) * 2};${ORB_SIZE * 2}`}
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="height"
                values={`${ORB_SIZE * 2};${(ORB_SIZE - 2) * 2};${ORB_SIZE * 2}`}
                dur="1s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0;15;0;-15;0"
                dur="2s"
                repeatCount="indefinite"
              />
            </image>
          </g>
        ))}
      </svg>

      {/* Status Display Overlay - Now as a div */}
      {gameStarted && !showMenu && (
        <div className="absolute top-4 left-4 bg-black/80 rounded-2xl p-4 text-white">
          <p className="text-lg mb-2">STATUS</p>
          <div className="space-y-3">
            {/* Speed Meter */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-xs">SPD</span>
                <div className="h-3 bg-gray-700 rounded-full w-32">
                  <div 
                    className="h-3 bg-blue-500 rounded-full transition-all duration-200"
                    style={{ 
                      width: `${((gameSpeed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Focus Meter */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-xs">FCS</span>
                <div className="h-3 bg-gray-700 rounded-full w-32">
                  <div 
                    className="h-3 bg-red-500 rounded-full transition-all duration-200"
                    style={{ 
                      width: `${(focusMeter / MAX_FOCUS) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameStarted && !showMenu && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <p className="text-6xl font-bold text-white drop-shadow-lg">
            {score}
          </p>
        </div>
      )}

      {/* Birthday Overlay */}
      {showBirthday && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-bold text-white mb-8 animate-bounce">
            Happy Birthday!
          </h1>
          <video
            className="w-full max-w-2xl rounded-lg shadow-2xl"
            autoPlay
            controls={false}
            onEnded={() => {
              setShowBirthday(false);
              setShowMenu(true);
            }}
          >
            <source src={birthdayVideo} type="video/mp4" />
          </video>
        </div>
      )}

      {showMenu && !showBirthday && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h1 className="text-4xl font-bold text-center mb-4">Flappy Bird</h1>
            
            {isGameOver ? (
              <div className="text-center mb-6">
                <p className="text-xl mb-2">Game Over!</p>
                <p className="text-lg">Score: {score}</p>
                <p className="text-lg">High Score: {highScore}</p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <p className="text-lg mb-2">Press Space or Click to flap</p>
                <p className="text-lg">Press ESC for menu</p>
                <div className="mt-4 text-sm">
                  <p className="text-red-500">Red Orbs: Increase focus (smaller jumps)</p>
                  <p className="text-blue-500">Blue Orbs: Increase game speed</p>
                </div>
                {highScore > 0 && <p className="text-lg mt-2">High Score: {highScore}</p>}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    className={`px-4 py-2 rounded-lg text-white capitalize font-semibold transition-colors ${
                      difficulty === diff
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <button 
                className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
                onClick={startGame}
              >
                {isGameOver ? 'Play Again' : 'Start Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;