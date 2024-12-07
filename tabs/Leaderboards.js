import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import LottieView from 'lottie-react-native'; // Import Lottie

// Get device dimensions for responsiveness
const { width, height } = Dimensions.get('window');

const Leaderboards = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={50} color="#0000ff" />
      </View>
    );
  }

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to fetch leaderboard data.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size={50} color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.topContainer}>
            {users.slice(0, 1).map((user, index) => (
              <View key={user.id} style={styles.topUser}>
                <Image
                  source={
                    user.profilePicture
                      ? { uri: user.profilePicture }
                      : require('../images/defaultImage.jpg')
                  }
                  style={styles.profileImageTop}
                />
                <LottieView 
                source={require('../assets/crown.json')} 
                autoPlay 
                loop 
                style={styles.animation}
              />
                <View style={[styles.rankBadge, { backgroundColor: 'gold' }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.username}>{user.ign}</Text>
                <View style={styles.pointsContainer}>
                  <Image source={require('../images/star.png')} style={styles.starImage} />
                  <Text style={styles.points}>{user.points} PTS.</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Display the second and third ranks */}
          <View style={styles.rankContainer}>
            <View style={styles.topContainer2}>
              {users.slice(1, 2).map((user, index) => (
                <View key={user.id} style={styles.topUser}>
                  <Image
                    source={
                      user.profilePicture
                        ? { uri: user.profilePicture }
                        : require('../images/defaultImage.jpg')
                    }
                    style={styles.profileImage}
                  />
                  <View style={[styles.rankBadge, { backgroundColor: 'silver' }]}>
                    <Text style={styles.rankText}>{index + 2}</Text>
                  </View>
                  <Text style={styles.username}>{user.ign}</Text>
                  <View style={styles.pointsContainer}>
                    <Image source={require('../images/star.png')} style={styles.starImage} />
                    <Text style={styles.points}>{user.points} PTS.</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.topContainer3}>
              {users.slice(2, 3).map((user, index) => (
                <View key={user.id} style={styles.topUser}>
                  <Image
                    source={
                      user.profilePicture
                        ? { uri: user.profilePicture }
                        : require('../images/defaultImage.jpg')
                    }
                    style={styles.profileImage}
                  />
                  <View style={[styles.rankBadge, { backgroundColor: '#cd7f32' }]}>
                    <Text style={styles.rankText}>{index + 3}</Text>
                  </View>
                  <Text style={styles.username}>{user.ign}</Text>
                  <View style={styles.pointsContainer}>
                    <Image source={require('../images/star.png')} style={styles.starImage} />
                    <Text style={styles.points}>{user.points} PTS.</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {/* Display other ranks */}
          <View style={{height: height * 0.5, paddingBottom: 120}}>
            <ScrollView>
              {users.slice(3, 10).map((user, index) => (
                <View key={user.id} style={styles.restContainer}>
                  <View style={styles.restUser}>
                    <View style={styles.column1}>
                      <Text style={styles.restText}>{index + 4}</Text>
                    </View>
                    <View style={styles.column2}>
                      <Image
                        source={
                          user.profilePicture
                            ? { uri: user.profilePicture }
                            : require('../images/defaultImage.jpg')
                        }
                        style={styles.restprofileImage}
                      />
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.restusername}>{user.ign}</Text>
                    </View>
                    <View style={styles.column3}>
                      <Image source={require('../images/star.png')} style={styles.starImage} />
                      <Text style={styles.restpoints}>{user.points} PTS.</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    paddingBottom: 50,
    flex: 1,
    zIndex: 1, // Content above video
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  topContainer2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    flexWrap: 'wrap',
    left: -20,
  },
  topContainer3: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    flexWrap: 'wrap',
    left: 20,
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: -120,
  },
  topUser: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginHorizontal: 10,
  },
  profileImage: {
    height: width * 0.24, // 20% of the screen width
    width: width * 0.24,  // 20% of the screen width
    borderRadius: 100,
    borderWidth: 2,
    margin: 5,
  },
  profileImageTop: {
    height: width * 0.24, // 20% of the screen width
    width: width * 0.24,  // 20% of the screen width
    borderRadius: 100,
    borderWidth: 2,
    margin: 5,
    zIndex:0,
  },
  crownImage: {
    height: 50,
    width: 70,
    top: -30,
    zIndex: 1,
    position: 'absolute',
  },
  animation: {
    width: 180,
    height: 150,
    zIndex:1,
    position: 'absolute',
    top: -80,
  },
  rankBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 100,
    position: 'absolute',
    top: 70,
  },
  rankText: {
    fontFamily: 'LilitaOne_400Regular',
    color: '#333',
    fontSize: 20,
  },
  username: {
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff',
    fontSize: 20,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
  },
  starImage: {
    width: 20,
    height: 20,
    marginLeft: 20
  },
  points: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LilitaOne_400Regular',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  column:{
    flex: 1, // Make each column take equal space
    marginHorizontal: 1, // Optional: space between columns
    width: '5%', // Column takes 20% of the container's width
    height: '100%',
  },
  column1:{
    width: '10%', // Column takes 20% of the container's width
    height: '100%',
  },
  column2:{
    width: '20%', // Column takes 20% of the container's width
    height: '100%'
  },
  column3:{
    flexDirection: 'row',
    width: '20%', // Column takes 20% of the container's width
    height: '100%',
    left: -40
  },
  restContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    margin: 10,
    padding: 10,
  },
  restUser: {
    flexDirection: 'row', // 1 row layout
    justifyContent: 'space-between', // Distribute columns evenly
    alignItems: 'center', // Align items vertically at the center
  },
  restText: {
    fontSize: 20,
    fontFamily: 'LilitaOne_400Regular',
  },
  restprofileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1
  },
  restusername: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'LilitaOne_400Regular',
  },
  restpoints:{
    fontSize: 15,
    fontFamily: 'LilitaOne_400Regular',
    alignSelf: 'center'
  }
});

export default Leaderboards;