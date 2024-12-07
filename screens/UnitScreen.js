import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { useFonts, LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

const auth = getAuth();
const { width, height } = Dimensions.get('window');

const UnitScreen = ({ navigation, route }) => {
  const { unit } = route.params;

  // Get the current user
  const user = auth.currentUser;

  if (!user) {
    Alert.alert('Error', 'User is not authenticated. Please login again.');
    navigation.navigate('Login'); // Navigate to login screen if not authenticated
    return null; // Return null here to avoid rendering the component
  }

  const userId = user.uid; // Use user ID here

  const [scale] = useState(new Animated.Value(1));
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  const lessons = [
    { id: 'ShortVowels', title: `Unit ${unit} - Short Vowels`, icon: 'text' },
    { id: 'Sequencing', title: `Unit ${unit} - Sequencing`, icon: 'list' },
    { id: 'MainIdea', title: `Unit ${unit} - Main Idea`, icon: 'bulb' },
    { id: 'Vocabulary', title: `Unit ${unit} - Vocabulary`, icon: 'book' },
  ];

  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/clickmenu.wav'));
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPress = () => {
    playClickSound();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050313', '#9747FF', '#25276B']} style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={40} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Unit {unit} Lessons</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {lessons.map((lesson, index) => (
          <Animated.View
            key={lesson.id}
            style={[styles.lessonContainer, { transform: [{ scale }] }]}>
            <TouchableOpacity
              onPressIn={() => {
                handlePressIn();
                playClickSound();
              }}
              onPressOut={() => handlePressOut()}
              onPress={() => navigation.navigate(lesson.id, { unit, userId })}
              style={[styles.button, styles[`gradient${index % 4}`]]}>
              <Ionicons name={lesson.icon} size={35} color="#FFF" style={styles.icon} />
              <Text style={styles.lessonText}>{lesson.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25276B',
  },
  header: {
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    paddingTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 20,
    padding: 10,
  },
  title: {
    fontSize: width * 0.08,
    color: '#FFF',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  contentContainer: {
    padding: 20,
  },
  lessonContainer: {
    marginVertical: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    height: height * 0.13,
  },
  lessonText: {
    fontSize: width * 0.06,
    color: '#FFF',
    marginLeft: 15,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  icon: {
    marginRight: 10,
  },
  gradient0: {
    backgroundColor: '#FF6F61',
  },
  gradient1: {
    backgroundColor: '#4FC3F7',
  },
  gradient2: {
    backgroundColor: '#81C784',
  },
  gradient3: {
    backgroundColor: '#FFB74D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UnitScreen;
