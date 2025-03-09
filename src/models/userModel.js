// Example user model (assuming you'll use a database later)
const db = require('../database/database.js');
class User {
  constructor(id, name, email,password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password
  }

// Create a new user
static async create(userData) {
  try {
    const { name, email, password } = userData;
    const result = await db.promiseRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return { id: result.lastID, name, email };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

// Get all users
static async getAll() {
  try {
    return await db.promiseAll('SELECT id, name, email, created_at FROM users');
  } catch (error) {
    console.error('Error getting all users:', error.message);
    throw error;
  }
}

// Get user by ID
static async getById(id) {
  try {
    return await db.promiseGet(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error(`Error getting user with ID ${id}:`, error.message);
    throw error;
  }
}

// Update a user
static async update(id, userData) {
  try {
    const { name, email, password } = userData;
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (password) {
      updates.push('password = ?');
      values.push(password);
    }

    if (updates.length === 0) {
      throw new Error('No updates provided');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await db.promiseRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.changes === 0) {
      throw new Error('User not found');
    }

    return await this.getById(id);
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error.message);
    throw error;
  }
}

// Delete a user
static async delete(id) {
  try {
    const result = await db.promiseRun('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
      throw new Error('User not found');
    }
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error.message);
    throw error;
  }
}
}

module.exports = User; 