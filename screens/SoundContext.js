import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// Create the context
const SoundContext = createContext();

// Custom hook to access the context
export const useSound = () => {
  return useContext(SoundContext);
};

// Provider component to wrap the app
export const SoundProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  const soundRef = useRef(null); // Use ref to persist sound object

  useEffect(() => {
    async function loadSound() {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        if (isMusicEnabled) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            require('../assets/sounds/backgroundsounds.wav'),
            {
              shouldPlay: true,
              volume,
              isLooping: true,
            }
          );
          soundRef.current = newSound;
          await newSound.playAsync();
          setIsPlaying(true);  // Set after playAsync to sync the state
        }
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    }

    if (isMusicEnabled) {
      loadSound();
    } else {
      // Pause music when it's disabled
      if (soundRef.current) {
        soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [isMusicEnabled]);

  useEffect(() => {
    if (soundRef.current && soundRef.current._loaded) {
      soundRef.current.setVolumeAsync(volume).catch(error => console.error("Error setting volume:", error));
    }
  }, [volume]);

  const toggleMusic = async () => {
    if (soundRef.current) {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(!isPlaying); // Toggle play/pause state
    }
  };

  const handleMusicEnabledChange = (newValue) => {
    setIsMusicEnabled(newValue);
  };

  return (
    <SoundContext.Provider value={{ isMusicEnabled, toggleMusic, handleMusicEnabledChange, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
};
