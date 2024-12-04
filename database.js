import { openDatabaseAsync } from 'expo-sqlite';
let db;
export const initializeDatabase = async () => {
  try {
    if (!db) {
      db = await openDatabaseAsync('mygallery.db');
    }
    // CREATE TABLE IF NOT EXISTS WITH PRAGMA JOURNAL MODE
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY NOT NULL,
        filePath TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        name TEXT NOT NULL
      );
    `);
    console.log('DATABASE INITIALIZED SUCCESSFULLY AND TABLE CREATED (IF NOT EXISTS).');
    return true;
  } catch (error) {
    console.error('ERROR INITIALIZING THE DATABASE:', error);
    throw new Error('Failed to initialize database');
  }
};
// ADD IMAGE TO DATABASE
export const addImage = async (filePath, timestamp, latitude, longitude, name) => {
  try {
    if (!db) throw new Error('DATABASE NOT INITIALIZED');
    const result = await db.runAsync(
      'INSERT INTO images (filePath, timestamp, latitude, longitude, name) VALUES (?, ?, ?, ?, ?)',
      filePath,
      timestamp,
      latitude,
      longitude,
      name
    );
    console.log('IMAGE INSERTED SUCCESSFULLY. ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('ERROR ADDING IMAGE:', error);
    throw new Error('Failed to add image to database');
  }
};
// GET ALL IMAGES FROM DATABASE
export const getAllImages = async () => {
  try {
    if (!db) throw new Error('DATABASE NOT INITIALIZED');
    const rows = await db.getAllAsync('SELECT * FROM images');
    console.log(`RETRIEVED ${rows.length} IMAGES SUCCESSFULLY`);
    return rows.map((row) => ({
      id: row.id,
      filePath: row.filePath,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      name: row.name,
    }));
  } catch (error) {
    console.error('ERROR RETRIEVING IMAGES:', error);
    throw new Error('Failed to retrieve images from database');
  }
};
// UPDATE IMAGE IN DATABASE
export const updateImage = async (id, latitude, longitude, name) => {
  try {
    if (!db) throw new Error('DATABASE NOT INITIALIZED');
    const result = await db.runAsync(
      'UPDATE images SET latitude = ?, longitude = ?, name = ? WHERE id = ?',
      latitude,
      longitude,
      name,
      id
    );
    if (result.changes === 0) {
      console.warn(`NO ROWS UPDATED FOR IMAGE ID: ${id}`);
      throw new Error('No image found with the specified ID');
    }
    console.log(`IMAGE UPDATED SUCCESSFULLY. ROWS MODIFIED: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('ERROR UPDATING IMAGE:', error);
    throw new Error('Failed to update image in database');
  }
};
// DELETE IMAGE FROM DATABASE
export const deleteImage = async (id) => {
  try {
    if (!db) throw new Error('DATABASE NOT INITIALIZED');
    const result = await db.runAsync('DELETE FROM images WHERE id = ?', id);
    if (result.changes === 0) {
      console.warn(`NO IMAGE FOUND WITH ID: ${id}`);
      throw new Error('No image found with the specified ID');
    }
    console.log(`IMAGE WITH ID ${id} DELETED SUCCESSFULLY`);
    return result.changes;
  } catch (error) {
    console.error('ERROR DELETING IMAGE:', error);
    throw new Error('Failed to delete image from database');
  }
};
// FETCH SINGLE IMAGE BY ID
export const getImageById = async (id) => {
  try {
    if (!db) throw new Error('DATABASE NOT INITIALIZED');
    const row = await db.getFirstAsync('SELECT * FROM images WHERE id = ?', id);
    if (!row) {
      console.warn(`NO IMAGE FOUND WITH ID: ${id}`);
      throw new Error('No image found with the specified ID');
    }
    console.log(`IMAGE WITH ID ${id} RETRIEVED SUCCESSFULLY`);
    return row;
  } catch (error) {
    console.error('ERROR RETRIEVING IMAGE:', error);
    throw new Error('Failed to retrieve image from database');
  }
};
