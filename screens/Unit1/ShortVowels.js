import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ShortVowels = ({ route, navigation }) => {
  const { unit, userId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'units', `unit${unit}`, 'ShortVowels');
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
      Alert.alert('Correct!', 'You selected the correct answer.', [
        {
          text: 'Next',
          onPress: handleNext,
        },
      ]);
    } else {
      Alert.alert('Incorrect!', 'Please try again.');
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await updateTopicCompletion();
      Alert.alert('Quiz Complete', 'You have completed this quiz!');
      navigation.goBack();
    }
  };

  const updateTopicCompletion = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }
  
    try {
      const userRef = doc(db, 'users', userId);
      const fieldName = `ShortVowelsCompleted${unit}`;
      
      await updateDoc(userRef, {
        [fieldName]: true,
      });
  
      console.log(`Successfully updated completion for Unit ${unit}`);
    } catch (error) {
      console.error('Error updating user completion:', error);
      Alert.alert('Error', 'Failed to update completion status. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4e73df" />
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
      <Text style={styles.title}>Unit {unit} Short Vowels</Text>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswerSelection(index, currentQuestion.correctOption)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: '700', color: '#333', marginBottom: 20, textAlign: 'center' },
  questionContainer: { marginBottom: 30, alignItems: 'center' },
  questionText: { fontSize: 20, fontWeight: '500', marginBottom: 15, color: '#555' },
  optionButton: {
    backgroundColor: '#4e73df',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 3, // Adding shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  optionText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  noQuestionsText: { fontSize: 16, textAlign: 'center', color: '#888' },
});

export default ShortVowels;