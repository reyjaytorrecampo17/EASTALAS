import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons for the speech icon
import { Audio } from 'expo-av';

export default function Dictionary() {
    const route = useRoute();
    const wordOfTheDay = route.params?.word;
    const [newWord, setNewWord] = useState(wordOfTheDay || "");
    const [checkedWord, setCheckedWord] = useState("");
    const [definition, setDefinition] = useState("");
    const [example, setExample] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false); // Track TTS state
    
    const playClickSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/clickmenu.wav'));
          await sound.playAsync();
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      };
      
      // Handle navigation and sound on click
      const handleClick = async (screen, params = {}) => {
        navigation.navigate(screen, params); // Navigate to the specified screen
      };

    const handleTTSToggle = () => {
        // Start by speaking the word and definition
        let speechText = `${checkedWord}: ${definition}`;
        // If an example exists, add it to the speech
        if (example && example !== "No example available.") {
            speechText += `. Example: ${example}`;
        }
    
        // Speak the combined text
        Speech.speak(speechText, {
            pitch: 1.5, // Higher pitch for a more kid-friendly voice
            rate: 0.9,  // Slightly slower rate for better understanding
            language: 'en-US',
        });
    
        setIsSpeaking(true);
    };
    

    // Stop TTS when the screen is unfocused (when navigating away)
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (isSpeaking) {
                    Speech.stop(); // Stop the speech when leaving the screen
                    setIsSpeaking(false);
                }
            };
        }, [isSpeaking])
    );

    useEffect(() => {
        if (wordOfTheDay) {
            // Reset states before fetching new word data
            setCheckedWord('');
            setDefinition('');
            setExample('');
            setData(null);
            
            // Fetch info for the new word
            getInfo(wordOfTheDay);
        }
    }, [wordOfTheDay]);

    const searchWord = (enteredWord) => {
        const words = enteredWord.split(' ');
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        setNewWord(capitalizedWords.join(' '));
    };

    const getInfo = async (word) => {
        const searchWord = word || newWord;
        if (!searchWord.trim()) {
            setError("Please enter a word to search.");
            setTimeout(() => setError(null), 5000);  // Keep the error message visible for longer
            return;
        }

        let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.trim()}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                setError("Word not found in the database");
                setTimeout(() => setError(null), 3000);
                return;
            }

            const fetchedData = await response.json();
            setData(fetchedData);

            if (fetchedData.length > 0) {
                const word = fetchedData[0].word;
                const def = fetchedData[0].meanings[0].definitions[0].definition;
                const eg = fetchedData[0].meanings[0].definitions[0].example || "No example available.";

                setCheckedWord(word);
                setDefinition(def);
                setExample(eg);
                setError(null);
            } else {
                setError("Word not found in the database");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError("An error occurred while fetching data");
        }

        setTimeout(() => {
            setError(null);
        }, 3000);
    };

    const clear = async () => {
        setCheckedWord("");
        setDefinition("");
        setExample("");
        setNewWord("");
        setData(null);
    };

    const [fontsLoaded] = useFonts({
        LilitaOne_400Regular,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {fontsLoaded ? (
                <>
                    <Text style={styles.heading}>Dictionary</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search..."
                            value={newWord}
                            onChangeText={(text) => searchWord(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={() => {{   playClickSound(); getInfo(newWord); }}}>
                            <Text style={styles.buttonText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.clearButton} onPress={() => {   playClickSound(); clear(); }}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {checkedWord && !error && (
                        <ScrollView
                            style={styles.resultsContainer}
                            contentContainerStyle={styles.scrollViewContent}
                        >
                            <Text style={styles.word}>{checkedWord}</Text>
                            <View style={styles.resultTextContainer}>
                            <View style={styles.ttsContainer}>
                                <TouchableOpacity onPress={handleTTSToggle} style={styles.ttsButton}>
                                    <Ionicons name="volume-high" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                                <Text style={styles.resultLabel}>Definition:</Text>
                                <Text style={styles.resultText}>{definition}</Text>
                                <Text style={styles.resultLabel}>Example:</Text>
                                <Text style={styles.resultText}>{example}</Text>
                            </View>
                        </ScrollView>
                    )}
                </>
            ) : (
                <ActivityIndicator size="24" color="#ffffff" />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        fontFamily: 'LilitaOne_400Regular',
        marginTop: 10,
    },
    heading: {
        fontSize: 30,
        marginBottom: 20,
        fontFamily: 'LilitaOne_400Regular',
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    input: {
        flex: 1,
        padding: 15,
        fontSize: 18,
        fontFamily: 'LilitaOne_400Regular',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        marginLeft: 10,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'LilitaOne_400Regular',
        fontSize: 18,
    },
    resultsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        padding: 20,
        marginTop: 20,
        height: '60%',
        width: '100%',
    },
    scrollViewContent: {
        alignItems: 'center',
    },
    word: {
        fontSize: 28,
        fontFamily: 'LilitaOne_400Regular',
        color: '#333',
    },
    resultTextContainer: {
        alignItems: 'flex-start',
        paddingTop: 20,
        width: '100%',
    },
    resultLabel: {
        fontSize: 20,
        fontFamily: 'LilitaOne_400Regular',
        color: '#555',
        marginBottom: 5,
    },
    resultText: {
        fontSize: 18,
        fontFamily: 'LilitaOne_400Regular',
        marginBottom: 15,
        color: '#777',
        lineHeight: 24,
        textAlign: 'justify',
    },
    clearButton: {
        marginStart: '80%',
        backgroundColor: '#FF4A4A',
        borderRadius: 10,
        padding: 5,
    },
    clearButtonText: {
        color: '#fff',
        fontFamily: 'LilitaOne_400Regular',
        fontSize: 15,
    },
    ttsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 120
    },
    ttsButton: {
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 50,
        elevation: 5,
    },
});
