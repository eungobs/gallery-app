import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

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

// Initialize the database and create the table
export const init = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY NOT NULL,
            uri TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            latitude REAL,
            longitude REAL
          );`,
          [],
          () => {
            console.log('Table created successfully');
          },
          (_, error) => {
            console.error('Error creating table:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error during init:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

// Fetch photos from the database
export const fetchPhotos = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM photos;',
          [],
          (_, result) => {
            if (!result || !result.rows) {
              console.error('No rows returned from fetchPhotos');
              reject(new Error('No rows returned'));
            } else {
              resolve(result);
            }
          },
          (_, error) => {
            console.error('Error executing fetchPhotos:', error);
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

// Insert a new photo
export const insertPhoto = (uri, date, time, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO photos (uri, date, time, latitude, longitude) VALUES (?, ?, ?, ?, ?);',
          [uri, date, time, latitude, longitude],
          (_, result) => {
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


