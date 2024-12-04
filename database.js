import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable SQLite promise-based operations
SQLite.enablePromise(true);

// Open the SQLite database
const db = SQLite.openDatabase(
  {
    name: 'gallery.db',
    location: 'default',
  },
  () => {
    console.log('Database opened successfully');
  },
  (error) => {
    console.error('Error opening database:', error);
  }
);

// Initialize the database and create the `photos` table
export const init = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uri TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            latitude REAL,
            longitude REAL
          );`,
          [],
          () => {
            console.log('Table created successfully');
            resolve();
          },
          (_, error) => {
            console.error('Error creating table:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error during table creation:', error);
        reject(error);
      }
    );
  });
};

// Fetch all photos from the database
export const fetchPhotos = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM photos;',
          [],
          (_, result) => {
            const photos = [];
            for (let i = 0; i < result.rows.length; i++) {
              photos.push(result.rows.item(i));
            }
            resolve(photos);
          },
          (_, error) => {
            console.error('Error fetching photos:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error in fetchPhotos:', error);
        reject(error);
      }
    );
  });
};

// Insert a new photo into the database
export const insertPhoto = (uri, date, time, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO photos (uri, date, time, latitude, longitude) VALUES (?, ?, ?, ?, ?);',
          [uri, date, time, latitude, longitude],
          (_, result) => {
            console.log('Photo inserted successfully');
            resolve(result);
          },
          (_, error) => {
            console.error('Error inserting photo:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error during insertPhoto:', error);
        reject(error);
      }
    );
  });
};

// Save photos to AsyncStorage
export const saveToLocalStorage = async (photos) => {
  try {
    await AsyncStorage.setItem('photos', JSON.stringify(photos));
    console.log('Photos saved to local storage');
  } catch (error) {
    console.error('Error saving photos to local storage:', error);
  }
};

// Retrieve photos from AsyncStorage
export const getFromLocalStorage = async () => {
  try {
    const data = await AsyncStorage.getItem('photos');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving photos from local storage:', error);
    return [];
  }
};

// Delete a photo from both the database and local storage
export const deleteFromLocalStorage = async (id) => {
  try {
    const data = await getFromLocalStorage();
    const updatedPhotos = data.filter((photo) => photo.id !== id);
    await saveToLocalStorage(updatedPhotos);

    // Delete from SQLite database
    await deleteFromDatabase(id);

    console.log('Photo deleted successfully');
  } catch (error) {
    console.error('Error deleting photo from local storage:', error);
  }
};

// Delete a photo from the SQLite database
export const deleteFromDatabase = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM photos WHERE id = ?;',
          [id],
          (_, result) => {
            console.log(`Photo with id ${id} deleted from database`);
            resolve(result);
          },
          (_, error) => {
            console.error('Error deleting photo from database:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error during deleteFromDatabase:', error);
        reject(error);
      }
    );
  });
};
