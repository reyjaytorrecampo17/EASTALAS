import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const MainIdea = ({ route, navigation }) => {
  const { unit, userId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation for question fading
  const [scaleAnim] = useState(new Animated.Value(1)); // Button animation for scaling
  const [alertAnim] = useState(new Animated.Value(0)); // Animation for alert scaling

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'units', `unit${unit}`, 'MainIdea');
        const snapshot = await getDocs(questionsRef);
        if (snapshot.empty) {
          Alert.alert('No Questions', 'No questions found for this unit.');
        } else {
          setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
    if (selectedOptionIndex === correctOptionIndex) {
      // Correct Answer Animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 2,
          useNativeDriver: true,
        }),
      ]).start();

      // Show "Good Job" alert with animation
      Animated.timing(alertAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Alert.alert('Good Job!', 'You selected the correct answer.', [
        {
          text: 'Next',
          onPress: handleNext,
        },
      ]);
    } else {
      // Incorrect Answer Animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          friction: 2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 2,
          useNativeDriver: true,
        }),
      ]).start();

      // Show "Retry" alert with animation
      Animated.timing(alertAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Alert.alert('Retry!', 'Please try again.');
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);  // Increment the question index
    } else {
      // All questions have been answered, update completion status in Firestore
      await updateTopicCompletion();
      Alert.alert('Quiz Complete', 'You have completed this quiz!');
      navigation.goBack();  // Navigate back after quiz completion
    }
  };
  const updateTopicCompletion = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }
  
    try {
      const userRef = doc(db, 'users', userId);
      const fieldName = `mainIdeaCompleted${unit}`;
      
      await updateDoc(userRef, {
        [fieldName]: true,
      });
  
      console.log(`Successfully updated completion for Unit ${unit}`);
    } catch (error) {
      console.error('Error updating user completion:', error);
      Alert.alert('Error', 'Failed to update completion status. Please try again.');
    }
  };
  

  // Fade in question animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
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
      <Text style={styles.title}>Unit {unit} Main Idea</Text>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{`${currentQuestionIndex + 1} / ${questions.length} Questions`}</Text>
      </View>

      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option, index) => (
          <Animated.View
            key={index}
            style={{ transform: [{ scale: scaleAnim }] }}  // Apply scaling animation to buttons
          >
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAnswerSelection(index, currentQuestion.correctOption)}  // Compare selected answer with correct answer
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E6F5E6' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#228B22', textAlign: 'center' },
  
  // Progress Container and Text
  progressContainer: { marginBottom: 10, alignItems: 'center' },
  progressText: { fontSize: 16, color: '#228B22', fontWeight: '500' },

  // Question Styling
  questionContainer: { marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  questionText: { fontSize: 22, marginBottom: 10, fontWeight: '500', color: '#333', textAlign: 'center' },

  // Button Styling
  optionButton: {
    backgroundColor: '#32CD32', // Smooth Green
    padding: 15, 
    marginVertical: 10, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  optionText: { fontSize: 18, color: '#fff', fontWeight: '600' },

  // Loading and No Questions
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  noQuestionsText: { fontSize: 16, textAlign: 'center', color: '#888' },
});

export default MainIdea;