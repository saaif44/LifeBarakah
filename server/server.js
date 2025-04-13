const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const pool = require('./config/db');
// const protect = require('./middleware/authMiddleware');

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
