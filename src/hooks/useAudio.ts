import { useCallback, useRef } from 'react';
const sounds = {
  dice: '/sounds/dice-roll.mp3',
  move: '/sounds/player-move.mp3',
};
type SoundType = keyof typeof sounds;
export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playSound = useCallback((type: SoundType) => {
    if (typeof window !== 'undefined') {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = sounds[type];
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));
    }
  }, []);
  return playSound;
};