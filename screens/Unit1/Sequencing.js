import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Modal, Easing, Alert } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const Sequencing = ({ route, navigation }) => {
  const { unit, userId } = route.params;  // Assuming userId is passed as part of route params
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [buttonAnimation] = useState(new Animated.Value(1));  // For button animation
  const [progress, setProgress] = useState(new Animated.Value(0));  // For progress bar animation
  const [showModal, setShowModal] = useState(false);  // To control modal visibility
  const [greetingAnimation] = useState(new Animated.Value(0));  // For greeting animation
  const [showRetryModal, setShowRetryModal] = useState(false);  // To control retry modal visibility
  const [backgroundAnimation] = useState(new Animated.Value(0)); // For background animation

  const totalQuestions = 5; // Assuming we have 5 questions to answer

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'units', `unit${unit}`, 'Sequencing');
        const snapshot = await getDocs(questionsRef);

        if (snapshot.empty) {
          Alert.alert('No Questions', 'No questions found for this unit.');
        } else {
          const fetchedQuestions = snapshot.docs.map((doc) => {
            const data = doc.data();
            return { id: doc.id, ...data };
          });
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Error', 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [unit]);

  const handleAnswerSelection = async (selectedOptionIndex, correctOptionIndex) => {
    // Button animation for feedback
    Animated.sequence([
      Animated.timing(buttonAnimation, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(buttonAnimation, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();

    if (selectedOptionIndex === correctOptionIndex) {
      // Show the modal with "Great job!" message
      setShowModal(true);
      Animated.spring(greetingAnimation, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      }).start();

      // Proceed to next question after a short delay
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          animateProgress(); // Update progress bar
        } else {
          // If all questions are answered, update completion status and exit
          updateTopicCompletion();
          Alert.alert("Congratulations!", "You've completed all questions.");
          navigation.goBack(); // Exit the sequencing screen or navigate to another screen
        }
        setShowModal(false);  // Hide modal after delay
      }, 1500); // Delay before proceeding to next question
    } else {
      // Show retry modal when the answer is incorrect
      setShowRetryModal(true);
    }
  };

  const handleRetry = () => {
    setShowRetryModal(false); // Close retry modal
  };

  const updateTopicCompletion = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }
  
    try {
      const userRef = doc(db, 'users', userId);
      const fieldName = `Sequencing${unit}`;
      
      await updateDoc(userRef, {
        [fieldName]: true,
      });
  
      console.log(`Successfully updated completion for Unit ${unit}`);
    } catch (error) {
      console.error('Error updating user completion:', error);
      Alert.alert('Error', 'Failed to update completion status. Please try again.');
    }
  };
  

  // Animate the progress bar
  const animateProgress = () => {
    Animated.timing(progress, {
      toValue: (currentQuestionIndex + 1) / totalQuestions, // Update progress value
      duration: 500, // Duration for animation
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  // Animate background color when showing retry modal
  const animateBackground = () => {
    Animated.timing(backgroundAnimation, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noQuestionsText}>No questions available.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unit {unit} Sequencing</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: `${progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })}` }]} />
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option, index) => (
          <Animated.View key={index} style={{ transform: [{ scale: buttonAnimation }] }}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAnswerSelection(index, currentQuestion.correctOption)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.counterText}>{`${currentQuestionIndex + 1} of ${totalQuestions} questions answered`}</Text>

      {/* Custom Modal for Correct Answer */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: greetingAnimation }] }]}>
            <Text style={styles.modalTitle}>Great Job!</Text>
            <Text style={styles.modalMessage}>You selected the correct answer!</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* Retry Modal for Incorrect Answer */}
      <Modal
        transparent={true}
        visible={showRetryModal}
        animationType="fade"
        onRequestClose={() => setShowRetryModal(false)}
      >
        <Animated.View
          style={[styles.modalBackground, { backgroundColor: backgroundAnimation.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0, 0, 0, 0.5)', 'rgba(231, 76, 60, 0.7)'] }) }]}>
          <View style={styles.retryModalContainer}>
            <Text style={styles.retryModalTitle}>Oops! Incorrect</Text>
            <Text style={styles.retryModalMessage}>Do you want to retry the question?</Text>
            <View style={styles.retryModalButtonsContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f4f6f9', 
    justifyContent: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#2c3e50', 
    textAlign: 'center',
    fontFamily: 'Arial', 
  },
  progressBarContainer: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#e6e6e6', 
    borderRadius: 5, 
    marginBottom: 20,
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: '#3498db', 
    borderRadius: 5,
  },
  questionContainer: { marginBottom: 20 },
  questionText: { 
    fontSize: 18, 
    color: '#34495e', 
    marginBottom: 15, 
    textAlign: 'center', 
  },
  optionButton: { 
    backgroundColor: '#3498db', 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5, 
    alignItems: 'center',
  },
  optionText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: 'bold',
  },
  counterText: { 
    fontSize: 16, 
    color: '#7f8c8d', 
    textAlign: 'center',
  },
  modalBackground: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: { 
    width: 250, 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    alignItems: 'center',
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#2ecc71', 
  },
  modalMessage: { 
    fontSize: 18, 
    color: '#2ecc71', 
    textAlign: 'center', 
  },
  retryModalContainer: { 
    width: 250, 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    alignItems: 'center',
  },
  retryModalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#e74c3c', 
    marginBottom: 10, 
  },
  retryModalMessage: { 
    fontSize: 16, 
    color: '#e74c3c', 
    textAlign: 'center', 
    marginBottom: 20, 
  },
  retryModalButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
  },
  retryButton: { 
    backgroundColor: '#e74c3c', 
    padding: 10, 
    borderRadius: 5, 
    width: 100, 
    alignItems: 'center',
  },
  retryButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#2c3e50',
  },
  noQuestionsText: { 
    fontSize: 18, 
    color: '#7f8c8d', 
    textAlign: 'center', 
  },
});

export default Sequencing;