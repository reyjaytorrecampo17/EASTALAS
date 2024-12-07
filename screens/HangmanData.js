import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ImageBackground,Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDocs ,updateDoc  , getDoc ,serverTimestamp,onSnapshot } from "firebase/firestore";
import { db,auth } from '../services/firebase'; // Adjust this path based on your setup
import LottieView from 'lottie-react-native'; // Import Lottie

const alphabet = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M'
];

const HangmanGame = () => {
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(60); // Timer state, 60 seconds for example
  const [timerRunning, setTimerRunning] = useState(false); // Track if the timer is running
  const [battery, setBattery] = useState(0);
  const [loading, setLoading] = useState(true);
  let interval;
  // Fetch stories on component mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'hangmanStory'));
        const fetchedStories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStories(fetchedStories);
        if (fetchedStories.length > 0) {
          setCurrentStoryIndex(0);
          setWord(fetchedStories[0].word.toUpperCase());
        }
      } catch (error) {
        console.error("Error fetching hangman stories:", error);
      } finally {
        setLoading(false); // Set loading to false after stories are fetched
      }
    };
  
    fetchStories();
  }, []);  

  // Start the timer when the game starts
  useEffect(() => {
    if (gameStarted && !timerRunning) {
      setTimerRunning(true);
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer === 1) {
            clearInterval(interval);
            setTimerRunning(false);
            setGameStarted(false); // Stop the game when the timer hits zero
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    // Cleanup the interval when the component unmounts or when the game ends
    return () => clearInterval(interval);
  }, [gameStarted, timerRunning]);

  const handleGuess = (letter) => {
    if (word.includes(letter)) {
      setGuesses([...guesses, letter]);
    } else {
      const updatedAttempts = remainingAttempts - 1;
      setRemainingAttempts(updatedAttempts);
  
      if (updatedAttempts === 0) {
        decreaseBattery(); // Call the function to reduce battery
        Alert.alert('Out of Attempts', 'Your battery has been reduced!');
      }
    }
  };
  
  

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      guesses.includes(letter) ? (
        <Text key={index} style={styles.letter}>{letter}</Text>
      ) : (
        <Text key={index} style={styles.letter}>_</Text>
      )
    ));
  };

  const proceedToNextStory = () => {
    if (currentStoryIndex + 1 < stories.length) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setWord(stories[nextIndex].word.toUpperCase());
    } else {
      console.log("No more stories available.");
    }
    resetGameStates();
  };

  const decreaseBattery = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.warn('No user logged in.');
        return;
      }
  
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
  
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const newBattery = Math.max(userData.battery - 1, 0); // Ensure it doesn't drop below 0
  
        if (newBattery === 0) {
          console.log('Battery is depleted.');
          // Optional: Trigger an error or notify the user
          Alert.alert('Battery Empty', 'You have no more battery left.');
        }
  
        await updateDoc(userRef, {
          battery: newBattery,
        });
        console.log('Battery decreased to:', newBattery);
        setBattery(newBattery); // Update state
      }
    } catch (error) {
      console.error('Failed to decrease battery:', error);
    }
  };

  const resetGameStates = () => {
    setGuesses([]);
    setRemainingAttempts(3);
    setGameStarted(false);
    setTimer(60); // Reset timer to 60 seconds
    setTimerRunning(false); // Reset timer running state
  };

  const resetGame = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hangmanStory'));
      const stories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(stories);
      if (stories.length > 0) {
        const randomStoryIndex = Math.floor(Math.random() * stories.length);
        setCurrentStoryIndex(randomStoryIndex);
        setWord(stories[randomStoryIndex].word.toUpperCase());
      }
      setGuesses([]);
      setRemainingAttempts(3);
      setGameStarted(false);
      setTimer(60); // Reset timer to 60 seconds
      setTimerRunning(false); // Reset timer running state
    } catch (error) {
      console.error("Error fetching new story:", error);
    }
  };

  const isGameOver = remainingAttempts <= 0 || timer === 0;
  const isGameWon = word.split('').every(letter => guesses.includes(letter));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('../assets/loading3.json')} // Update the path to your Lottie animation
          autoPlay
          loop
          style={{ width: 400, height: 400 }}
        />
      </View>
    );
  }
  return (
    <ImageBackground
      source={require('../assets/HangmanBackground.jpg')} // Add your own background image
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient colors={['rgba(0, 0, 0, 0.7)', 'transparent']} style={styles.overlay}>
        <View style={styles.container}>
          {!gameStarted ? (
            stories[currentStoryIndex] ? (
              <View>
                <Text style={styles.storyTitle}>{stories[currentStoryIndex].title}</Text>
                <Text style={styles.storyContent}>{stories[currentStoryIndex].content}</Text>
                <Text style={styles.storyHint}>Hint: {stories[currentStoryIndex].hint}</Text>
                <TouchableOpacity style={styles.startButton} onPress={() => setGameStarted(true)}>
                  <Text style={styles.startButtonText}>Start Game</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text>Loading story...</Text>
            )
          ) : (
            <View style={styles.GameContainer}>
              <Text style={styles.title}>Hangman Game</Text>
              <Text style={styles.word}>{renderWord()}</Text>
              <Text style={styles.timer}>Time Left: {timer} seconds</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.info}>Remaining attempts:</Text>
                <Text style={[styles.info, styles.remainingAttempts]}>{remainingAttempts}</Text>
              </View>
              {isGameOver ? (
                 <>
                 <Text style={styles.lost}>Game Over! The word was {word}.</Text>
               </>
              ) : isGameWon ? (
                <Text style={styles.win}>Congratulations! You won!</Text>
              ) : (
                <View style={styles.keyboardContainer}>
                  <View style={styles.row}>
                    {alphabet.slice(0, 10).map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        onPress={() => handleGuess(letter)}
                        disabled={guesses.includes(letter)}
                        style={[styles.letterButton, guesses.includes(letter) && styles.disabledButton]}
                      >
                        <Text style={styles.letterButtonText}>{letter}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.row}>
                    {alphabet.slice(10, 19).map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        onPress={() => handleGuess(letter)}
                        disabled={guesses.includes(letter)}
                        style={[styles.letterButton, guesses.includes(letter) && styles.disabledButton]}
                      >
                        <Text style={styles.letterButtonText}>{letter}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.row}>
                    {alphabet.slice(19).map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        onPress={() => handleGuess(letter)}
                        disabled={guesses.includes(letter)}
                        style={[styles.letterButton, guesses.includes(letter) && styles.disabledButton]}
                      >
                        <Text style={styles.letterButtonText}>{letter}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Text style={styles.resetButtonText}>Reset Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  GameContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  storyTitle: {
    fontSize: 24,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  storyContent: {
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    color: 'white',
    marginBottom: 10,
    textAlign: 'justify',
    paddingHorizontal: 20,
  },
  storyHint: {
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    color: 'yellow',
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  title: {
    fontSize: 28,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    color: 'white',
    marginBottom: 20,
  },
  word: {
    fontSize: 36,
    marginBottom: 20,
    letterSpacing: 3,
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  letter: {
    fontSize: 36,
    marginHorizontal: 5,
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  lost: {
    fontSize: 22,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    marginBottom: 20,
    color: 'red',
  },
  win: {
    fontSize: 22,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
    marginBottom: 20,
    color: 'yellow',
  },
  keyboardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginLeft: 35
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  letterButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    margin: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 50,
  },
  letterButtonText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  resetButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30
  },
  resetButtonText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  remainingAttempts: {
    color: 'red',
    marginLeft: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
});

export default HangmanGame;
