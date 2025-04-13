const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createHabit,
  addHabitTask,
  getHabitsByUser,
  checkInTask,
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

// 🧾 POST /api/habits/checkin - track task done
router.post('/checkin', protect, async (req, res) => {
    const { taskId, done, point, date } = req.body;
    try {
      const record = await checkInTask(taskId, req.user.id, done, point, date);
      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ message: 'Check-in failed', error: err.message });
    }
  });
  
  // 📆 GET /api/habits/checkins?date=YYYY-MM-DD
  router.get('/checkins', protect, async (req, res) => {
    const date = req.query.date;
    try {
      const records = await getTaskCheckins(req.user.id, date);
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
  });
  
  module.exports = router;
  

  // 📆 GET /api/habits/all-tasks?date=YYYY-MM-DD
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
      const { rows } = await require('../config/db').query(query, [date, req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get all tasks for date', error: err.message });
    }
  });
  