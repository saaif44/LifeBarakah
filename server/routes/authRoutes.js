const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, updateUserDetails } = require('../models/User');
const { createHabit, addHabitTask } = require('../models/Habit');
const protect = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

const defaultHabits = [
  {
    title: 'Prayer',
    score: 5,
    tasks: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  },
  {
    title: 'Drink Water',
    score: 1,
    tasks: ['Drink 1 glass', 'Drink 2 glasses', 'Drink 3 glasses']
  },
  {
    title: 'Workout',
    score: 2,
    tasks: ['Stretch', 'Pushups', 'Walk 15 mins']
  },
  {
    title: 'Read Quran',
    score: 3,
    tasks: ['Read 1 page', 'Read 2 pages', 'Read 5 pages']
  }
];

router.post('/signup', async (req, res) => {
  const { name, age, gender, email, password, useDefaults } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, age, gender, email, hashedPassword);

    if (useDefaults) {
      for (const habit of defaultHabits) {
        const createdHabit = await createHabit(user.id, habit.title, habit.score);
        for (const task of habit.tasks) {
          await addHabitTask(createdHabit.id, task);
        }
      }
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    res.json({ id: user.id, name: user.name, age: user.age, gender: user.gender, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

router.put('/update', protect, async (req, res) => {
  const { name, age, gender } = req.body;
  try {
    const updatedUser = await updateUserDetails(req.user.id, name, age, gender);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

module.exports = router;
