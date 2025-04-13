const pool = require('../config/db');

const createUser = async (name, age, gender, email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (name, age, gender, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, age, gender, email, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
};