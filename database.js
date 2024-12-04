// database.js
import { openDatabaseAsync } from 'expo-sqlite';

let db;

export const initializeDatabase = async () => {
  try {
    if (!db) {
      db = await openDatabaseAsync('mygallery.db');
    }
    
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
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const addImage = async (filePath, timestamp, latitude, longitude, name) => {
  try {
    if (!db) throw new Error('Database not initialized');
    if (!filePath) throw new Error('FilePath is required');
    
    const result = await db.runAsync(
      `INSERT INTO images (filePath, timestamp, latitude, longitude, name) 
       VALUES (?, ?, ?, ?, ?)`,
      [filePath, timestamp, latitude, longitude, name]
    );
    
    console.log('Image inserted successfully:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding image:', error);
    throw error;
  }
};

export const getAllImages = async () => {
  try {
    if (!db) throw new Error('Database not initialized');
    const rows = await db.getAllAsync('SELECT * FROM images ORDER BY timestamp DESC');
    console.log(`Retrieved ${rows.length} images successfully`);
    return rows.map((row) => ({
      id: row.id,
      filePath: row.filePath,
      timestamp: row.timestamp,
      latitude: row.latitude,
      longitude: row.longitude,
      name: row.name,
    }));
  } catch (error) {
    console.error('Error retrieving images:', error);
    throw error;
  }
};

export const deleteImage = async (id) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const result = await db.runAsync('DELETE FROM images WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      throw new Error('No image found with the specified ID');
    }
    
    console.log(`Image with ID ${id} deleted successfully`);
    return result.changes;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};