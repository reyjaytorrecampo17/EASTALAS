import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { Ionicons } from '@expo/vector-icons';

const TalasBooks = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={50} color="#9747FF" />
      </View>
    );
  }

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050313', '#18164C', '#25276B']} style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={35} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>
      <View>
        
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9747FF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9747FF',
  },
  header: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 35,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
    marginTop: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 30,
    padding: 10,
    borderRadius: 50,
    elevation: 3,
  },
});

export default TalasBooks;
