import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for back arrow

const { width, height } = Dimensions.get('window');

const LessonScreen = ({ navigation , userId}) => {
  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1)); // Scale animation for buttons
  const [closeAnim] = useState(new Animated.Value(1)); // Scale animation for the close button

  const auth = getAuth();

  // Load sound effect
  const [sound, setSound] = useState();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/clickmenu.wav'));
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Clean up sound
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            setStatuses(userSnapshot.data());
          } else {
            console.error('User document does not exist');
          }
        } else {
          console.error('No user is logged in');
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={50} color="#0000ff" />
      </View>
    );
  }

  const isUnit2Locked =
    !statuses.ShortVowelsCompleted1 ||
    !statuses.Sequencing1 ||
    !statuses.mainIdeaCompleted1 ||
    !statuses.vocabularyCompleted1;

  const isUnit3Locked =
    !statuses.ShortVowelsCompleted2 ||
    !statuses.Sequencing2 ||
    !statuses.mainIdeaCompleted2 ||
    !statuses.vocabularyCompleted2;

  const isUnit4Locked =
    !statuses.ShortVowelsCompleted3 ||
    !statuses.Sequencing3 ||
    !statuses.mainIdeaCompleted3 ||
    !statuses.vocabularyCompleted3;

  const handlePressIn = (anim) => {
    Animated.spring(anim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim, callback) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    playSound();
    if (callback) callback();
  };

  const renderUnitButton = (unit, isLocked, onPress) => (
    <TouchableWithoutFeedback
      onPressIn={() => handlePressIn(scaleAnim)}
      onPressOut={() => handlePressOut(scaleAnim, isLocked ? null : onPress)}
      disabled={isLocked} // Disable touch interaction if the unit is locked
    >
      <Animated.View
        style={[
          styles.unitContainer,
          isLocked ? styles.lockedUnit : styles.unlockedUnit,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={isLocked ? ['#8e8e8e', '#585858'] : ['#FF7E5F', '#FEB47B']}
          style={styles.gradient}
        >
          
          <View style={styles.unitTextWrapper}>
            <Text style={styles.unitText}>{`Unit ${unit}`}</Text>
            {isLocked && <Text style={styles.lockedText}>Locked</Text>}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
  
   

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050313', '#25276B']} style={styles.header}>
        <View style={styles.header}>
          <Text style={styles.title}>Lessons</Text>
        </View>
        <View style={styles.statsContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => handlePressIn(closeAnim)}
            onPressOut={() => handlePressOut(closeAnim, () => navigation.goBack())}
          >
            <Animated.View
              style={[styles.closeButton, { transform: [{ scale: closeAnim }] }]}
            >
           
              <Ionicons name="arrow-back" size={40} color="#FFF" /> 
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </LinearGradient>
      {renderUnitButton(1, false, () => navigation.navigate('StoryScreen', { unit: 1 , userId}))}
      {renderUnitButton(2, isUnit2Locked, () => navigation.navigate('StoryScreen', { unit: 2 , userId}))}
      {renderUnitButton(3, isUnit3Locked, () => navigation.navigate('StoryScreen', { unit: 3 , userId}))}
      {renderUnitButton(4, isUnit4Locked, () => navigation.navigate('StoryScreen', { unit: 4 , userId}))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#25276B',
  },
  header: {
    height: 130,
    width: '100%',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    alignSelf: 'center',
    fontSize: 30,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
    margin: 10,
    top: 20,
  },
  statsContainer: {
    position: 'absolute',
    top: 40, // Adjust to position the back arrow correctly
    left: 10,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  unitContainer: {
    width: '90%',
    height: '15%',
    marginTop: 25,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedUnit: {
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  lockedUnit: {
    borderWidth: 1,
    borderColor: '#8e8e8e',
  },
  unitText: {
    fontSize: 24,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
  },
  unitTextWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 16,
    color: 'red',
    marginTop: 5,
  },
});

export default LessonScreen;