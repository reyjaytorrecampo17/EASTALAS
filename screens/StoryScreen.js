import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const StoryScreen = ({ route, navigation }) => {
  const { unit, userId } = route.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonScale] = useState(new Animated.Value(1));
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track if speech is playing
  const [sound, setSound] = useState(null); // To hold the sound instance

  useEffect(() => {
    // Load the click sound once when the component mounts
    const loadSound = async () => {
      try {
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../assets/sounds/clickmenu.wav')
        );
        setSound(clickSound);
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };
    loadSound();

    // Cleanup on unmount (unload sound)
    return () => {
      sound && sound.unloadAsync();
    };
  }, []);

  const playClickSound = async () => {
    try {
      if (sound) {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleTTSToggle = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(story.text, {
        pitch: 1.5,
        rate: 0.9,
        language: 'en-US',
      });
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if (isSpeaking) Speech.stop();
    };
  }, [isSpeaking]);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyRef = doc(db, `units/unit${unit}`);
        const storySnapshot = await getDoc(storyRef);
        if (storySnapshot.exists()) {
          setStory(storySnapshot.data());
        } else {
          console.error('Story document does not exist');
        }
      } catch (error) {
        console.error('Error fetching story:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [unit]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isSpeaking) Speech.stop();
    setIsSpeaking(false);

    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('UnitScreen', { unit, userId });
    });
  };

  const handleBackPress = () => {
    Speech.stop();
    playClickSound(); // Play sound when going back
    navigation.goBack();
  };

  if (loading) {
    return (
      <LinearGradient colors={['#25276B', '#25276B']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your story...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#25276B', '#25276B']} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            handleBackPress();
            playClickSound(); // Play sound when back button is pressed
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={40} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Story - Unit {unit}</Text>
      </LinearGradient>
      <SafeAreaView style={styles.storyContainer}>
        <TouchableOpacity
          onPress={() => {
            handleTTSToggle();
            playClickSound(); // Play sound when TTS button is pressed
          }}
          style={styles.ttsButton}
        >
          <AntDesign name={isSpeaking ? 'pausecircle' : 'sound'} size={25} color="#FF6347" />
        </TouchableOpacity>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.storyTitle}>{story?.title}</Text>
          <Text style={styles.text}>{story?.text}</Text>
        </ScrollView>
      </SafeAreaView>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.startButton}
          onPress={playClickSound} // Play sound when the button is pressed
        >
          <Text style={styles.startButtonText}>Proceed to Questions</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 25,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontFamily: 'LilitaOne_400Regular',
  },
  storyContainer: {
    flex: 1,
    padding: 20,
  },
  ttsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  startButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 18,
  },
});

export default StoryScreen;
