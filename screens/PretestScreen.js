import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PretestScreen = ({ route, navigation }) => {
  const { uid, difficulty } = route?.params || {};

  if (!uid || !difficulty) {
    Alert.alert('Error', 'User ID or difficulty not found.');
    return null;
  }

  const [pretestCompleted, setPretestCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [story, setStory] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (uid && difficulty) {
      fetchPretestStatus();
    }
  }, [uid, difficulty]);

  const fetchPretestStatus = async () => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const pretestStatus = userData.difficultyLevels?.[difficulty]?.pretestCompleted;

        setPretestCompleted(pretestStatus);

        if (pretestStatus) {
          navigation.replace('QuizScreen', { difficulty, uid });
        } else {
          fetchQuestions();
          fetchStory();
        }
      } else {
        console.error('User does not exist');
        setPretestCompleted(false);
      }
    } catch (error) {
      console.error('Error fetching pretest status:', error);
      Alert.alert('Error', `Could not fetch pretest status: ${error.message}`);
    }
  };

  const fetchQuestions = async () => {
    try {
      const pretestRef = doc(db, 'pretest', difficulty);
      const pretestSnap = await getDoc(pretestRef);

      if (pretestSnap.exists()) {
        const pretestData = pretestSnap.data();
        const fetchedQuestions = pretestData.questions.map((item) => ({
          id: item.id,
          question: item.question,
          options: item.options,
          correctAnswer: item.options[item.correctAnswerIndex],
        }));

        setQuestions(fetchedQuestions);
      } else {
        console.error('Pretest data for this difficulty does not exist');
        Alert.alert('Error', 'Pretest data not found.');
      }
    } catch (error) {
      console.error('Error fetching pretest questions:', error);
      Alert.alert('Error', `Could not fetch pretest questions: ${error.message}`);
    }
  };

  const fetchStory = async () => {
    try {
      const pretestRef = doc(db, 'pretest', difficulty);
      const pretestSnap = await getDoc(pretestRef);

      if (pretestSnap.exists()) {
        const pretestData = pretestSnap.data();
        const fetchedStory = pretestData.story;
        setStory(fetchedStory);
      } else {
        console.error('Story data for this difficulty does not exist');
        Alert.alert('Error', 'Story data not found.');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      Alert.alert('Error', `Could not fetch story: ${error.message}`);
    }
  };

  const handleAnswerChange = (answer) => {
    const questionId = questions[currentQuestionIndex].id;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === questions.length) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          [`difficultyLevels.${difficulty}.pretestCompleted`]: true,
        });

        Alert.alert('Success', 'Your pretest has been completed!');
        setPretestCompleted(true);
        navigation.replace('QuizScreen', { difficulty, uid });
      } catch (error) {
        Alert.alert('Error', `Could not submit your answers: ${error.message}`);
      }
    } else {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('QuizScreen');
        return true; // Prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  if (pretestCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.completedText}>
          You have already completed the pretest for {difficulty}!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!showQuestions ? (
        <>
          <Text style={styles.header}>Pretest - {difficulty}</Text>
          <Text style={styles.storyText}>{story}</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setShowQuestions(true)}
          >
            <Text style={styles.submitText}>Proceed to Questions</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.questionText}>
            {questions[currentQuestionIndex]?.question}
          </Text>
          {questions[currentQuestionIndex]?.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answers[questions[currentQuestionIndex].id] === option &&
                  styles.selectedOption,
              ]}
              onPress={() => handleAnswerChange(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.navigationButtons}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handlePreviousQuestion}
              >
                <Text style={styles.submitText}>Previous</Text>
              </TouchableOpacity>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.submitText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Answers</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#9146FF',
  },
  gamesButton: {
    backgroundColor: '#00BFFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  storyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'justify',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#02EB02',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#ff6347',
  },
  optionText: {
    color: '#000',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
  },
  completedText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  proceedButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default PretestScreen;
