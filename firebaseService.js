// firebaseService.js

import { db } from './services/firebase'; // Adjust the import path if necessary
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Updates the user's level in Firestore.
 *
 * @param {string} uid - The user's unique ID.
 * @param {number} newLevel - The new level to set for the user.
 * @returns {Promise<void>}
 */
export const updateUserLevel = async (uid, newLevel) => {
  try {
    // Reference to the user's document in Firestore
    const userRef = doc(db, 'users', uid);
    
    // Update the level field in the user's document
    await updateDoc(userRef, {
      level: newLevel,
    });
    console.log('User level updated to:', newLevel);
  } catch (error) {
    console.error('Error updating user level:', error);
    throw new Error('Failed to update user level');
  }
};
