import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Linear Gradient
import { useFonts } from 'expo-font';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';


const Shop = ({navigation}) => {
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
    <View style={styles.container}>
      <LinearGradient colors={['#050313', '#18164C', '#25276B']} style={styles.header}>
        <View style={styles.header}>
            <Text style={styles.title}>SHOP</Text>
        </View>
        <View style={styles.statsContainer}>
        {/* Diamond Icon */}
        <Image 
          source={require('../images/Gem.png')}
          style={{width: 30, height: 35, zIndex: 1, right: -20}}
        />
              
        <View style={styles.AccessContainer}>
          <Text style={styles.statText}>1</Text>
        </View>

        {/* Battery Icon */}
        <Image 
          source={require('../images/battery.png')}
          style={{width: 30, height: 35, zIndex: 1, right: -20}}
        />
        <View style={styles.AccessContainer}>
          <Text style={styles.statText}>5</Text>
        </View>
        <View style={styles.xContainer}>
          {/* X Button to go back */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={async () => { 
              navigation.goBack(); // Navigate back to the previous screen
            }}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

        </View>
      </View>
      </LinearGradient>
      <ScrollView>
      {/* Add shop-related content here */}
      <View style={{flexDirection: 'column'}}>
        <Image
            source={require('../images/shop/Enhancement.png')}
            style={{width: 360, height: 55}}
        />
      </View>
        <View style={{flexDirection: 'row', margin: 10}}>
            <TouchableOpacity style={styles.HintsItems}>
                <View style={styles.HintsContainer}>
                    <Text style={styles.itemsText}>HINTS</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/shop/idea.png')}
                        style = {{height: 40, width: 35, top: 10}}
                    />
                    <Text style={styles.itemsText}>x5</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Image
                    source={require('../images/Gem.png')}
                    style = {{height: 40, width: 35, top: 10}}
                />
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>500</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.HintsItems}>
                <View style={styles.HintsContainer}>
                    <Text style={styles.itemsText}>LOADS OF HINTS</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/shop/idea.png')}
                        style = {{height: 40, width: 35, top: 10}}
                    />
                    <Text style={styles.itemsText}>x10</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Image
                    source={require('../images/Gem.png')}
                    style = {{height: 40, width: 35, top: 10}}
                />
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>800</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', margin: 10}}>
            <TouchableOpacity style={styles.EnergyItems}>
                <View style={styles.EnergyContainer}>
                    <Text style={styles.itemsText}>ENERGY BOOST</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/shop/battery.png')}
                        style = {{height: 50, width: 30, top: 10}}
                    />
                    <Text style={styles.itemsText}>x1</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Image
                    source={require('../images/Gem.png')}
                    style = {{height: 40, width: 35, top: 10}}
                />
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>200</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.EnergyItems}>
                <View style={styles.EnergyContainer}>
                    <Text style={styles.itemsText}>FULL CHARGED</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/shop/battery.png')}
                        style = {{height: 50, width: 30, top: 10}}
                    />
                    <Text style={styles.itemsText}>x5</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Image
                    source={require('../images/Gem.png')}
                    style = {{height: 40, width: 35, top: 10}}
                />
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>900</Text>
                </View>
            </TouchableOpacity>
        </View>
      <View>
        <Image
            source={require('../images/shop/Gem.png')}
            style={{width: 360, height: 55}}
        />
      </View>
      <View style={{flexDirection: 'row', margin: 10}}>
            <TouchableOpacity style={styles.GemItems}>
                <View style={styles.GemContainer}>
                    <Text style={styles.itemsText}>HANDFUL OF GEMS</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/Gem.png')}
                        style = {{height: 50, width: 40, top: 10}}
                    />
                    <Text style={styles.itemsText}>x400</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>₱40.00</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.GemItems}>
                <View style={styles.GemContainer}>
                    <Text style={styles.itemsText}>STACK OF GEMS</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/Gem.png')}
                        style = {{height: 50, width: 40, top: 10}}
                    />
                    <Text style={styles.itemsText}>x1200</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Text style={{fontSize: 30, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>₱80.00</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={{alignSelf: 'center', margin: 10}}>
            <TouchableOpacity style={styles.GemItems}>
                <View style={styles.GemContainer}>
                    <Text style={styles.itemsText}>PILE OF GEMS</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Image
                        source={require('../images/Gem.png')}
                        style = {{height: 50, width: 40, top: 10}}
                    />
                    <Text style={styles.itemsText}>x1600</Text>
                </View>
                <View style={{flexDirection: 'row', margin: 20}}>
                <Text style={{fontSize: 25, fontFamily: 'LilitaOne_400Regular', color: '#333', top: 15}}>₱180.00</Text>
                </View>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#9747FF',
  },
  header:{
    height: 130,
    width: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
    margin: 10,
    top: 20
  },
  statsContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    top: -30
  },
  AccessContainer: {
    backgroundColor: '#003343',
    paddingVertical: -2,
    paddingHorizontal: 30 ,
    alignItems: 'center',
    justifyContent:'center',
    borderRadius: 10,
    borderWidth: 1
  },
  statText: {
    fontFamily: 'LilitaOne_400Regular',
    fontSize: 15,
    color: '#fff',
    left: 10
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 10,
    backgroundColor: 'red',
    height: 30,
    width: 30,
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontFamily: 'LilitaOne_400Regular',
    color: '#FFF',
  },
  xContainer:{
    top: -35,
    left: 20
  },
  itemContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
    top: 20,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFA402'
  },
  HintsItems:{
    height: 200, 
    width: 150, 
    backgroundColor: '#B9BFD2', 
    margin: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2CB34F',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  EnergyItems:{
    height: 200, 
    width: 150, 
    backgroundColor: '#B9BFD2', 
    margin: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  GemItems:{
    height: 200, 
    width: 150, 
    backgroundColor: '#6C5FEA', 
    margin: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D4C0FF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  HintsContainer:{
    alignItems: 'center',
    height: 40,
    width: 150,
    top: -5,
    backgroundColor: '#1E6E3E',
    borderWidth: 1,
    borderColor: '#000',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  EnergyContainer:{
    alignItems: 'center',
    height: 40,
    width: 150,
    top: -5,
    backgroundColor: '#4E788D',
    borderWidth: 1,
    borderColor: '#000',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  GemContainer:{
    alignItems: 'center',
    height: 40,
    width: 150,
    top: -5,
    backgroundColor: '#4D44A6',
    borderWidth: 1,
    borderColor: '#000',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
  itemsText:{
    fontSize: 15,
    margin: 10,
    fontFamily: 'LilitaOne_400Regular',
    color: '#fff'
  }
});

export default Shop;