import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Button, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';


const Profile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const cardData = [
    { id: 1, title: "Locked", description: "Sample description 1", imageUrl: require('../images/lock.png') },
    { id: 2, title: "Locked", description: "Sample description 2", imageUrl: require('../images/lock.png') },
    { id: 3, title: "Locked", description: "Sample description 3", imageUrl: require('../images/lock.png') },
    { id: 4, title: "Locked", description: "Sample description 4", imageUrl: require('../images/lock.png') },
    { id: 5, title: "Locked", description: "Sample description 5", imageUrl: require('../images/lock.png') },
    { id: 6, title: "Locked", description: "Sample description 6", imageUrl: require('../images/lock.png') },
    { id: 7, title: "Locked", description: "Sample description 7", imageUrl: require('../images/lock.png') },
    { id: 8, title: "Locked", description: "Sample description 8", imageUrl: require('../images/lock.png') },
    { id: 9, title: "Locked", description: "Sample description 9", imageUrl: require('../images/lock.png') },
    { id: 10, title: "Locked", description: "Sample description 10", imageUrl: require('../images/lock.png') },
    { id: 11, title: "Locked", description: "Sample description 11", imageUrl: require('../images/lock.png') },
    { id: 12, title: "Locked", description: "Sample description 12", imageUrl: require('../images/lock.png') },
  ];

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  const [fontsLoaded] = useFonts({
    LilitaOne_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/achievements.png')}
        style={{ height: 100, width: '110%', top: -6 }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardRowContainer}>
          {cardData.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card)}
              style={styles.card}
            >
              <Image source={card.imageUrl} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedCard?.title}</Text>
            <Text style={styles.modalDescription}>{selectedCard?.description}</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1, // Allow the ScrollView to grow
    alignItems: 'center',
    paddingBottom: 20, // Add padding for better scroll experience
    marginTop: -10
  },
  cardRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  card: {
    width: '25%',
    height: 80,
    borderWidth: 2,
    backgroundColor: 'rgba(115, 72, 178, 0.9)', // Adjust the alpha value (0.0 to 1.0) for transparency
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: {
    width: '80%',
    height: '70%',
    margin: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Profile;