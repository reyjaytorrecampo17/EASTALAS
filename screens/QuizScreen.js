import React, { useEffect, useState, useRef ,useCallback} from 'react';
import { View, Text, Button, StyleSheet, Modal, Alert, Animated ,StatusBar, TouchableOpacity,ScrollView, ImageBackground, Image, Dimensions,BackHandler} from 'react-native';
import LottieView from 'lottie-react-native'; // Import Lottie
import { fetchQuizzesWithStories } from '../services/FetchQuizzes'; // Adjust the import as necessary
import { useNavigation ,useFocusEffect} from '@react-navigation/native';
import ShowInstructions from './ShowInstructions';
import { Audio } from 'expo-av'; // Import Audio module
import { LinearGradient } from 'expo-linear-gradient';
import { db ,auth} from '../services/firebase';
import { collection, doc, getDoc ,updateDoc  , increment ,serverTimestamp,onSnapshot } from "firebase/firestore";
import Icon from 'react-native-vector-icons/FontAwesome';

import * as Speech from 'expo-speech';
import { AntDesign } from 'react-native-vector-icons';


const { width, height } = Dimensions.get('window');
const QuizScreen = () => {
  const [storyMap, setStoryMap] = useState({});
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false); // New state to control question visibility
  const [selectedDifficulty, setSelectedDifficulty] = useState(null); // New state for difficulty selection
  const navigation = useNavigation();
  const [showInstructions, setShowInstructions] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [pretestStatus, setPretestStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverModalVisible, setGameOverModalVisible] = useState(false); // State for "game over" modal
  const [hintVisible, setHintVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const [pretestCompleted, setPretestCompleted] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100); // Starting XP requirement
  const [level, setLevel] = React.useState(2);
  const [timeLeft, setTimeLeft] = useState(30); // Set timer to 30 seconds per question
  const [timerActive, setTimerActive] = useState(false); // Flag to control timer
  const [points,setPoints] = useState();
  const [battery, setBattery] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track if speech is playing
  
  const handleTTSToggle = () => {
    if (isSpeaking) {
      Speech.stop(); // Stop the speech if it's currently playing
      setIsSpeaking(false);
    } else {
      Speech.speak(currentStory.text, {
        pitch: 1.5, // Higher pitch for a more kid-friendly voice
        rate: 0.9,  // Slightly slower rate for better understanding
        language: 'en-US',
      });
      setIsSpeaking(true);
    }
  };

  // Stop TTS when the screen is exited or when the component unmounts
  useEffect(() => {
    // Stop speech when the component unmounts or when navigating away
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [isSpeaking]);

  const handleStartQuestions = async () => {
    if (isSpeaking) {
      Speech.stop(); // Stop TTS when starting the questions
      setIsSpeaking(false); // Update state to reflect speech is stopped
    }
    setShowQuestions(true);
    setTimeLeft(30); // Reset timer for each question
    setTimerActive(true); // Start the timer
  };

  // Function to decrease battery count and update Firestore
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
  
  
  

  // Audio-related state
  const [sound, setSound] = useState(null);
  const handleHint = () => {
    setHintVisible(true); // Reveal the hint when the button is pressed
  };
  const shuffleArray = (array) => {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

    // Timer logic using useEffect
   useEffect(() => {
  if (!timerActive) return;

  const timer = setInterval(() => {
    setTimeLeft((prevTime) => {
      if (prevTime <= 1) {
        clearInterval(timer); // Stop timer at 0
        handleTimeOut();
        return 0;
      }
      return prevTime - 1;
    });
  }, 1000);

  return () => clearInterval(timer); // Cleanup
}, [timerActive]);

    
    const handleTimeOut = () => {
      alert('Time is up!');
      loseLife();
    };
    

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedStories = await fetchQuizzesWithStories();
        setStoryMap(fetchedStories);
  
        // Shuffle the story IDs
        const storyIds = shuffleArray(Object.keys(fetchedStories));
  
        // Store the shuffled story IDs in state
        setShuffledStoryIds(storyIds);
  
        // Set the current story ID to the first story in the shuffled list
        if (storyIds.length > 0) {
          setCurrentStoryId(storyIds[0]);
        }
      } catch (err) {
        console.error('Error fetching quizzes with stories:', err);
        setError('Error fetching quizzes with stories');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const bounceValue = new Animated.Value(1); // initial scale for bounce animation

  const handlePressIn = () => {
    Animated.spring(bounceValue, {
      toValue: 0.9,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  const playSound = async (soundType) => {
    let soundFile;
    switch (soundType) {
      case 'correct':
        soundFile = require('../assets/sounds/correct.wav');
        break;
      case 'wrong':
        soundFile = require('../assets/sounds/incorrect.wav');
        break;
      case 'congratulations':
        soundFile = require('../assets/sounds/gameover_good.wav');
        break;
      case 'average':
        soundFile = require('../assets/sounds/gameover_average.wav');
        break;
      case 'gameover':
        soundFile = require('../assets/sounds/gameover_bad.wav');
        break;
      default:
        return;
    }

    const { sound } = await Audio.Sound.createAsync(soundFile);
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    if (sound) {
      return () => {
        sound.unloadAsync();
      };
    }
  }, [sound]);
  
  // New state for holding shuffled story IDs
  const [shuffledStoryIds, setShuffledStoryIds] = useState([]);

  useEffect(() => {
    fetchPretestStatus();  // Fetch pretest status when the component mounts
  }, []);  // Empty dependency array means it runs once when the component mounts
  
  const fetchPretestStatus = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(collection(db, 'users'), userId);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPretestStatus(userData.difficultyLevels || {}); // Assuming difficultyLevels has each level as an object
        } else {
          console.error('User document does not exist!');
        }
      } else {
        console.error('User is not authenticated');
      }
    } catch (error) {
      console.error('Error fetching pretest status:', error);
    }
  };
  
  
  const handleDifficultySelection = async (difficulty, uid) => {
    setSelectedDifficulty(difficulty);
    const filteredStories = Object.keys(storyMap).filter(storyId => storyMap[storyId].difficulty === difficulty);

  
    if (!pretestStatus) {
      //Replace anamitaion Loading
      console.log('Pretest status is still loading');
      return;
    }
  
    if (pretestStatus[difficulty]?.pretestCompleted === true) {
      navigation.navigate('QuizScreen', { difficulty });
    } else {
      navigation.navigate('PretestScreen', { uid: auth.currentUser?.uid, difficulty });
    }
    
  
    if (filteredStories.length > 0) {
      const randomFilteredStories = shuffleArray(filteredStories);
      setShuffledStoryIds(randomFilteredStories);
      setCurrentStoryId(randomFilteredStories[0]);
      setCurrentQuestionIndex(0);
      setShowQuestions(false);
      setScore(0);
  
      const total = randomFilteredStories.reduce((acc, storyId) => {
        return acc + storyMap[storyId].questions.length;
      }, 0);
      setTotalQuestions(total);
    } else {
      Alert.alert('No stories available', `No stories found for ${difficulty} difficulty.`);
    }
  };
  
  useEffect(() => {
    if (currentStoryId) {
      const currentStory = storyMap[currentStoryId];
      if (currentStory && currentQuestionIndex < currentStory.questions.length) {
        const currentQuestion = currentStory.questions[currentQuestionIndex];
        const shuffled = shuffleArray(currentQuestion.options);
        setShuffledOptions(shuffled);
        const newCorrectIndex = shuffled.findIndex(option => option === currentQuestion.options[currentQuestion.correctAnswerIndex]);
        setCorrectAnswerIndex(newCorrectIndex);
      }
    }
  }, [currentStoryId, currentQuestionIndex, storyMap]);
  
      const handleAnswer = async (index, difficulty) => {
        if (gameOver) {
          return; // Prevent any further actions if the game is over
        }
        
            const userId = auth.currentUser?.uid;
            if (!userId) {
                console.error("User ID is not available");
                return;
            }
        
            // Fetch current XP, level, nextLevelXP, and points from Firestore
            const userDocRef = doc(collection(db, 'users'), userId);
            const userDoc = await getDoc(userDocRef);
        
            if (!userDoc.exists()) {
                console.error("User document not found in Firestore");
                return;
            }
        
            let { currentXP, level, nextLevelXP, points } = userDoc.data();
        
            // Initialize points if it's undefined
            if (points === undefined) {
                points = 0;
            }
        
            if (selectedAnswer === null) {
                setSelectedAnswer(index);
        
                const isAnswerCorrect = index === correctAnswerIndex;
        
                if (!isAnswerCorrect) {
                    loseLife(); // Handle losing a life
                    
                } else {
                    // Determine XP gain based on the difficulty level
                    let xpGain;
                    switch (difficulty) {
                        case 'easy':
                            xpGain = 5;
                            break;
                        case 'medium':
                            xpGain = 10;
                            break;
                        case 'hard':
                            xpGain = 20;
                            break;
                        default:
                            xpGain = 10;
                    }
        
                    // Calculate points based on difficulty and remaining time
                    let pointsGain;
                    if (difficulty === 'easy') {
                        pointsGain = Math.ceil(timeLeft / 2); // Example: 1 point for every 2 seconds left
                    } else if (difficulty === 'medium') {
                        pointsGain = timeLeft; // Example: 1 point per second left
                    } else if (difficulty === 'hard') {
                        pointsGain = timeLeft * 2; // Example: 2 points per second left
                    }
        
                    console.log('Points Gain:', pointsGain);
        
                    // Update local state first
                    let updatedXP = currentXP + xpGain;
                    let updatedPoints = points + pointsGain;
                    let updatedNextLevelXP = nextLevelXP;
                    let newLevel = level;
        
                    // Check if the user has leveled up
                    if (updatedXP >= nextLevelXP) {
                        updatedXP -= nextLevelXP;
                        updatedNextLevelXP += 50;
                        newLevel += 1;
                        console.log('Level up! New level:', newLevel);
                    }
        
                    // Update Firestore with the new values
                    try {
                        await updateDoc(userDocRef, {
                            currentXP: updatedXP,
                            points: updatedPoints,
                            nextLevelXP: updatedNextLevelXP,
                            level: newLevel,
                            lastLevelTimestamp: serverTimestamp(),
                        });
                        console.log('Firestore updated successfully');
                    } catch (error) {
                        console.error("Firestore update error:", error);
                    }
        
                    // Update local state with the new values
                    setCurrentXP(updatedXP);
                    setPoints(updatedPoints);
                    setLevel(newLevel);
                    setNextLevelXP(updatedNextLevelXP);
                }
        
                setIsCorrect(isAnswerCorrect);
                setShowFeedbackModal(true);
                playSound(isAnswerCorrect ? 'correct' : 'wrong');
        
                if (isAnswerCorrect) {
                    setScore(prevScore => prevScore + 1);
                }
            }
      };


  const proceedToNextQuestion = () => {
    setShowFeedbackModal(false);
    setSelectedAnswer(null);
  
    const currentStory = storyMap[currentStoryId];
    if (currentStory) {
      if (currentQuestionIndex + 1 < currentStory.questions.length) {
        // Move to the next question within the current story
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // All questions for the current story have been answered
        const nextStoryIndex = shuffledStoryIds.indexOf(currentStoryId) + 1;
        const averageScore = Math.ceil(totalQuestions / 2); // Calculate average score
        
        if (nextStoryIndex < shuffledStoryIds.length) {
          // Proceed to the next story in the shuffled list
          const nextStoryId = shuffledStoryIds[nextStoryIndex];
          setCurrentStoryId(nextStoryId);
          setCurrentQuestionIndex(0);
          setShowQuestions(false);
          
        } else {
          // Play the final sound based on the score
          if (score === totalQuestions) {
            playSound('congratulations');
          } else if (score >= averageScore) {
            playSound('average');
          } else {
            playSound('gameover');
          }
          const showAlert = (navigation, score, totalQuestions) => {

          // Display the alert
          Alert.alert(
            'Congratulations!',
            `Your final score is ${score} out of ${totalQuestions}`, // Use totalQuestions here
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Home'), // Navigate to Home when 'OK' is pressed
              },
            ]
          );
        };
        }
      }
    }
  };
  const [lives, setLives] = useState(3); // Start with 3 lives

  const tryAgain = () =>{
    if (battery === 0) {
      Alert.alert('Battery Empty', 'Please wait for your battery to recharge before playing.');
      navigation.navigate('Navigation');
    }else{
      setLives(3);
      setGameOver(false);
      setTimeLeft(30);
      setTimerActive(false);
    }
       
  }
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Navigation');
        return true; // Prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );
  const loseLife = () => {
    setLives((prevLives) => {
      if (prevLives > 1) {
        return prevLives - 1; // Decrease lives if more than 1
      } else {
        triggerGameOver(); // Handle game over logic when lives are 0
        return 0; // Ensure lives cannot go below 0
      }
    });
  };
  
  const triggerGameOver = () => {
    setGameOverModalVisible(true); // Show the game over modal
    setTimerActive(false)                // Pause the game
    decreaseBattery();             // Deduct battery
    setGameOver(true);             // Mark the game as over
  };
  
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
  if (error) {
    return <Text>{error}</Text>;
  }

  const currentStory = storyMap[currentStoryId];
  if (!currentStory || currentQuestionIndex >= currentStory.questions.length) {
    return <Text>No quiz available.</Text>;
  }

  const currentQuestion = currentStory.questions[currentQuestionIndex];

  const handlePause = () => {
    setModalVisible(true);
    setTimerActive(false);
  };

  const handleResume = () => {
    setModalVisible(false);
     setTimerActive(true);
  };
  const exitGame = async () => {
  
    // Navigate to the "Games" screen after the sound plays
    navigation.navigate('Navigation');
  };

  return (
    <View style={styles.container}>
        <ImageBackground 
        source={require('../images/bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
      <StatusBar barStyle="light-content" />
      {!selectedDifficulty ? (
      <View style={styles.difficultyContainer}>
      <View style={styles.diffHeader}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={async () => {
          navigation.goBack(); // Navigate back
        }}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      <Text style={styles.difficultyTitle}>Select Difficulty:</Text>
      </View>
      {['easy', 'medium', 'hard'].map((difficulty) => (
        <TouchableOpacity
          key={difficulty}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={async () => {
            handleDifficultySelection(difficulty); // Handle the difficulty selection
          }}
        >
          {/* Your other components inside TouchableOpacity */}
          <Animated.View style={[styles.difficultyButton, { transform: [{ scale: bounceValue }] }]}>
            <LinearGradient
              colors={
                difficulty === 'easy'
                  ? ['#32cd32', '#32cd32']
                  : difficulty === 'medium'
                  ? ['#FF8C00', '#FF6F00']
                  : ['#FF4500', '#E53935']
              }
              style={styles.gradient}
              start={[0, 0]}
              end={[1, 1]}
            >
              <Text style={styles.buttonText}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
      ) : (
        <>
            {!pretestCompleted && showInstructions ?   (
              <ShowInstructions difficulty={selectedDifficulty} onProceed={() => setShowInstructions(false)} />
            ) : (
            <View style ={{marginTop: -25}}>
              <LinearGradient colors={['#050313', '#18164C', '#25276B']} style={styles.header}>
                <View style={{flexDirection: 'row' ,justifyContent: 'flex-start', alignItems: 'center', margin: 20}}>
                <TouchableOpacity style={styles.pauseButton} onPress={async () => { 
                  handlePause(); // Execute the pause function
                }}>
                  <Icon name="pause" size={15} color="#fff" />
                </TouchableOpacity>

                  <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: 55, marginTop: 20}}>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Level 1</Text>
                  </View>
                
                  <View style={styles.heartsContainer}>
                    {[...Array(3)].map((_, index) => (
                      <Icon
                        key={index}
                        name="heart"
                        size={25}
                        color={index < lives ? '#FF6347' : '#bbb'} // Red for active hearts, grey for lost lives
                        style={styles.heart}
                      />
                    ))}
                  </View>
                  </View>
                </View>
                
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.modalBackground}>
                    <View style={styles.PausemodalContainer}>
                      <Image
                        source={require('../images/pause.png')}
                        style={{ width: 150, height: 60, marginTop: -35 }}
                      />
                      
                      <TouchableOpacity
                        style={styles.modalButtonResume}
                        onPress={async () => {
                          handleResume(); // Resume the game
                        }}
                      >
                        <Text style={styles.modalButtonText}>Resume</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.modalButtonExit}
                        onPress={async () => {
                          navigation.goBack(); // Exit the game or navigate back
                        }}
                      >
                        <Text style={styles.modalButtonText}>Exit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={gameOverModalVisible}
                  onRequestClose={() => setGameOverModalVisible(false)} // Close modal on back press
                >
                  <View style={styles.modalBackground}>
                    <View style={styles.GameoverContainer}>
                      <Text style={styles.modalText}>
                        You've lost all your lives! Try again to reset your hearts to full, but your battery will decrease by 10%.
                      </Text>
                      <Text style={styles.modalText}>Battery: {battery}/5</Text>

                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={async () => {
                          setGameOverModalVisible(false); // Close the modal
                          decreaseBattery(); // Decrease battery
                          tryAgain(); // Restart the game
                        }}
                      >
                        <Text style={styles.modalButtonText}>Try Again</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={async () => {
                          setGameOverModalVisible(false); // Close the modal
                          exitGame(); // Exit the game
                        }}
                      >
                        <Text style={styles.modalButtonText}>Exit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

              </LinearGradient>
            <View style = {{justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '80%', height: '80%'}}>
            <ScrollView style={styles.scrollContainer}>
              {!showQuestions ? (
                <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10}}>
                  <View style={styles.ttsButtons}>
                  <TouchableOpacity onPress={handleTTSToggle} style={styles.ttsButton}>
                    <AntDesign
                      name={isSpeaking ? "pausecircle" : "sound"} // Toggle icon based on speaking state
                      size={20}
                      color="#333"
                    />
                   </TouchableOpacity>
                  </View>
                  <Text style={styles.storyTitle}>{currentStory.title}</Text>
                  <Text style={styles.storyText}>{currentStory.text}</Text>
                  <Text style={styles.difficulty}>Difficulty: {currentStory.difficulty}</Text>
                  <TouchableOpacity 
                     onPress={handleStartQuestions} // Handle TTS stop and start questions
                    style={styles.StartQuestionButton}
                  >
                    <Text style={styles.StartQuestionButtonText}>Start Questions</Text>
                  </TouchableOpacity>

                </View>
              ) : (
                <View style={styles.questionContainer}>
                <Text style={styles.question}>{currentQuestion.question}</Text>
                <Text style={[styles.timerText, { color: timeLeft < 10 ? 'red' : 'green' }]}>
                  Time Left: {timeLeft} seconds
                </Text>                 
                {shuffledOptions.map((option, index) => (
                  <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer !== null && (
                      index === selectedAnswer
                        ? (isCorrect ? styles.correctButton : styles.incorrectButton)
                        : styles.defaultButton
                    ),
                  ]}
                  onPress={async () => {
                    handleAnswer(index, selectedDifficulty); // Handle the answer selection
                  }}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>                
                ))}
            
            
                <Text style={styles.score}>Score: {score}</Text>
            
              
                <View style={{backgroundColor: '#00D958', borderWidth: 1, borderRadius: 10, alignSelf: 'flex-start', height: 50, width: 50}}>
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={async () => {
                    handleHint(); // Show the hint when pressed
                  }}
                  disabled={hintVisible} // Disable the hint button once it's shown
                >
                  <Image
                    source={require('../images/shop/idea.png')}
                    style={{alignSelf: 'center', width: 35, height: 35, margin: 10}}
                  />
                  <View style={{alignSelf: 'flex-end', width: 18, height: 18, position: 'absolute', backgroundColor: '#fff', borderRadius: 30, top: 28, margin: 1, borderWidth: 1}}>
                    <Text style={{alignSelf: 'center'}}>5</Text>
                  </View>
                </TouchableOpacity>
                </View>

              </View>
              )}
            </ScrollView>
            </View>
            </View>
          )}
        </>
      )}
      <Modal 
        visible={showFeedbackModal} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
              <LottieView
                source={isCorrect ? require('../assets/check.json') : require('../assets/wrong.json')}
                autoPlay
                loop={false}
                style={styles.animation}
              />
            </Animated.View>
            <Button
              title="Next"
              onPress={async () => {
                proceedToNextQuestion(); // Proceed to the next question
              }}
            />
          </View>
        </View>
      </Modal>
      </ImageBackground>
    </View>
  );

};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  header:{
    height: height * 0.15,
    width: width * 1,
    justifyContent: 'center',
  },
  difficultyContainer: {
    backgroundColor: '#5C51C7', // light background color
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: '45%',
    width: '60%'
  },
  diffHeader:{
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    height: '20%',
    width: '100%'
  },
  difficultyTitle: {
    alignSelf: 'center',
    fontSize: 24,
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
  },
  difficultyButton: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficulty:{
    fontSize: 15,
    fontFamily: 'LilitaOne_400Regular',
    color: 'green'
  },
  gradient:{
    height: 60,
    width: '90%',
    margin: 5,
    top: 20,
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10
  },
  easy: {
    backgroundColor: '#FFDD59',
  },
  medium: {
    backgroundColor: '#FFA726',
  },
  hard: {
    backgroundColor: '#EF5350',
  },
  buttonText: {
    alignSelf: 'center',
    fontSize: 20,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
  },
  scrollContainer: {
    flex: 1,
    margin: 20,
    padding: 5,
    width: width * 0.8,
    height: height * 1.5,
  },
  storyText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'justify',
    paddingHorizontal: 15,
    fontFamily: 'LilitaOne_400Regular',
    marginBottom: 15,
  },
  storyTitle:{
    color: 'green',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 18,
  },
  questionContainer: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F7FA',
    borderRadius: 15,
  },
  question: {
    fontSize: 22,
    color: '#3B5998',
    textAlign: 'center',
    fontFamily: 'LilitaOne_400Regular',
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    backgroundColor: '#FFD54F',
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#fff',
  },
  correctButton: {
    backgroundColor: '#66BB6A',
  },
  incorrectButton: {
    backgroundColor: '#EF5350',
  },
  defaultButton: {
    backgroundColor: '#FFD54F',
  },
  score: {
    fontSize: 20,
    color: '#FF6F00',
    marginTop: 15,
    fontFamily: 'LilitaOne_400Regular',
  },
  GameoverContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  animation: {
    width: 150,
    height: 150,
  },
  StartQuestionButton:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    margin: 10,
    width: 150,
    height: 40,
    borderRadius: 10
  },
  StartQuestionButtonText:{
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LilitaOne_400Regular'
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'red',
    left: 190,
    top: -15,
    height: 30,
    width: 30,
    borderWidth: 1,
    borderRadius: 20
  },
  closeButtonText: {
    fontSize: 20,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
  },
  pauseButton: {
    backgroundColor: '#1C95F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  PausemodalContainer: {
    width: 250,
    padding: 20,
    borderWidth: 5,
    borderColor: '#BB55F1',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalTitleContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 50,
    backgroundColor: '#B9CFDF'
  },
  modalButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  modalButtonResume: {
    backgroundColor: '#02DD02',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 2,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonExit: {
    backgroundColor: '#FD0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 2,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2, 
  },
  levelContainer:{
    backgroundColor: '#9F51FE', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 50, 
    margin: 20, 
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 20

  },
  levelText:{
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 20
  },
  heartsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  heart: {
    marginHorizontal: 5,
  },
  loseLifeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  hintButtonText: {
    fontSize: 16,
    color: '#000',
  },
  hintText: {
    fontSize: 14,
    color: '#FF6347',
    marginTop: 10,
  },
  ttsButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
export default QuizScreen;