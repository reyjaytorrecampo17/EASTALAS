import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';

const instructions = {
  easy: 'This is the easy level. You will be asked simpler questions. Take your time and try to answer as many as you can.',
  medium: 'This is the medium level. The questions will be a bit more challenging. Focus and do your best!',
  hard: 'This is the hard level. Prepare yourself for difficult questions. Be confident and answer carefully.',
};

const ShowInstructions = ({ difficulty, onProceed }) => {
  // Ensure difficulty is provided, default to 'easy' if not
  const validDifficulty = difficulty || 'easy';

  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.instructionsContainer}>
        <Text style={styles.title}>Instructions for {validDifficulty.charAt(0).toUpperCase() + validDifficulty.slice(1)} Level</Text>
        <Text style={styles.instructions}>{instructions[validDifficulty]}</Text>
        <TouchableOpacity onPress={onProceed}
        style = {styles.button}>
          <Text style = {styles.buttonText}>Proceed to Story</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 250,
  },
  title: {
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 20,
    color: 'green',
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 15,
  },
  button:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 10,
    margin: 10,
    width: 150,
    height: 30
  },
  buttonText:{
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 15,
    textShadowColor: 'black',  
    textShadowOffset: { width: 1, height: 1 },  
    textShadowRadius: 2, 
  }
});

export default ShowInstructions;
