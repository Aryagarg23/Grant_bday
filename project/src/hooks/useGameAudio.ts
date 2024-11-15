import { useState, useCallback } from 'react';

export function useGameAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initAudio = useCallback(() => {
    if (!isInitialized) {
      const audioContext = new AudioContext();
      audioContext.resume();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isMuted,
    toggleMute,
    initAudio,
  };
}