import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, ActivityIndicator, Image, TextInput, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';


const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(require('../images/defaultImage.jpg')); // Set default image here
  const [loadingUpload, setLoadingUpload] = useState(false);

  // States for individual field editing
  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);
  const [editingIgn, setEditingIgn] = useState(false);

  // States for input values
  const [updatedFirstName, setUpdatedFirstName] = useState('');
  const [updatedLastName, setUpdatedLastName] = useState('');
  const [updatedIgn, setUpdatedIgn] = useState('');

  const navigation = useNavigation();

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

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        setUser({
          email: currentUser.email,
          uid: currentUser.uid,
        });

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
            if (userDoc.data().profilePicture) {
              setImageUri({ uri: userDoc.data().profilePicture });
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleExit = () => {
    // Navigate to the previous screen (back button functionality)
    navigation.goBack();
  };
  
  const handleSaveChanges = async () => {
    try {
      const updates = {};

      if (updatedFirstName) {
        updates.firstName = updatedFirstName;
      }
      if (updatedLastName) {
        updates.lastName = updatedLastName;
      }
      if (updatedIgn) {
        updates.ign = updatedIgn;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', user.uid), updates);
        Alert.alert("Profile updated successfully!");
        setUserData((prevData) => ({
          ...prevData,
          ...updates,
        }));
      }

      // Turn off all editing modes
      setEditingFirstName(false);
      setEditingLastName(false);
      setEditingIgn(false);

    } catch (error) {
      console.error("Error saving profile changes:", error);
      Alert.alert("Error saving changes:", error.message);
    }
  };

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri({ uri: result.assets[0].uri });
      await uploadImageToCloudinary(result.assets[0].uri);
    }
  };
  
  const uploadImageToCloudinary = async (uri) => {
    try {
      setLoadingUpload(true);
  
      // Prepare the data for upload
      const data = new FormData();
      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: `profile_pic_${Date.now()}.jpg`,
      });
      data.append('upload_preset', 'profile_pics'); // Replace with your upload preset
      data.append('folder', 'ProfilePicture'); // Specify the folder in Cloudinary
      
      // Upload to Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/dc9e1ufq3/image/upload', {
        method: 'POST',
        body: data,
      });
  
      const jsonResponse = await response.json();
  
      if (jsonResponse.secure_url) {
        const downloadURL = jsonResponse.secure_url;
  
        // Save the URL to Firestore
        await updateDoc(doc(db, 'users', user.uid), { profilePicture: downloadURL });
  
        Alert.alert("Profile picture uploaded successfully!");
        setImageUri({ uri: downloadURL });
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (error) {
      console.error("Error in Cloudinary upload:", error);
      Alert.alert("Upload failed", error.message);
    } finally {
      setLoadingUpload(false);
    }
  };
  

  const uploadImage = async (uri) => {
    try {
      setLoadingUpload(true);

      const storage = getStorage();
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error("Failed to fetch image data");
      }

      const blob = await response.blob();
      const storageRef = ref(storage, `profilePictures/profilePicture_${Date.now()}.png`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), { profilePicture: downloadURL });

      Alert.alert("Profile picture uploaded successfully!");
      setImageUri({ uri: downloadURL });
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      Alert.alert("An error occurred while uploading the image:", error.message);
    } finally {
      setLoadingUpload(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.LoadingDataContainer}>
        <ActivityIndicator size={50} color="#0000ff" />
        <Text style={styles.text}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../images/profileinfo.png')}
        style={{ justifyContent: 'center', alignItems: 'center', width: '110%', height: '10%' }}
      />
      <View style={styles.profileImageContainer}>
        <Image
          source={imageUri}
          style={styles.profilePicture}
        />
      </View>

      <TouchableOpacity
        style={styles.changePhotoButton} 
        onPress={async () => { 
         
          handleImageUpload();
        }} 
        disabled={loadingUpload}
      >
        <MaterialIcons name="camera-alt" size={20} color="#050313" />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {loadingUpload && <ActivityIndicator size={50} color="#0000ff" />}
        {userData && (
          <>
            {/* First Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.text}>First Name:</Text>
              {editingFirstName ? (
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={updatedFirstName || userData.firstName}
                  onChangeText={setUpdatedFirstName}
                />
              ) : (
                <Text style={styles.staticText}>{userData.firstName}</Text>
              )}
              <TouchableOpacity 
                onPress={async () => {
                
                  setEditingFirstName(true);
                }}
              >
                <MaterialIcons name="edit" size={24} color="#F2E30B" />
              </TouchableOpacity>
            </View>

            {/* Last Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.text}>Last Name:</Text>
              {editingLastName ? (
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={updatedLastName || userData.lastName}
                  onChangeText={setUpdatedLastName}
                />
              ) : (
                <Text style={styles.staticText}>{userData.lastName}</Text>
              )}
              <TouchableOpacity 
                onPress={async () => {
                  setEditingLastName(true);
                }}
              >
                <MaterialIcons name="edit" size={24} color="#F2E30B" />
              </TouchableOpacity>
            </View>

            {/* In-Game Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.text}>IGN:</Text>
              {editingIgn ? (
                <TextInput
                  style={styles.input}
                  placeholder="In-Game Name"
                  value={updatedIgn || userData.ign}
                  onChangeText={setUpdatedIgn}
                />
              ) : (
                <Text style={styles.staticText}>{userData.ign}</Text>
              )}
              <TouchableOpacity 
                onPress={async () => {
               
                  setEditingIgn(true);
                }}
              >
                <MaterialIcons name="edit" size={24} color="#F2E30B" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.buttonsContainer}>
          {/* Save button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={async () => {
            
              handleSaveChanges();
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          {/* Exit button */}
          <TouchableOpacity
            style={styles.exitButton}
            onPress={async () => {
             
              handleExit();
            }}
          >
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1C1C57'
  },
  LoadingDataContainer:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1C1C57'
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'green'
  },
  changePhotoText: {
    textDecorationLine: 'underline',
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  EditProfile:{
    justifyContent: 'flex-start',
    marginTop: 70,
    fontSize: 25,
    fontFamily: 'LilitaOne_400Regular',
    color: 'white',
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  profileImageContainer:{
    height: 150,
    width: 150,
    borderWidth: 10,
    borderColor: '#C0C0C1', 
    borderRadius: 10,
    margin: 10,
    padding: 1,
    zIndex: 1,
  },
  profileImage: {
    height: 135,
    width: 135,
    borderColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
  },
  infoContainer: {
    backgroundColor: '#8543C0',
    width: width * 1, // 90% of screen width
    height: height * 5, // 80% of screen height
    marginTop: 50,
    borderRadius: 30,
    padding: 30
  },
  text: {
    fontSize: 25,
    marginBottom: 10,
    color: 'white',
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
     width: width * 0.9, 
    marginBottom: 15
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    paddingHorizontal: 10,
    width: height * 2, 
    color: '#fff',
    fontSize: 20,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderWidth: 2,
    borderRadius: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: '#01D201',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 25,
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  exitButton: {
    backgroundColor: '#ff3333',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    width: '48%',
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#fff',
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 25,
    textShadowColor: 'black',  
    textShadowOffset: { width: 2, height: 2 },  
    textShadowRadius: 2,  
  },
  staticText: {
    flex: 1,
    margin: 5,
    top: -5,
    color: '#02EB02',
    fontSize: 25,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',  // Border color
    textShadowOffset: { width: 2, height: 2 },  // Shadow offset
    textShadowRadius: 2,  // Blur of the shadow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;