const pool = require('../config/db');

const createUser = async (name, age, gender, email, password) => {
  const result = await pool.query(
    'INSERT INTO users (name, age, gender, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, age, gender, email, password]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const updateUserDetails = async (id, name, age, gender) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, age = $2, gender = $3 WHERE id = $4 RETURNING *',
    [name, age, gender, id]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUserDetails
};