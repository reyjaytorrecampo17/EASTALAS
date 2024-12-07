import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

import LottieView from 'lottie-react-native'; // Import Lottie
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const { width, height } = Dimensions.get('window');

const Games = () => {
  const navigation = useNavigation(); // Use the useNavigation hook
  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  // Loading screen
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Context Clues Button */}
      <TouchableOpacity
        style={styles.btnQuiz}
        onPress={async () => {
          navigation.navigate('QuizScreen'); // Navigate to QuizScreen
        }}
      >
        <LinearGradient colors={['#CD11FC', '#E26DFF', '#E26DFF', '#CD11FC']} style={styles.gradient}>
          <LottieView 
            source={require('../assets/search.json')} 
            autoPlay 
            loop 
            style={styles.animation}
          />
          <Text style={styles.outlineText}>Context Clues</Text>
          <Text style={styles.btnText}>Context Clues</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Story Adventure Button */}
      <TouchableOpacity
        style={styles.btnQuiz}
        onPress={async () => {
          navigation.navigate('Hangman'); // Navigate to Hangman
        }}
      >
        <LinearGradient colors={['#0000FF', '#1E90FF', '#87CEFA', '#0000FF']} style={styles.gradient}>
          <LottieView 
            source={require('../assets/compass.json')} 
            autoPlay 
            loop 
            style={styles.animation}
          />
          <Text style={styles.outlineText}>Story Adventure</Text>
          <Text style={styles.btnText}>Story Adventure</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* CrossWord Button */}
      <TouchableOpacity
        style={styles.btnQuiz}
        onPress={async () => {
          navigation.navigate('CrossWord'); // Navigate to CrossWord
        }}
      >
        <LinearGradient colors={['#008C0E', '#6BF36B', '#6BF36B', '#008C0E']} style={styles.gradient}>
          <LottieView 
            source={require('../assets/crossWord.json')} 
            autoPlay 
            loop 
            style={styles.animation}
          />
          <Text style={styles.outlineText}>CrossWord</Text>
          <Text style={styles.btnText}>CrossWord</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center', // Aligns the content vertically
  },
  btnQuiz: {
    width: width * 0.9,
    height: height * 0.2,
    marginTop: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  outlineText: {
    fontSize: width * 0.1,
    fontFamily: 'LilitaOne_400Regular',
    position: 'absolute',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    color: 'white',
    textAlign: 'center',
    zIndex: 1,
  },
  btnText: {
    fontSize: width * 0.097,
    height: height * 0.07,
    fontFamily: 'LilitaOne_400Regular',
    textAlign: 'center',
  },
  icon: {
    height: height * 0.15,
    width: width * 0.3,
    position: 'absolute',
    margin: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9C59FE',
  },
  animation: {
    width: 180,
    height: 180,
    marginTop:-20,
    position:'absolute',
    backgroundColor: 'transparent'
  },
});

export default Games;