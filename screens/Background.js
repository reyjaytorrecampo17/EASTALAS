import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const Background = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in effect
  const videoRef = useRef(null); // Video reference for control
  
  // Start the fade-in animation
  const startFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 second fade-in duration
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
            ref={videoRef}
            source={require('../assets/sounds/Background.mp4')}
            style={styles.videoBackground}
            resizeMode="cover"
            isLooping
            shouldPlay
        />
        </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  videoBackground: {
    width: width,
    height: height,
  },
});

export default Background;
