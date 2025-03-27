// Example user model (assuming you'll use a database later)
const db = require('../database/database.js');
class User {
  constructor(id, name, email, password, interests = '') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password
    this.interests = interests;
  }

// Create a new user
static async create(userData) {
  try {
    const { name, email, password, interests = '' } = userData;
    const result = await db.promiseRun(
      'INSERT INTO users (name, email, password, interests) VALUES (?, ?, ?, ?)',
      [name, email, password, interests]
    );
    return { id: result.lastID, name, email, interests };
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

// Get all users
static async getAll() {
  try {
    return await db.promiseAll('SELECT id, name, email FROM users');
  } catch (error) {
    console.error('Error getting all users:', error.message);
    throw error;
  }
}

// Get user by ID
static async getById(id) {
  try {
    return await db.promiseGet(
      'SELECT id, name, email FROM users WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error(`Error getting user with ID ${id}:`, error.message);
    throw error;
  }
}

// Get user by Email
static async getByEmail(email) {
  try {
    return await db.promiseGet(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );
  } catch (error) {
    console.error(`Error getting user with email ${email}:`, error.message);
    throw error;
  }
}

// Create or update user from Google OAuth
static async createOrUpdateFromGoogle(userData) {
  try {
    const { name, email, sub } = userData;
    
    // Check if user exists
    const existingUser = await this.getByEmail(email);
    
    if (existingUser) {
      // User exists, update their information if needed
      // We might want to update the name if it changed in Google
      await db.promiseRun(
        'UPDATE users SET name = ? WHERE email = ?',
        [name, email]
      );
      
      // Get the updated user
      return await this.getByEmail(email);
    } else {
      // Create new user
      try {
        const result = await db.promiseRun(
          'INSERT INTO users (name, email, password, auth_provider, auth_id) VALUES (?, ?, ?, ?, ?)',
          [name, email, `google_${sub}`, 'google', sub]
        );
        
        return { 
          id: result.lastID, 
          name, 
          email, 
          auth_provider: 'google',
          auth_id: sub
        };
      } catch (insertError) {
        console.error('Error inserting new user:', insertError);
        // Check if it's a constraint violation (e.g., unique email)
        if (insertError.message.includes('UNIQUE constraint failed')) {
          // Try to get the user one more time in case of race condition
          const user = await this.getByEmail(email);
          if (user) return user;
        }
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error creating/updating user from Google:', error.message);
    throw error;
  }
}

// Get user's interests by ID
static async getInterestsById(id) {
  try {
    const result = await db.promiseGet(
      'SELECT interests FROM users WHERE id = ?',
      [id]
    );
    if (!result) {
      throw new Error('User not found');
    }
    return result.interests;
  } catch (error) {
    console.error(`Error getting interests for user with ID ${id}:`, error.message);
    throw error;
  }
}

// Update a user
static async update(id, userData) {
  try {
    const { name, email, password, interests } = userData;
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

    if (interests) {
      updates.push('interests = ?');
      values.push(interests);
    }

    if (updates.length === 0) {
      throw new Error('No updates provided');
    }

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