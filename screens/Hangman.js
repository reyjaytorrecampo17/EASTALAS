import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HangmanGame from './HangmanData'; // Adjust path if needed

const Hangman = () => {
  return (
    <SafeAreaView style={styles.container}>
      <HangmanGame />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Optional background color
  },
});

export default Hangman;
