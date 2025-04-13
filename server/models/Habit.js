const pool = require('../config/db');

const createHabit = async (userId, title, score) => {
  const result = await pool.query(
    'INSERT INTO habits (user_id, title, score_unit) VALUES ($1, $2, $3) RETURNING *',
    [userId, title, score]
  );
  return result.rows[0];
};

const addHabitTask = async (habitId, title) => {
  const result = await pool.query(
    'INSERT INTO habit_tasks (habit_id, title) VALUES ($1, $2) RETURNING *',
    [habitId, title]
  );
  return result.rows[0];
};

const getHabitsByUser = async (userId) => {
  const result = await pool.query('SELECT * FROM habits WHERE user_id = $1', [userId]);
  return result.rows;
};

const checkInTask = async (taskId, userId, done, point, date) => {
  const result = await pool.query(
    'INSERT INTO task_checkins (task_id, user_id, done, point, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [taskId, userId, done, point, date]
  );
  return result.rows[0];
};

const getTaskCheckins = async (userId, date) => {
  const result = await pool.query(
    'SELECT * FROM task_checkins WHERE user_id = $1 AND date = $2',
    [userId, date]
  );
  return result.rows;
};

module.exports = {
  createHabit,
  addHabitTask,
  getHabitsByUser,
  checkInTask,
  getTaskCheckins,
};