import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import CrosswordGrid from './CrosswordGrid';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import LottieView from 'lottie-react-native'; // Import Lottie

const CrossWord = () => {
    const [crosswordData, setCrosswordData] = useState([]);
    const [crosswordStory, setCrosswordStory] = useState(null); // State to hold the crossword story
    const [showStory, setShowStory] = useState(true); // State to control story visibility
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrosswordData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "crosswords"));
                const puzzles = [];
                querySnapshot.forEach((doc) => {
                    const crosswordData = doc.data();
                    // If the story is missing, set it to an empty string or a default message
                    const story = crosswordData.story || "No story available for this puzzle."; 
                    setCrosswordStory(story); // Set the story, even if it's missing
                    puzzles.push(crosswordData.clues); // Fetch clues array
                });
                const validPuzzles = puzzles.filter((puzzle) => puzzle !== undefined); // Remove undefined entries
                setCrosswordData(validPuzzles);
            } catch (error) {
                console.error("Error fetching crossword data: ", error);
            }
        };
    
        fetchCrosswordData();
    }, []);

    const handleStoryClose = () => {
        setShowStory(false); // Hide the story when the button is pressed
    };

    if (crosswordData.length === 0) {
        if (loading) {
            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LottieView
                  source={require('../assets/loading3.json')} // Update the path to your Lottie animation
                  autoPlay
                  loop
                  style={{ width: 400, height: 400 }}
                />
              </View>
            );
          }
    }

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
            <View style={styles.container}>
                {showStory && crosswordStory ? (
                    <View style={styles.storyContainer}>
                        <View style={styles.story}>
                            <Text style={styles.storyText}>{crosswordStory}</Text>
                            <TouchableOpacity style={styles.button} onPress={handleStoryClose}>
                                <Text style={styles.buttonText}>Start Crossword</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <CrosswordGrid crosswordData={crosswordData} />
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover', // Ensures the image covers the entire screen
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    loadingText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    storyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 500,
        height: 500,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker background for the story container
        borderRadius: 0, // No border radius for full-screen container
        top: 0, // Aligns it to the top
        left: 0, // Aligns it to the left
    },
    story: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 1
    },
    storyText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 24, // Improved readability with line height
        fontFamily: 'LilitaOne_400Regular',
    },
    button: {
        backgroundColor: '#4CAF50', // Green button color
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, // More rounded button
        elevation: 2, // Shadow effect for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'LilitaOne_400Regular',
    },
});

export default CrossWord;
