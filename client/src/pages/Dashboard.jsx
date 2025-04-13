import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';

// import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Fetch habits for the selected date from backend
    const fetchTasks = async () => {
      const res = await fetch(`/api/habits/all-tasks?date=${selectedDate.toISOString().split('T')[0]}`);
      const data = await res.json();
      const grouped = {};
      data.forEach(task => {
        if (!grouped[task.habit_title]) grouped[task.habit_title] = [];
        grouped[task.habit_title].push(task);
      });
      setHabits(grouped);
    };
    fetchTasks();
  }, [selectedDate]);

  const handleCheckin = async (taskId, done) => {
    await fetch(`/api/habits/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, date: selectedDate.toISOString().split('T')[0], done: !done })
    });
    setSelectedDate(new Date(selectedDate));
  };

  return (
    <div className="p-4 min-h-screen bg-white text-center">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">“Every small step counts”</h1>
          <p className="text-gray-500">Keep going Saif!</p>
        </div>
        <div className="relative">
          <FaUserCircle className="text-4xl cursor-pointer" onClick={() => setProfileOpen(!profileOpen)} />
          {profileOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 p-2 w-40">
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaEdit /> Edit Details</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaEdit /> Update Habit</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaTrashAlt /> Delete Habit</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"><FaSignOutAlt /> Sign Out</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-around items-center my-6">
        <div>
          <h2 className="text-lg mb-2">Build your First Habit</h2>
          <FaPlus className="text-6xl text-green-500 cursor-pointer" />
        </div>
        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border shadow" />
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Your Daily Task</h2>

      <div className="grid grid-cols-2 gap-4 justify-items-center">
        {Object.entries(habits).map(([habit, tasks], index) => (
          <motion.div
            key={habit}
            className="w-64 h-48 cursor-pointer [perspective:1000px]"
            onClick={() => setFlipped(prev => ({ ...prev, [habit]: !prev[habit] }))}
          >
            <motion.div
              className="relative w-full h-full rounded-xl shadow-md bg-white [transform-style:preserve-3d] transition-transform duration-500"
              animate={{ rotateY: flipped[habit] ? 180 : 0 }}
            >
              {/* Front Side */}
              <div className="absolute w-full h-full flex items-center justify-center text-xl font-bold border-2 border-gray-400 rounded-xl backface-hidden">
                {habit}
              </div>

              {/* Back Side */}
              <div className="absolute w-full h-full bg-gray-50 rounded-xl p-3 text-left [transform:rotateY(180deg)] backface-hidden">
                <p className="font-semibold text-center mb-2">{habit}</p>
                {tasks.map(task => (
                  <button
                    key={task.task_id}
                    className={`w-full my-1 p-2 text-sm font-medium rounded-md text-left ${task.done ? 'bg-green-400 text-white' : 'bg-white border'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckin(task.task_id, task.done);
                    }}
                  >
                    {task.task_title}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;