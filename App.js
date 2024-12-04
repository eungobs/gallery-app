import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  init,
  insertPhoto,
  fetchPhotos,
  saveToLocalStorage,
  getFromLocalStorage,
  deleteFromLocalStorage,
} from './database';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    init()
      .then(() => {
        fetchPhotos()
          .then((photos) => {
            setGalleryImages(photos);
            saveToLocalStorage(photos);
          })
          .catch((err) => console.error('Error fetching photos:', err));
      })
      .catch((err) => console.error('Error initializing database:', err));

    getFromLocalStorage().then(setGalleryImages);

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

        const newPhoto = {
          uri: result.uri,
          date,
          time,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        insertPhoto(
          newPhoto.uri,
          newPhoto.date,
          newPhoto.time,
          newPhoto.latitude,
          newPhoto.longitude
        )
          .then(() => {
            fetchPhotos()
              .then((photos) => {
                setGalleryImages(photos);
                saveToLocalStorage(photos);
              })
              .catch((err) => console.error('Error fetching photos:', err));
          })
          .catch((err) => console.error('Error inserting photo:', err));
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleDelete = (id) => {
    deleteFromLocalStorage(id);
    setGalleryImages((prev) => prev.filter((photo) => photo.id !== id));
  };

  const toggleGalleryView = () => {
    setShowGallery((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Gallery Content */}
      {showGallery ? (
        <FlatList
          data={galleryImages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.galleryItem}>
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
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

      {/* Footer */}
      <View style={styles.footer}>
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
    color: '#8B4513', // Brown color for Gallery text
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  folderButton: {
    marginLeft: 8,
    backgroundColor: '#8B8000', // Dark yellow color for folder button
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
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
});