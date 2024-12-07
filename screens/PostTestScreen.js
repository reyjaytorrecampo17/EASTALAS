import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';


const PostTestScreen = ({ level }) => {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [finished, setFinished] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (level % 5 !== 0) {
      setError("Post-test is only available for levels 5, 10, 15, etc.");
      setLoading(false);
      return;
    }

    const checkPostTestCompletion = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        const postTestResults = userDoc.data()?.postTestResults || {};

        if (postTestResults[`level${level}`]) {
          Alert.alert(
            "Test already Completed!",

            [
              {
                text: "Continue",
                onPress: () => navigation.navigate("Home"),
              },
            ]
          );
        } else {
          fetchTotalQuestions();
        }
      } catch (err) {
        console.error("Error checking post-test completion:", err);
      }
    };

    const fetchTotalQuestions = async () => {
      try {
        const postTestId = `postTest${level}`;
        const questionsCollection = collection(db, "postTest", postTestId, "questions");
        const snapshot = await getDocs(questionsCollection);
        setTotalQuestions(snapshot.size);
      } catch (err) {
        setError("Failed to fetch total questions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkPostTestCompletion();
    } else {
      setError("User not authenticated.");
    }
  }, [level, userId]);

  useEffect(() => {
    if (totalQuestions > 0) {
      const fetchQuestion = async () => {
        try {
          setLoading(true);
          const postTestId = `postTest${level}`;
          const questionId = `q${questionIndex}`;
          const questionRef = doc(db, "postTest", postTestId, "questions", questionId);
          const questionSnap = await getDoc(questionRef);

          if (questionSnap.exists()) {
            setQuestion(questionSnap.data());
          } else {
            setError("Question not found.");
            setFinished(true);
          }
        } catch (err) {
          setError("Failed to fetch question.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestion();
    }
  }, [level, questionIndex, totalQuestions]);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const savePostTestResult = async () => {
    const timestamp = new Date().toISOString();
    const postTestResult = {
      [`level${level}`]: {
        score: correctAnswers,
        timestamp: timestamp,
      },
    };

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        postTestResults: postTestResult,
      });
    } catch (err) {
      console.error("Error saving post-test result:", err);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      Alert.alert("No Answer Selected", "Please select an answer before proceeding.");
      return;
    }

    if (selectedAnswer === question.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }

    if (questionIndex < totalQuestions) {
      setQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
      savePostTestResult();
      Alert.alert(
        "Test Completed!",
        `Your score: ${correctAnswers} / ${totalQuestions}`,
        [
          {
            text: "Continue",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {question ? (
        <>
          <Text style={styles.question}>{question.question}</Text>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedAnswer === index && { backgroundColor: '#ddd' }
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text style={styles.optionText}>
                {index + 1}. {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.error}>No question data available.</Text>
      )}
    </View>
  );
};

export default PostTestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    width: '80%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  submitButtonText: {
    fontSize: 18,
    color: 'white',
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});
