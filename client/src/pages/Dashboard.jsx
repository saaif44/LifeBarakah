import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState({});
  const [flipped, setFlipped] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('User fetch failed');
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const date = selectedDate.toISOString().split('T')[0];
    try {
      const res = await fetch(`/api/habits/all-tasks?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const grouped = {};
      data.forEach(task => {
        if (!grouped[task.habit_title]) grouped[task.habit_title] = [];
        grouped[task.habit_title].push(task);
      });
      setHabits(grouped);
    } catch (err) {
      console.error('Task fetch failed');
    }
  };

  const handleCheckin = async (taskId, done) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/habits/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskId, done: !done, date: selectedDate.toISOString().split('T')[0] }),
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchUser();
    fetchTasks();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user ? user.name : 'Loading...'}</h1>
          <p className="text-gray-600 italic mt-1">“Discipline is the bridge between goals and achievement.”</p>
        </div>
        <div className="relative">
          <FaUserCircle className="text-4xl cursor-pointer" onClick={() => setProfileOpen(!profileOpen)} />
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-md border text-left z-50">
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaEdit /> Edit Profile</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaEdit /> Update Habits</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaTrashAlt /> Delete Habit</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2" onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}><FaSignOutAlt /> Sign Out</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-1">Add New Habit</h2>
          <FaPlus className="text-4xl text-green-500 cursor-pointer" />
        </div>
        <input
          type="date"
          className="border p-2 rounded-md shadow-sm"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      <h3 className="text-2xl font-semibold text-center text-green-600 mb-6">You're doing great! Keep it up! 💪</h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(habits).map(([habit, tasks]) => (
          <motion.div
            key={habit}
            className={`relative bg-white p-4 rounded-xl shadow-xl transform transition-transform duration-500 cursor-pointer ${flipped[habit] ? 'rotate-y-180' : ''}`}
            onClick={() => setFlipped(prev => ({ ...prev, [habit]: !prev[habit] }))}
          >
            {!flipped[habit] ? (
              <div className="text-center text-lg font-semibold text-gray-700">{habit}</div>
            ) : (
              <div>
                <p className="font-bold text-center mb-2">{habit} Tasks</p>
                {tasks.map(task => (
                  <button
                    key={task.task_id}
                    className={`w-full text-left px-3 py-2 rounded-md mb-2 font-medium transition-all duration-200 ${task.done ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckin(task.task_id, task.done);
                    }}
                  >
                    {task.task_title}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;