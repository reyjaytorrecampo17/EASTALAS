import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator  } from '@react-navigation/native-stack';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

import { db } from './services/firebase'; // Correct Firebase firestore import
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import Navigation from './navigation/Navigation';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/RegisterScreen';
import PostTestScreen from './screens/PostTestScreen';
import ShortVowels from './screens/Unit1/ShortVowels';
import CrossWord from './screens/CrossWord';
import Sequencing from './screens/Unit1/Sequencing';
import MainIdea from './screens/Unit1/MainIdea';
import Shop from './screens/Shop';
import LessonScreen from './screens/LessonScreen';
import TalasBooks from './screens/TalasBooks';
import ProfileScreen from './screens/ProfileScreen';
import QuizScreen from './screens/QuizScreen';
import PretestScreen from './screens/PretestScreen';
import UnitScreen from './screens/UnitScreen';
import Vocabulary from './screens/Unit1/Vocabulary';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import PrivacyPolicy from './screens/PrivacyPolicy';
import Hangman from './screens/Hangman';
import Games from './tabs/Games';
import StoryScreen from './screens/StoryScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import { LevelProvider } from './context/LevelContext';
import { SoundProvider } from './screens/SoundContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch user data from Firebase
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid); // Set userId
        fetchUserData(currentUser.uid); // Fetch user data
      } else {
        setUser(null); // Set user as null when logged out
        setUserId(null);
      }
    });
  
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, []); // This only runs once when the component mounts
  
  // Fetch user data based on the current userId
  const fetchUserData = async (uid) => {
    try {
      setLoading(true);
  
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        setLevel(userSnap.data().level); // Set the level from Firestore
      } else {
        setError('User data not found.');
      }
    } catch (err) {
      setError('Failed to fetch user data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <SoundProvider>
      <LevelProvider>
        <NavigationContainer>
        <Stack.Navigator initialRouteName={user && level ? 'Navigation' : 'Login'}> 
            {user ? (
              <Stack.Screen
                name="Navigation"
                component={Navigation}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="RegisterScreen"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}

            <Stack.Screen name="PostTestScreen" options={{ headerShown: false }}>
              {(props) => <PostTestScreen {...props} level={level} userId={userId} />}
              
            </Stack.Screen>

            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name = "StoryScreen" component={StoryScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="ShortVowels" component={ShortVowels}options={{ headerShown: false }} />
            <Stack.Screen name="CrossWord" component={CrossWord} options={{ headerShown: false }}/>
            <Stack.Screen name="Sequencing" component={Sequencing}options={{ headerShown: false }} />
            <Stack.Screen name="MainIdea" component={MainIdea} options={{ headerShown: false }}/>
            <Stack.Screen name="Shop" component={Shop} options={{ headerShown: false }}/>
            <Stack.Screen name="Lessons" component={LessonScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="TalasBooks" component={TalasBooks} options={{ headerShown: false }}/>
            <Stack.Screen name="ProfileScreen" component={ProfileScreen}options={{ headerShown: false }} />
            <Stack.Screen name="QuizScreen" component={QuizScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PretestScreen" component={PretestScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="UnitScreen" component={UnitScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Vocabulary" component={Vocabulary} options={{ headerShown: false }}/>
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }}/>
            <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }}/>
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false }}/>
            <Stack.Screen name="Hangman" component={Hangman}options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </LevelProvider>
    </SoundProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});
