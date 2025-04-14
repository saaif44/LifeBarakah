const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const pool = require('../config/db');
const {
  createHabit,
  addHabitTask,
  getHabitsByUser,
  toggleCheckIn ,
  getTaskCheckins
} = require('../models/Habit');

router.post('/', protect, async (req, res) => {
  const { title, score, tasks } = req.body;
  try {
    const habit = await createHabit(req.user.id, title, score);
    const taskResults = [];
    for (const taskTitle of tasks) {
      const task = await addHabitTask(habit.id, taskTitle);
      taskResults.push(task);
    }
    res.status(201).json({ habit, tasks: taskResults });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create habit', error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const habits = await getHabitsByUser(req.user.id);
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch habits', error: err.message });
  }
});

router.put('/task/checkin/:taskId', protect, async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  try {
    const updated = await toggleCheckIn(taskId, userId);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Check-in toggle failed', error: err.message });
  }
});



router.get('/checkins', protect, async (req, res) => {
  const date = req.query.date;
  try {
    const records = await getTaskCheckins(req.user.id, date);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
});

router.get('/all-tasks', protect, async (req, res) => {
  const date = req.query.date;
  try {
    const query = `
      SELECT ht.id as task_id, ht.title as task_title, h.title as habit_title, 
             tc.done, tc.point, tc.date
      FROM habit_tasks ht
      JOIN habits h ON ht.habit_id = h.id
      LEFT JOIN task_checkins tc ON tc.task_id = ht.id AND tc.date = $1 AND tc.user_id = $2
      WHERE h.user_id = $2
      ORDER BY h.title, ht.title;
    `;
    const { rows } = await pool.query(query, [date, req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get all tasks for date', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  const { title, score_unit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE habits SET title = $1, score_unit = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, score_unit, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Habit update failed', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Habit deletion failed', error: err.message });
  }
});

router.put('/task/:taskId', protect, async (req, res) => {
  const { task_title } = req.body;
  const taskId = req.params.taskId;

  if (!task_title) {
    return res.status(400).json({ message: 'task_title is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE habit_tasks SET title = $1 WHERE id = $2 RETURNING *',
      [task_title, taskId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Task update failed', error: err.message });
  }
});




// DELETE - delete a habit task
router.delete('/task/:taskId', protect, async (req, res) => {
  const taskId = req.params.taskId;

  try {
    await pool.query('DELETE FROM habit_tasks WHERE id = $1', [taskId]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Task deletion failed', error: err.message });
  }
});


// Add a task to an existing habit
router.post('/:habitId/tasks', protect, async (req, res) => {
  const { habitId } = req.params;
  const { task_title } = req.body;

  if (!task_title) {
    return res.status(400).json({ message: 'task_title is required' });
  }

  try {
    // Check if the habit belongs to the current user
    const habitCheck = await pool.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, req.user.id]
    );

    if (habitCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    // Insert the new task
    const result = await pool.query(
      'INSERT INTO habit_tasks (habit_id, title) VALUES ($1, $2) RETURNING *',
      [habitId, task_title]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add task to habit', error: err.message });
  }
});



module.exports = router;