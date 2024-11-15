import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Game } from './game/Game';
import { useGameAudio } from './hooks/useGameAudio';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const { isMuted, toggleMute, initAudio } = useGameAudio();

  useEffect(() => {
    if (!canvasRef.current || !threeCanvasRef.current) return;

    const game = new Game(canvasRef.current, threeCanvasRef.current);
    game.start();

    const handleResize = () => game.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.cleanup();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
        <button
          onClick={toggleMute}
          className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-gray-700" />
          ) : (
            <Volume2 className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={initAudio}
      />
      <canvas
        ref={threeCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

export default App;