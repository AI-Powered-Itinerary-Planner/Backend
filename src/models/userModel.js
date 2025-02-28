// Example user model (assuming you'll use a database later)
const db = require('../database/database');

class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

module.exports = User; 