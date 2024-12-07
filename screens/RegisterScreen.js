import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc ,serverTimestamp} from 'firebase/firestore';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';


const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
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

  const handleRegister = async () => {

    if (!email || !password) {
      setModalMessage('Please enter both email and password');
      setModalVisible(true);
      return;
    }
    if (password.length < 6) {
      setModalMessage('Password must be at least 6 characters long');
      setModalVisible(true);
      return;
    }
    if (password !== confirmPassword) {
      setModalMessage('Passwords do not match.');
      setModalVisible(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const generatedIGN = `${firstName}_${Math.floor(1000 + Math.random() * 9000)}`;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName,
        lastName,
        age: parseInt(age),
        ign: generatedIGN,
        level: 1,
        streak :1,
        gems:1,
        battery: 5,
        lastLoginDate: serverTimestamp(),
        difficultyLevels: { easy: { pretestCompleted: false }, medium: { pretestCompleted: false }, hard: { pretestCompleted: false } },
        currentXP: 0,
        nextLevelXP: 150,
      });

      setModalMessage('Registration successful! Welcome to TALAS!');
      setModalVisible(true);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Navigation', params: { uid: user.uid } }],
      });
    } catch (error) {
      console.error('Error registering:', error.code, error.message);
      let errorMessage;
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use by another account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      setModalMessage(errorMessage);
      setModalVisible(true);
    }
  };

  const [buttonScale] = useState(new Animated.Value(1)); // Scale state for animation

  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 1.1, // Scale up slightly
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1, // Reset to original size
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Image source={require('../images/registerlogo.png')} style={styles.logo} />
      <View style={styles.nameContainer}>
        <TextInput
          placeholder="First Name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.inputName}
        />
        <TextInput
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
          style={styles.inputName}
        />
      </View>
      <TextInput
        placeholder="Age"
        placeholderTextColor="#888"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />
      <Animated.View
        style={[
          styles.registerButtonWrapper,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.registerButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text
        style={styles.loginText}
        onPress={async () => {
          navigation.navigate('Login');
        }}
      >
        Already have an account?{' '}
        <Text style={styles.loginLink}>Login</Text>
      </Text>

      {/* Custom Modal for Alerts */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
    backgroundColor: '#9146FF',
  },
  logo: {
    width: width * 0.99,
    height: height * 0.3,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputName: {
    flex: 1,
    marginHorizontal: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    height: height * 0.06,
    paddingHorizontal: 10,
    fontFamily: 'LilitaOne_400Regular',
  },
  input: {
    borderColor: '#ddd',
    color:'black',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    height: height * 0.06,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontFamily: 'LilitaOne_400Regular',
  },
  registerButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#02DB02', // Background color of the button
    borderRadius: 25, // Rounded corners
    paddingVertical: 15, // Vertical padding
    elevation: 10, // Adds shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 4, // Makes the shadow smoother
    width: '80%', // Width of the button
    marginBottom: 50, // Space below the button
    borderBottomWidth: 8, // Adds a bottom border
    borderBottomColor: '#019B01', // Optional color for bottom border
    borderWidth: 0.2,
    alignSelf:'center',
    marginTop: 20,
  },
  
  registerButton: {
    width: '100%', // Full width inside the wrapper
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25, // Rounded corners (same as wrapper)
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  loginText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 15,
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 20,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  loginLink: {
    color: '#007fff',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#6C3483',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9146FF',
  },
});
