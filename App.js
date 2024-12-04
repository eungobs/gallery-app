import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Import the functions from the database module
import { initializeDatabase, addImage, getAllImages, deleteImage } from './database';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    // Initialize the database when the component mounts
    initializeDatabase()
      .then(() => {
        // Fetch all images from the database after initialization
        getAllImages()
          .then((images) => {
            setGalleryImages(images);
          })
          .catch((err) => console.error('Error fetching images:', err));
      })
      .catch((err) => console.error('Error initializing database:', err));

    // Request camera and location permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to take photos.');
        }

        const locationStatus = await Location.requestForegroundPermissionsAsync();
        if (locationStatus.status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is required for tagging photos.');
        }
      }
    })();
  }, []);

  const handleCameraPress = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const location = await Location.getCurrentPositionAsync({});
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        const photoData = {
          uri: result.uri,
          date,
          time,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setNewPhoto(photoData);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleSavePhoto = () => {
    if (newPhoto) {
      addImage(newPhoto.uri, newPhoto.date, newPhoto.latitude, newPhoto.longitude, newPhoto.time)
        .then((id) => {
          console.log('Photo added with ID:', id);
          // Fetch updated images after saving the new photo
          getAllImages()
            .then((images) => {
              setGalleryImages(images);
              setNewPhoto(null);
            })
            .catch((err) => console.error('Error fetching images:', err));
        })
        .catch((err) => console.error('Error adding photo:', err));
    } else {
      Alert.alert('No photo to save', 'Please take a photo first.');
    }
  };

  const handleDelete = (id) => {
    deleteImage(id)
      .then(() => {
        setGalleryImages((prev) => prev.filter((photo) => photo.id !== id));
      })
      .catch((err) => console.error('Error deleting photo:', err));
  };

  const toggleGalleryView = () => {
    setShowGallery((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Gallery</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.folderButton} onPress={toggleGalleryView}>
          <Ionicons name="folder" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showGallery ? (
        <FlatList
          data={galleryImages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.galleryItem}>
              <Image source={{ uri: item.filePath }} style={styles.galleryImage} />
              <Text>Date: {item.timestamp}</Text>
              <Text>Location: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.instructionText}>
          Tap the camera icon to take a photo or the folder icon to view saved images.
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePhoto}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Ionicons name="camera" size={24} color="white" />
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#8B4513',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#CCCC99',
    borderRadius: 8,
    padding: 8,
  },
  folderButton: {
    marginLeft: 8,
    backgroundColor: '#8B8000',
    padding: 10,
    borderRadius: 8,
  },
  galleryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  galleryImage: {
    width: '100%',
    height: 200,
  },
  deleteText: {
    color: 'red',
    marginTop: 8,
  },
  instructionText: {
    textAlign: 'center',
    margin: 16,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center', // Center the camera button
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#8B4513', // Dark brown color
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12, // Smaller font size
  },
});
