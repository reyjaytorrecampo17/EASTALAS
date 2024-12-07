import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import CheckBox from 'expo-checkbox';
import { useSound } from './SoundContext'; // Import the sound context


const { width, height } = Dimensions.get('window'); // Get device screen dimensions

const Settings = ({ visible, onClose }) => {
  const { isMusicEnabled, handleMusicEnabledChange, setVolume } = useSound();
  const [volume, setLocalVolume] = useState(0.5); // Local state for immediate feedback

  // PanResponder to make the volume bar interactive
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const newVolume = Math.min(Math.max(gestureState.moveX / width, 0), 1); // Normalize between 0 and 1
      setLocalVolume(newVolume);
      setVolume(newVolume);
    },
    onPanResponderRelease: () => {
      // Optionally handle release events here
    },
  });

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.SettingsmodalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.settingsmodalTitle}>Settings</Text>
          </View>

          {/* Music Control Row */}
          <View style={styles.controlRow}>
            <Text style={styles.musicLabel}>Music</Text>
            <CheckBox
              value={isMusicEnabled}
              onValueChange={(newValue) => {
                handleMusicEnabledChange(newValue);
              }}
              style={styles.checkbox}
            />
          </View>

          {/* Volume Control */}
          <View style={styles.volumeControl}>
            <Text style={styles.volumeLabel}>Volume: {Math.round(volume * 100)}</Text>
            <View style={styles.volumeBar}>
              <View
                style={[styles.volumeButton, { width: `${volume * 100}%` }]}
                {...panResponder.panHandlers} // Attach PanResponder
              />
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  SettingsmodalContainer: {
    backgroundColor: '#9090ff',
    borderRadius: 20,
    alignItems: 'center',
    paddingBottom: height * 0.02,
    width: width * 0.85,
    height: height * 0.45,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderBottomColor: 'white',
    borderRightColor: 'white',
    borderLeftColor: 'white',
  },
  modalHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#635DC2',
    width: '100%',
    height: height * 0.08,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderWidth: 2,
  },
  settingsmodalTitle: {
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: width * 0.05,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginVertical: height * 0.02,
  },
  musicLabel: {
    fontSize: width * 0.07,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  checkbox: {
    marginLeft: width * 0.02,
    transform: [{ scale: width * 0.0035 }],
  },
  volumeControl: {
    width: '90%',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: width * 0.06,
    color: '#fff',
    marginBottom: height * 0.01,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  volumeBar: {
    height: height * 0.03,
    width: '100%',
    backgroundColor: '#8ED1FC',
    borderRadius: 5,
    marginVertical: height * 0.02,
    position: 'relative',
  },
  volumeButton: {
    height: '100%',
    backgroundColor: '#1EB1FC',
    borderRadius: 5,
  },
  closeButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    backgroundColor: 'red',
    borderRadius: 5,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: width * 0.045,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Settings;
