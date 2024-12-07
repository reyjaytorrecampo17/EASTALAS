import React, { createContext, useState, useContext, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../services/firebase';

const LevelContext = createContext();

export const LevelProvider = ({ children }) => {
  const [currentXP, setCurrentXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const fetchUserXP = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const userDocRef = doc(getFirestore(), 'users', userId);
          const userDoc = await getDoc(userDocRef);
    
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentXP(userData.currentXP || 0);
            setNextLevelXP(userData.nextLevelXP || 100);
            setLevel(userData.level || 1);
          } else {
            console.warn("User data not found. Initializing with defaults.");
            setCurrentXP(0);
            setNextLevelXP(100);
            setLevel(1);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default values in case of an error
          setCurrentXP(0);
          setNextLevelXP(100);
          setLevel(1);
        }
      }
    };
    fetchUserXP();
  }, []);

  const checkLevelUp = (newXP) => {
    if (newXP >= nextLevelXP) {
      // Level up condition
      const newLevel = level + 1;
      const updatedNextLevelXP = nextLevelXP + 50;
      const newCurrentXP = newXP - nextLevelXP; // Reset XP to start of the new level
      console.log(`Level Up! New Level: ${newLevel}, New XP: ${newCurrentXP}`);

      // Update state
      setLevel(newLevel);
      setNextLevelXP(updatedNextLevelXP);
      setCurrentXP(newCurrentXP);

      // Return updated data
      return { newLevel, updatedNextLevelXP, newCurrentXP };
    }
    return null;
  };

  const addXP = (xp) => {
    const newXP = currentXP + xp;
    const levelUpData = checkLevelUp(newXP);

    if (levelUpData) {
      // If level up, update Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(getFirestore(), 'users', userId);
        updateDoc(userDocRef, {
          currentXP: levelUpData.newCurrentXP,
          nextLevelXP: levelUpData.updatedNextLevelXP,
          level: levelUpData.newLevel,
          lastLevel: level, // Store the previous level
          lastLevelTimestamp: serverTimestamp(),
        }).catch((error) => {
          console.error('Firestore update error:', error);
        });
      }
    } else {
      // Otherwise, just update current XP without level-up
      setCurrentXP(newXP);

      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(getFirestore(), 'users', userId);
        updateDoc(userDocRef, {
          currentXP: newXP,
          nextLevelXP: nextLevelXP,
          level: level,
          lastLevel: level,
          lastLevelTimestamp: serverTimestamp(),
        }).catch((error) => {
          console.error('Firestore update error:', error);
        });
      }
    }
  };

  return (
    <LevelContext.Provider value={{ currentXP, nextLevelXP, level, addXP }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);
