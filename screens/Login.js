import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase'; // Adjust the import path if needed
import Checkbox from 'expo-checkbox';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';



const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSelected, setSelection] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  const [buttonScale] = useState(new Animated.Value(1)); // Scale state for animation

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color="#ffffff" />
      </View>
    );
  }

  const handleLogin = async () => {

    if (!isSelected) {
      setModalMessage('Please accept the Terms and Conditions to Login.');
      setModalVisible(true);
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setModalMessage('Please enter a valid email');
      setModalVisible(true);
      return;
    }

    if (password.length < 6) {
      setModalMessage('Password must be at least 6 characters');
      setModalVisible(true);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setModalMessage('The email address is not valid.');
      } else if (error.code === 'auth/user-not-found') {
        setModalMessage('No user found with this email address.');
      } else {
        setModalMessage(error.message);
      }
      setModalVisible(true);
    }
  };

  const handlePrivacyPolicyPress = async () => {

    navigation.navigate('PrivacyPolicy');
  };

  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 1.1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#888"
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.forgotPasswordText} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isSelected}
              onValueChange={(value) => {
            
                setSelection(value);
              }}
              style={styles.checkbox}
            />
            <Text style={styles.label} onPress={handlePrivacyPolicyPress}>
              I have read and accept{' '}
              <Text style={styles.link}>Terms and Conditions</Text> and{' '}
              <Text style={styles.link}>
                Privacy Policy
              </Text>
            </Text>
          </View>
          <Animated.View
            style={[styles.loginButton, { transform: [{ scale: buttonScale }] }]}>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text
            style={styles.registerLink}
            onPress={async () => {
        
              navigation.navigate('RegisterScreen');
            }}
          >
            Don't have an account? <Text style={styles.registerText}>Register Here</Text>
          </Text>

          {/* Custom Modal for Alerts */}
          {isModalVisible && (
            <Modal
              visible={isModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
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
            </Modal>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#9146FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: height * 0.1,
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.99,
    height: height * 0.3,
  },
  input: {
    width: '100%',
    color:'black',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    fontFamily: 'LilitaOne_400Regular',
  },
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#a9a9a9',
    fontSize: width * 0.05,
    marginBottom: 20,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 50,
    width: width * 0.86,
    left: -10,
  },
  checkbox: {
    marginRight: 10,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: 'black',
    top: -7
  },
  label: {
    fontSize: width * 0.05,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  link: {
    color: '#007fff',
    fontSize: width * 0.05,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  loginButton: {
    backgroundColor: '#007fff',
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 50,
    elevation: 10, // Adds a shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow offset
    shadowOpacity: 0.3,
    shadowRadius: 4, // Makes the shadow smoother
    borderBottomWidth: 8, // Adds a bottom border
    borderBottomColor: '#005bb5', // Optional: adds color to the bottom border
    borderWidth: 0.2,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  registerLink: {
    fontSize: width * 0.045,
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  registerText: {
    color: '#19C74A',
    textDecorationLine: 'underline',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContainer: {
    width: '80%', // Adjust as needed
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
