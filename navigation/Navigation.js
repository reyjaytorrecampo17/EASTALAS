import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, Switch, Dimensions  } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient
import * as Animatable from 'react-native-animatable'; // Animations
import Leaderboards from '../tabs/Leaderboards';
import Games from '../tabs/Games';
import Dictionary from '../tabs/Dictionary';
import Profile from '../tabs/Profile';
import Home from '../tabs/Home';
import * as Progress from 'react-native-progress'; // For Progress Bars
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth,db } from '../services/firebase'// Ensure this path is correct
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot ,getDoc ,updateDoc,serverTimestamp} from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Settings from '../screens/Settings';
import Notifications from '../screens/Notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../screens/Background';



const { width, height } = Dimensions.get('window');

const Tab = createBottomTabNavigator();

// Custom Animated Icon Component with Realistic Image Icons
const AnimatedIcon = ({ source, focused }) => {
  const animation = focused ? 'bounceIn' : undefined; // Add bounce animation
  const size = focused ? 40 : 35; // Icon sizes

  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={50} color="#0000ff" />
      </View>
    );
  }

  return (
    <Animatable.View animation={animation} duration={800} useNativeDriver={true}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </Animatable.View>
  );
};


const ProfileHeader = ({ userId }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ign, setIgn] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sound, setSound] = useState();
  const [battery, setBattery] = useState(5);
  const [notifications, setNotifications] = useState([]);

// Define the background task for battery refresh
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Periodic battery refresh triggered.');
    refreshBattery();
  }, 60000); // Check every minute
  return () => clearInterval(interval); // Cleanup on unmount
}, []);

// Function to fetch battery state
const fetchBattery = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn('No user logged in.');
      return;
    }

    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      console.log('Fetched battery:', userData.battery);
      setBattery(userData.battery || 5); // Default to 5 if undefined
    } else {
      console.warn('No user data found in Firestore.');
    }
  } catch (error) {
    console.error('Failed to fetch battery:', error);
  }
};

// Function to refresh the battery
const refreshBattery = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn('No user logged in.');
      return;
    }

    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const lastUpdated = userData.lastBatteryUpdated?.toDate() || new Date(0);
      const now = new Date();
      const timeElapsed = (now - lastUpdated) / 60000; // Time in minutes

      // Temporary change: reduce time interval for testing
      if (timeElapsed >= 1) { // Use 1 minute for testing
        let refreshedBattery = Math.min(userData.battery + 1, 5); // Increment, cap at 5
        await updateDoc(userRef, {
          battery: refreshedBattery,
          lastBatteryUpdated: serverTimestamp(),
        });
        console.log('Battery refreshed to:', refreshedBattery);
        setBattery(refreshedBattery); // Update state

        // Trigger notification if battery is refreshed from 4 to 5
        if (userData.battery === 4 && refreshedBattery === 5) {
          console.log('Battery refreshed from 4 to 5, adding notification.');
          addNotification('Battery fully refreshed!', 'Your battery is now at maximum.');
        }
      } else {
        console.log('Battery not updated. Time elapsed is less than 1 minute.');
      }
    }
  } catch (error) {
    console.error('Failed to refresh battery:', error);
  }
};

// Notification function to handle user alerts
const addNotification = (title, message) => {
  // Add logic to display notification
  console.log(title, message);
};

// Fetch battery state on component mount
useEffect(() => {
  fetchBattery();
}, []);



  const toggleBackgroundMusic = () => {
    setIsBackgroundMusicEnabled(prevState => !prevState);
  };
  const handleVolumeChange = (volume) => {
    setMusicVolume(volume);
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  };
  
  useEffect(() => {
    if (!userId) {
      console.error('No userId provided');
      setError('User ID is missing.');
      setLoading(false);
      return;
    }

  

    const userDocRef = doc(db, 'users', userId);
  
    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const userProfilePicture = userData.profilePicture || '';
          setIgn(userData.ign || 'Guest'); // Set user's IGN
          setPoints(userData.points || 0); // Set user's current XP as points
          setLevel(userData.level || 0); // Set user's level
          setProgress(userData.currentXP / userData.nextLevelXP || 0); // Calculate progress
          setBattery(userData.battery || 5);
          setProfilePicture(userData.profilePicture || '');
          setProfilePicture(userProfilePicture);
          setLoading(false); 
        } else {
          console.log('No such user!');
          setError('No such user!');
          
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to user data:', err);
        setError('Failed to listen to user data.');
        setLoading(false);
      }
    );
  
    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      // Reset dropdown when the screen is focused
      setDropdownVisible(false);

      return () => {
        // Cleanup if needed when leaving the screen
        setDropdownVisible(false);
      };
    }, [])
  );
  useEffect(() => {
    const checkLevelAndNavigate = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem('currentLevel');
        const currentLevel = parseInt(storedLevel || '0', 10);
        setLevel(currentLevel);

        if (currentLevel % 5 === 0 && currentLevel !== 0) {
          const postTestCompleted = await AsyncStorage.getItem(`postTestCompletedLevel${currentLevel}`);
          if (!postTestCompleted) {
            navigation.navigate('PostTestScreen', { level: currentLevel });
          }
        }
      } catch (error) {
        console.error('Error checking post-test status:', error);
      }
    };

    checkLevelAndNavigate();
  }, [navigation]);
  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  const toggleSettingsModal = () => {
    setSettingsModalVisible(!settingsModalVisible);
  };

  const toggleNotificationsModal = () => {
    setNotificationsModalVisible(!notificationsModalVisible);
  };
  const closeDropdown = () => setDropdownVisible(false);
  
   const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleLogout = async () => {

      await signOut(auth); // Sign out from Firebase
      toggleModal(); // Close the modal
   
  };

  const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <SafeAreaView style={styles.container}>
        {/* Header Container with Lottie Animation as Background */}
        <LinearGradient
          colors={['#050313', '#18164C', '#25276B']} // Your gradient colors
          style={styles.headerContainer}
        >
          {/* Your header content */}
          <View style={{ flexDirection: 'column' }}>
            <View style={styles.profileImageContainer}>
              <Image
                source={profilePicture ? { uri: profilePicture } : require('../images/defaultImage.jpg')}
                style={styles.profileImage}
              />
            </View>
            {/* Level Badge with Level-up Animation */}
            <View style={styles.levelBadgeContainer}>
              <View
                delay={1500}
                style={styles.levelBadge}
                iterationCount={level > 38 ? 'infinite' : 1} // Flashing effect on level-up
              >
                <Text style={styles.levelText}>{level}</Text>
              </View>
            </View>
          </View>
  
          <View style={styles.DropdownContainer}>
            <TouchableOpacity
              onPress={async () => {
                toggleDropdown(); // Trigger your dropdown toggle function
              }}
              style={styles.hamburger}
              accessibilityRole="button"
              accessible={true}
              accessibilityLabel="Menu"
            >
              <Text style={styles.hamburgerText}>☰</Text>
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity onPress={toggleSettingsModal} style={styles.menuItem}>
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>
                <Settings visible={settingsModalVisible} onClose={toggleSettingsModal} />
  
                <TouchableOpacity onPress={toggleNotificationsModal} style={styles.menuItem}>
                  <Text style={styles.menuText}>Notifications</Text>
                </TouchableOpacity>
                <Notifications visible={notificationsModalVisible} onClose={toggleNotificationsModal} notifications={notifications} />
  
                <TouchableOpacity
                  onPress={() => {
                    toggleDropdown();
                    navigation.navigate('ProfileScreen');
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    toggleDropdown();
                    toggleModal();
                  }}
                  style={styles.menuItem}
                >
                  <Text style={styles.menuText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
  
          <View style={{ flexDirection: 'column' }}>
            <LinearGradient
              colors={['#003343', '#003343']} // Specify your gradient colors here
              style={{
                height: 30,
                width: 150,
                borderRadius: 5,
                top: -10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {loading ? (
                  <Text style={styles.username}>Loading...</Text>
                ) : error ? (
                  <Text style={styles.username}>{error}</Text>
                ) : (
                  <Text style={styles.username}>{ign}</Text>
                )}
              </View>
            </LinearGradient>
            <View style={styles.pointsContainer}>
              <Image
                source={require('../images/star.png')}
                style={{ height: 20, width: 20, marginLeft: 5 }}
              />
              <Text delay={1000} style={styles.points}>
                {points} PTS.
              </Text>
            </View>
  
            {/* XP Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Progress.Bar progress={progress} width={90} color="#01D201" style={styles.progressBar} />
            </View>
          </View>
  
          {/* Currency/Stats with Pressable Scaling Animation */}
          <View style={styles.statsContainer}>
            {/* Bolt Icon */}
            <Image source={require('../images/Streak.png')} style={{ width: 60, height: 35, zIndex: 1, top: 2 }} />
            <View style={styles.AccessContainer}>
              <Text style={styles.statText}>1</Text>
            </View>
            {/* Diamond Icon */}
            <TouchableOpacity
              style={{ zIndex: 2, left: 10, top: 20 }}
              onPress={async () => {
                navigation.navigate('Shop'); // Navigate to the 'Shop' screen
              }}
            >
              <Image source={require('../images/Plus.png')} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
  
            <Image source={require('../images/Gem.png')} style={{ width: 30, height: 35, zIndex: 1, right: 24 }} />
  
            <View style={styles.AccessContainer}>
              <Text style={styles.statText}>1</Text>
            </View>
  
            {/* Battery Icon */}
            <TouchableOpacity
              style={{ zIndex: 2, left: 10, top: 20 }}
              onPress={async () => {
                navigation.navigate('Shop'); // Navigate to the 'Shop' screen
              }}
            >
              <Image source={require('../images/Plus.png')} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
  
            <Image source={require('../images/battery.png')} style={{ width: 30, height: 35, zIndex: 1, right: 24 }} />
            <View style={styles.AccessContainer}>
              <Text style={styles.statText}>{battery}</Text>
            </View>
          </View>
        </LinearGradient>
  
        {/* Modal for Confirmation */}
        <Modal transparent={true} animationType="slide" visible={isModalVisible} onRequestClose={toggleModal}>
          <View style={styles.ExitmodalContainer}>
            <View style={styles.ExitmodalContent}>
              <Text style={styles.modalText}>Leaving so soon?</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={handleLogout}>
                  <View style={styles.modalButtonYes}>
                    <Text style={styles.modalButton}>Yes</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModal}>
                  <View style={styles.modalButtonNo}>
                    <Text style={styles.modalButton}>No</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );  
  
};

const Navigation = () => {
  const [initialRoute, setInitialRoute] = useState('Home'); // Default to 'Home'

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setInitialRoute('Profile'); // Change to 'Profile' if user is authenticated
    }
  }, []); // Empty dependency array ensures it runs only once

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: '#2c2964', position: 'absolute' },
        tabBarActiveTintColor: '#9146FF',
        tabBarInactiveTintColor: 'white',
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Leaderboards') {
            iconSource = require('../images/navicon/podium.png');
          } else if (route.name === 'Games') {
            iconSource = require('../images/navicon/playing.png');
          } else if (route.name === 'Home') {
            iconSource = require('../images/navicon/home.png');
          } else if (route.name === 'Dictionary') {
            iconSource = require('../images/navicon/dictionary.png');
          } else if (route.name === 'Profile') {
            iconSource = require('../images/navicon/profile.png');
          }
          return <AnimatedIcon source={iconSource} focused={focused} />;
        },
        tabBarLabel: ({ focused }) =>
          focused ? (
            <Text
              style={{
                fontFamily: 'LilitaOne_400Regular',
                color: 'white',
                fontSize: 10,
                marginTop: 20,
              }}
            >
              {route.name}
            </Text>
          ) : null,
        tabBarItemStyle: {
          borderWidth: 1.5,
          borderColor: 'black',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarButton: (props) => (
          <TouchableWithoutFeedback
            onPress={async () => {
              props.onPress(); // Proceed with navigation
            }}
          >
            <View {...props} />
          </TouchableWithoutFeedback>
        ),
      })}
    >
      <Tab.Screen
        name="Leaderboards"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent', // Remove the default black background
            elevation: 0, // Remove shadow on Android
          },
          header: () => <ProfileHeader userId={getAuth().currentUser?.uid} />,
        }}
      >
        {() => (
          <Background>
            <Leaderboards />
          </Background>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Games"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent', // Remove the default black background
            elevation: 0, // Remove shadow on Android
          },
          header: () => <ProfileHeader userId={getAuth().currentUser?.uid} />,
        }}
      >
        {() => (
          <Background>
            <Games />
          </Background>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Home"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent', // Remove the default black background
            elevation: 0, // Remove shadow on Android
          },
          header: () => <ProfileHeader userId={getAuth().currentUser?.uid} />,
        }}
      >
        {() => (
          <Background>
            <Home />
          </Background>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Dictionary"
        options={{
          headerShown: false, // Hide the header for Dictionary screen
        }}
      >
        {() => (
          <Background>
            <Dictionary />
          </Background>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent', // Remove the default black background
            elevation: 0, // Remove shadow on Android
          },
          header: () => <ProfileHeader userId={getAuth().currentUser?.uid} />,
        }}
      >
        {() => (
          <Background>
            <Profile />
          </Background>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};



// Styles for the ProfileHeader
const styles = StyleSheet.create({
  container:{
    backgroundColor: '#050313',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 60,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
  },
  profileImageContainer:{
    borderWidth: 7,
    borderColor: '#C0C0C1', 
    borderRadius: 10,
    zIndex: 1,
  },
  username: {
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff',
    left: 10,
    fontSize: 25,
  },
  pointsContainer: {
    flexDirection: 'row',
    top: -10,
    width: 130,
    backgroundColor: '#003343',
    borderWidth: 1,
    borderRadius: 5
  },
  points: {
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff',
    fontSize: 18,
  },
  levelBadge: {
    flex:1,
    width: '100%',
    backgroundColor: '#003343',
    borderWidth: 1.5,
    borderColor: '#EBAE5B',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  levelBadgeContainer:{
    width: 40,
    height: 25,
    borderWidth: 1.5,
    borderColor: '#333',
    zIndex: 1,
    alignSelf: 'center',
    top: -15
  },
  levelText: {
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff',
  },
  progressBar:{
    borderRadius: 1,
  },
  progressBarContainer:{
    top: -11,
    width: 100,
    height: 15,
    backgroundColor: '#003343',
    borderWidth: 1,
    borderRadius: 5
  },
  statsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 120,
    left: 20
  },
  AccessContainer: {
    backgroundColor: '#003343',
    paddingVertical: -2,
    paddingHorizontal: 30 ,
    alignItems: 'center',
    justifyContent:'center',
    right: 50,
    borderRadius: 10,
    borderWidth: 1
  },
  statText: {
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 15,
    color: '#fff',
    left: 10
  },
  DropdownContainer:{
    justifyContent: 'center',
    alignContent: 'center',
    marginLeft: '95%',
    top: 35,
    position: 'absolute',
    zIndex: 5, // Ensure the dropdown is above other elements
  },
  hamburger: {
    justifyContent: 'center',
    alignContent: 'center',
    padding: 5,
    backgroundColor: '#003343',
    borderRadius: 5,
    height: 37,
    width: 50,
    right: -20,
    marginTop: 20, // Optional: add space from the top padding: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  hamburgerText: {
    alignSelf: 'center',
    fontSize: 20,
    color: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: -18,
    left: -90,
    backgroundColor: '#fff',
    width: 120,
    height: 150,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000, // Ensure the dropdown is above other elements
  },
  menuItem: {
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    color: '#333 ',
  },
  modalContainer: {
    width: 300, // Modal width
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
},
modalContent: {
  height: 200,
  width: 300,
  padding: 20,
  borderRadius: 10,
  alignItems: 'center',
},
modalText: {
    marginBottom: 20,
    fontSize: 30,
    fontFamily: 'LilitaOne_400Regular',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'black',  
    textShadowOffset: { width: 1, height: 1 },  
    textShadowRadius: 2, 
},
modalButtonYes: {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#C20000',
  height: 50,
  width: 100,
  margin: 10,
  borderWidth: 1,
  borderRadius: 10,
  textShadowColor: 'black',  
  textShadowOffset: { width: 1, height: 1 },  
  textShadowRadius: 2, 
},
modalButtonNo: {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#00B300',
  height: 50,
  width: 100,
  margin: 10,
  borderWidth: 1,
  borderRadius: 10,
  textShadowColor: 'black',  
  textShadowOffset: { width: 1, height: 1 },  
  textShadowRadius: 2, 
},
modalButton:{
  color: 'white',
  fontFamily: 'LilitaOne_400Regular',
  fontSize: 20
},
SettingsmodalContainer:{
    width: 250, // Modal width
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center'
},
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent overlay
},
closeButtonText:{
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 20
},
closeButton:{
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  ExitmodalContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent background
  },
  ExitmodalContent:{
    height: 200,
    width: 300,
    padding: 20,
    backgroundColor: '#B57BFE',
    borderRadius: 10,
    alignItems: 'center',
  },
  settingsmodalTitle:{
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 25,
    position: 'absolute',
    marginTop: 10,
    textShadowColor: 'black',  
    textShadowOffset: { width: 1, height: 1 },  
    textShadowRadius: 2, 
  },
});

export default Navigation;