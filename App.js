import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { init, insertPhoto, fetchPhotos } from './database';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    init()
      .then(() => {
        fetchPhotos().then((result) => {
          const photos = [];
          for (let i = 0; i < result.rows.length; i++) {
            photos.push(result.rows.item(i));
          }
          setGalleryImages(photos);
        });
      })
      .catch((err) => {
        console.log(err);
      });

    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
        }
      }
    })();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
      }
    })();
  }, []);

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchText);
  };

  const handleCameraPress = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      const location = await Location.getCurrentPositionAsync({});
      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
      insertPhoto(result.uri, date, time, location.coords.latitude, location.coords.longitude)
        .then(() => {
          fetchPhotos().then((result) => {
            const photos = [];
            for (let i = 0; i < result.rows.length; i++) {
              photos.push(result.rows.item(i));
            }
            setGalleryImages(photos);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSettingsPress = () => {
    // Implement settings functionality here
    console.log('Settings pressed');
  };

  const handleGalleryPress = () => {
    // Implement gallery functionality here
    console.log('Gallery pressed');
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
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Gallery Content */}
      <View style={styles.galleryContent}>
        {image && <Text>Photo taken: {image}</Text>}
        <FlatList
          data={galleryImages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.galleryItem}>
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
              <Text>Location: {item.latitude}, {item.longitude}</Text>
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
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
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
  galleryItem: {
    margin: 10,
    alignItems: 'center',
  },
  galleryImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
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