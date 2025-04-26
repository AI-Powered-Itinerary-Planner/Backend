// Itinerary model
const db = require('../database/database.js');

class Itinerary {
  constructor(id, auth_id, title, start_date, end_date, destination, description, json_data) {
    this.id = id;
    this.auth_id = auth_id;
    this.title = title;
    this.start_date = start_date;
    this.end_date = end_date;
    this.destination = destination;
    this.description = description;
    this.json_data = json_data;
  }

  // Create a new itinerary
  static async create(itineraryData) {
    try {
      const { auth_id, title, start_date, end_date, destination, description, json_data } = itineraryData;
      
      // Ensure json_data is provided and is a string
      if (!json_data) {
        throw new Error('json_data is required');
      }
      
      // Convert json_data to string if it's an object
      const jsonString = typeof json_data === 'object' ? JSON.stringify(json_data) : json_data;
      
      const result = await db.promiseRun(
        `INSERT INTO itineraries (auth_id, title, start_date, end_date, destination, description, json_data) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [auth_id, title, start_date, end_date, destination, description, jsonString]
      );
      
      return { 
        id: result.lastID, 
        auth_id, 
        title, 
        start_date, 
        end_date, 
        destination, 
        description, 
        json_data 
      };
    } catch (error) {
      console.error('Error creating itinerary:', error.message);
      throw error;
    }
  }

  // Get all itineraries for a user
  static async getAllByUser(auth_id) {
    try {
      return await db.promiseAll(
        'SELECT * FROM itineraries WHERE auth_id = ? ORDER BY start_date DESC',
        [auth_id]
      );
    } catch (error) {
      console.error(`Error getting itineraries for user ${auth_id}:`, error.message);
      throw error;
    }
  }

  // Get a single itinerary by ID
  static async getById(id) {
    try {
      return await db.promiseGet(
        'SELECT * FROM itineraries WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error(`Error getting itinerary with ID ${id}:`, error.message);
      throw error;
    }
  }

  // Update an itinerary
  static async update(id, itineraryData) {
    try {
      const { title, start_date, end_date, destination, description, json_data } = itineraryData;
      
      const updates = [];
      const values = [];

      if (title) {
        updates.push('title = ?');
        values.push(title);
      }

      if (start_date) {
        updates.push('start_date = ?');
        values.push(start_date);
      }

      if (end_date) {
        updates.push('end_date = ?');
        values.push(end_date);
      }

      if (destination) {
        updates.push('destination = ?');
        values.push(destination);
      }
      
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      
      if (json_data) {
        // Convert json_data to string if it's an object
        const jsonString = typeof json_data === 'object' ? JSON.stringify(json_data) : json_data;
        updates.push('json_data = ?');
        values.push(jsonString);
      }

      if (updates.length === 0) {
        throw new Error('No updates provided');
      }

      values.push(id);

      const result = await db.promiseRun(
        `UPDATE itineraries SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      if (result.changes === 0) {
        throw new Error('Itinerary not found');
      }

      return await this.getById(id);
    } catch (error) {
      console.error(`Error updating itinerary with ID ${id}:`, error.message);
      throw error;
    }
  }

  // Delete an itinerary
  static async delete(id) {
    try {
      const result = await db.promiseRun('DELETE FROM itineraries WHERE id = ?', [id]);
      if (result.changes === 0) {
        throw new Error('Itinerary not found');
      }
      return { success: true, message: 'Itinerary deleted successfully' };
    } catch (error) {
      console.error(`Error deleting itinerary with ID ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = Itinerary;
