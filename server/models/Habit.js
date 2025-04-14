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

const toggleCheckIn = async (taskId, userId) => {
  // Check if a check-in exists for this task today
  const result = await pool.query(
    `SELECT id, done FROM task_checkins
     WHERE task_id = $1 AND user_id = $2 AND date = CURRENT_DATE`,
    [taskId, userId]
  );

  if (result.rows.length > 0) {
    const checkin = result.rows[0];
    const newDone = checkin.done === null ? true : !checkin.done;
    const newPoint = newDone ? 1 : 0;

    const updated = await pool.query(
      `UPDATE task_checkins
       SET done = $1, point = $2
       WHERE id = $3
       RETURNING *`,
      [newDone, newPoint, checkin.id]
    );

    return updated.rows[0];
  } else {
    // No check-in yet for today — insert new one
    const inserted = await pool.query(
      `INSERT INTO task_checkins (task_id, user_id, done, point, date)
       VALUES ($1, $2, true, 1, CURRENT_DATE)
       RETURNING *`,
      [taskId, userId]
    );

    return inserted.rows[0];
  }
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
  toggleCheckIn,
  getTaskCheckins
};