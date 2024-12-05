// App.js
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
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import {
  initializeDatabase,
  addImage,
  getAllImages,
  deleteImage,
} from './database'; // Include your database functions here

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setupApp();
  }, []);

  const setupApp = async () => {
    try {
      setLoading(true);
      await initializeDatabase();
      await requestPermissions();
      await refreshGallery();
    } catch (error) {
      console.error('Error setting up app:', error);
      Alert.alert('Error', 'Failed to initialize the app');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
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
  };

  const refreshGallery = async () => {
    try {
      setRefreshing(true);
      const images = await getAllImages();
      setGalleryImages(images);
    } catch (error) {
      console.error('Error refreshing gallery:', error);
      Alert.alert('Error', 'Failed to load images');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCameraPress = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        const location = await Location.getCurrentPositionAsync({});
        const timestamp = new Date().toISOString();

        const photoData = {
          uri: photoUri,
          timestamp,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          name: `Photo_${timestamp.substring(0, 10)}`,
        };

        setNewPhoto(photoData);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleSavePhoto = async () => {
    if (!newPhoto) {
      Alert.alert('No photo', 'Please take a photo first');
      return;
    }

    try {
      setLoading(true);
      await addImage(
        newPhoto.uri,
        newPhoto.timestamp,
        newPhoto.latitude,
        newPhoto.longitude,
        newPhoto.name
      );
      await refreshGallery();
      setNewPhoto(null);
      setShowGallery(true);
      Alert.alert('Success', 'Photo saved successfully');
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteImage(id);
      await refreshGallery();
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  const openLocationInMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert('Error', 'Failed to open map: ' + err.message)
    );
  };

  const filteredImages = galleryImages.filter((image) =>
    image.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderGalleryItem = ({ item }) => (
    <View style={styles.galleryItem}>
      <Image source={{ uri: item.filePath }} style={styles.galleryImage} />
      <View style={styles.imageDetails}>
        <Text style={styles.imageName}>{item.name}</Text>
        <Text style={styles.imageDate}>
          Date: {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => openLocationInMap(item.latitude, item.longitude)}
          >
            <Ionicons name="location" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Gallery</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.folderButton} onPress={() => setShowGallery(!showGallery)}>
            <Ionicons name={showGallery ? 'grid' : 'folder'} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {showGallery ? (
        <FlatList
          data={filteredImages}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.galleryList}
          onRefresh={refreshGallery}
          refreshing={refreshing}
        />
      ) : (
        <View style={styles.previewContainer}>
          {newPhoto ? (
            <Image source={{ uri: newPhoto.uri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.instructionText}>
              Tap the camera icon to take a photo or the folder icon to view saved images.
            </Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        {newPhoto && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePhoto}>
            <Text style={styles.saveButtonText}>Save Photo</Text>
          </TouchableOpacity>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  folderButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 8,
},
locationButton: {
  backgroundColor: '#007AFF',
  padding: 8,
  borderRadius: 6,
  marginRight: 8,
  justifyContent: 'center',
  alignItems: 'center',
},

  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  galleryList: {
    padding: 8,
  },
  galleryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  galleryImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  imageDetails: {
    padding: 12,
  },
  imageName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  imageDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  imageLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#34c759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});