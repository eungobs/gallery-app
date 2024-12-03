import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { init, insertPhoto, fetchPhotos } from './database';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await init();
        const result = await fetchPhotos();
        const photos = [];
        for (let i = 0; i < result.rows.length; i++) {
          photos.push(result.rows.item(i));
        }
        setGalleryImages(photos);
      } catch (error) {
        console.error('Error initializing database or fetching photos:', error);
      }

      // Request permissions
      if (Platform.OS !== 'web') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        }

        const locationPermission = await Location.requestForegroundPermissionsAsync();
        if (locationPermission.status !== 'granted') {
          Alert.alert('Permission Required', 'Location permission is required to tag photos with coordinates.');
        }
      }
    };

    initializeApp();
  }, []);

  const handleSearch = () => {
    const filteredImages = galleryImages.filter((photo) =>
      photo.uri.toLowerCase().includes(searchText.toLowerCase())
    );
    setGalleryImages(filteredImages);
  };

  const handleCameraPress = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const location = await Location.getCurrentPositionAsync({});
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        await insertPhoto(result.uri, date, time, location.coords.latitude, location.coords.longitude);

        const updatedPhotos = await fetchPhotos();
        const photos = [];
        for (let i = 0; i < updatedPhotos.rows.length; i++) {
          photos.push(updatedPhotos.rows.item(i));
        }
        setGalleryImages(photos);
        setImage(result.uri);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Settings feature is under development.');
  };

  const handleGalleryPress = () => {
    Alert.alert('Gallery', 'Gallery feature is under development.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Gallery</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Gallery Content */}
      <View style={styles.galleryContent}>
        {image && <Text style={styles.infoText}>Photo taken: {image}</Text>}
        <FlatList
          data={galleryImages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.galleryItem}>
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
              <Text>Location: {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}</Text>
            </View>
          )}
          numColumns={1}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerIcon, styles.cameraIcon]} onPress={handleCameraPress}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerIcon, styles.settingsIcon]} onPress={handleSettingsPress}>
          <Ionicons name="settings" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerIcon, styles.galleryIcon]} onPress={handleGalleryPress}>
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'brown',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    flex: 1,
  },
  searchIcon: {
    padding: 8,
  },
  galleryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoText: {
    marginBottom: 10,
    color: 'gray',
  },
  galleryItem: {
    margin: 10,
    alignItems: 'center',
  },
  galleryImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  footerIcon: {
    padding: 8,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    backgroundColor: 'brown',
  },
  settingsIcon: {
    backgroundColor: 'grey',
  },
  galleryIcon: {
    backgroundColor: 'green',
  },
});

