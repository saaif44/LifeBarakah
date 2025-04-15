import React, { useEffect, useState } from 'react';
import { FaSignOutAlt,FaTimes, FaUserCircle, FaEdit, FaTasks, FaListAlt, FaTrashAlt, FaPen,FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ token, onLogout }) {
  
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const localDate = new Date();
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()); // Convert to local ISO
    return localDate.toISOString().split('T')[0];
  });
  
  // Helper to get today's local date string
  const getLocalDateString = () => {
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().split('T')[0];
  };
  
  
  const isToday = selectedDate === getLocalDateString();
  
  const [showTimeMachineWarning, setShowTimeMachineWarning] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [updatedTaskTitle, setUpdatedTaskTitle] = useState('');
  const [newHabit, setNewHabit] = useState({
    title: '',
    tasks: ['']
  });

  const [editingHabit, setEditingHabit] = useState(null);
  const [updatedHabitTitle, setUpdatedHabitTitle] = useState('');
  

  useEffect(() => {
    fetchUser();
    fetchAllTasks(selectedDate);
  }, [selectedDate]);

  const fetchUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUser(data);
      setProfileForm({
        name: data.name || '',
        age: data.age || '',
        gender: data.gender || '',
        email: data.email || '',
        password: ''
      });
    } catch (err) {
      console.error('User fetch failed');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (!res.ok) throw new Error('Update failed');

      alert('Profile updated!');
      setShowEditProfile(false);
      fetchUser();
    } catch (err) {
      console.error('Profile update failed', err);
      alert('Something went wrong!');
    }
  };

  const handleCheckin = async (taskId) => {
    if (editMode) return;
    // if (selectedDate!= isToday){
    //   setShowTimeMachineWarning(true);
    //   return;
    // }
    // setShowTimeMachineWarning(false);
    try {
      await fetch(`http://localhost:5000/api/habits/task/checkin/${taskId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Check-in failed', err);
    }
  };
  
  

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await fetch(`http://localhost:5000/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Habit deletion failed', err);
    }
  };

  const fetchAllTasks = async (date) => {
    try {
      const habitRes = await fetch('http://localhost:5000/api/habits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const taskRes = await fetch(`http://localhost:5000/api/habits/all-tasks?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const habitsData = await habitRes.json();
      const tasksData = await taskRes.json();
      const habitIdMap = {};
      habitsData.forEach(h => {
        habitIdMap[h.title] = h.id;
      });
      const grouped = {};
      tasksData.forEach(task => {
        const title = task.habit_title;
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push({ ...task, habit_id: habitIdMap[title] || null });
      });
      setHabits(grouped);
    } catch (err) {
      console.error('Task fetch failed:', err);
    }
  };


  const handleAddHabit = async () => {
    try {
      await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newHabit.title,
          score: Number(newHabit.score),
          tasks: newHabit.tasks.filter(t => t.trim() !== '')
        })
      });
      setShowAddHabit(false);
      setNewHabit({ title: '', score: 0, tasks: [''] });
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Add habit failed');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setUpdatedTaskTitle(task.task_title);
  };

  const submitHabitEdit = async () => {
    try {
      await fetch(`http://localhost:5000/api/habits/${editingHabit.habit_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: updatedHabitTitle, score_unit: 5 })
      });
      setEditingHabit(null);
      setUpdatedHabitTitle('');
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Habit update failed', err);
    }
  };
  
 
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await fetch(`http://localhost:5000/api/habits/task/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Task deletion failed', err);
    }
  };
  

  const submitTaskEdit = async (taskId) => {
    try {
      await fetch(`http://localhost:5000/api/habits/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ task_title: updatedTaskTitle })
      });
      setEditingTask(null);
      setUpdatedTaskTitle('');
      setEditingHabit(null);
      fetchAllTasks(selectedDate);
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTaskToHabitId, setAddingTaskToHabitId] = useState(null);
  
  const handleAddTaskToHabit = async (habitId) => {
    if (!newTaskTitle.trim()) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/habits/${habitId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ task_title: newTaskTitle }),
      });
      // setEditingHabit(null);
      if (response.ok) {
        const newTask = await response.json();
                
        setNewTaskTitle('');
        setAddingTaskToHabitId(null);

                // ⬇ Update habits to include new task
    

      } else {
        console.error('Failed to add task:', await response.text());
      }
      
    } catch (err) {
      console.error('Error adding tasey:', err.message);
    }
  };



  
  
  console.log('User in handleAddTaskToHabit:', user);
console.log('Token:', token);


  
  


  return (

    
    <div className={`min-h-screen bg-gray-100 p-6 px-10 transition-all ${showAddHabit || showEditProfile ? 'backdrop-blur-sm' : ''}`}>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Eat healthy and stay active</h1>
          <p className="text-gray-500 italic">“Build your habits, build your future.”</p>
        </div>
    <div
  className="relative"
  tabIndex={0}
  onBlur={() => setProfileMenuOpen(false)}
>
  <button
    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
    className="w-10 h-10 flex items-center justify-center bg-white text-orange-500 rounded-full shadow hover:scale-105 transition-transform"
  >
    🏈
  </button>

  {profileMenuOpen && (
    <div
      className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-md z-10 p-3 space-y-2 text-sm"
      onMouseDown={(e) => e.preventDefault()} // prevent onBlur from triggering immediately
    >
      <p className="text-center font-semibold text-gray-800">{user?.name || 'saif'}</p>
      <hr />
      <button
        className="w-full text-left text-gray-700 hover:text-orange-500"
        onClick={() => setShowEditProfile(true)}
      >
        <FaEdit className="inline mr-2" />
        Edit Profile
      </button>

      <button
        className={`w-full text-left flex items-center ${
          editMode ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
        }`}
        onClick={() => setEditMode(!editMode)}
      >
        <FaListAlt className="inline mr-2" />
        Edit Habit
      </button>

      <button
        onClick={onLogout}
        className="w-full text-left text-red-500 hover:text-red-600"
      >
        <FaSignOutAlt className="inline mr-2" />
        Sign Out
      </button>
    </div>
  )}
</div>

      </header>

      {/* Date Picker */}
<div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-semibold text-gray-700">
    Your Habits on {selectedDate}
  </h2>
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border rounded p-2"
  />
</div>

{/* Habit List */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {Object.entries(habits).map(([habitTitle, tasks]) => (
    // {console.log(habitTitle, tasks);} 
    <div key={habitTitle} className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between items-center mb-2">
  {editingHabit?.habit_id === tasks[0]?.habit_id ? (
    <>
      <input
        value={updatedHabitTitle}
        onChange={(e) => setUpdatedHabitTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitHabitEdit();
        }}
        className="border px-2 py-1 rounded w-full"
      />
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={submitHabitEdit}
          className="text-green-600 hover:text-green-800"
        >
          Save
        </button>
        <button
          onClick={() => {
            setEditingHabit(null);
            setUpdatedHabitTitle('');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
    </>
  ) : (
    <>
      <h3 className="text-lg font-semibold">{habitTitle}</h3>
      {editMode && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingHabit({ habit_id: tasks[0]?.habit_id });
              setUpdatedHabitTitle(habitTitle);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaPen />
          </button>
          <button
            onClick={() => handleDeleteHabit(tasks[0]?.habit_id)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrashAlt />
          </button>
        </div>
      )}
    </>
  )}

  

</div>



      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.task_id}
            className={`flex justify-between items-center px-3 py-2 rounded transition-all duration-200 ${
              task.done ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-green-100'
            }`}
          >
            {!editMode ? (
              <button
              key={task.task_id}
              onClick={() => {
                if (isToday) {
                  handleCheckin(task.task_id, task.done);
                } else {
                  alert("You can only complete today's tasks.");
                }
              }}
              disabled={!isToday}
              className={`block w-full text-left px-4 py-2 rounded-md transition-all duration-200 ${
                !isToday ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {task.task_title}
            </button>
            
            
            ) : (
              <>
                {/* <span>{task.task_title}</span> */}
                {editingTask?.task_id === task.task_id ? (
  <>
    <input
      value={updatedTaskTitle}
      onChange={(e) => setUpdatedTaskTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submitTaskEdit();
      }}
      className="border px-2 py-1 rounded w-full"
    />
    <button
      onClick={() => submitTaskEdit(editingTask.task_id)}
      className="ml-2 text-green-600 hover:text-green-800"
    >
      Save
    </button>
  </>
) : (
  <span>{task.task_title}</span>
)}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.task_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

{/*Add task bar to add task in habit*/}
{editMode && editingHabit?.habit_id === tasks[0]?.habit_id && (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          setAddingTaskToHabitId(
            addingTaskToHabitId === tasks[0].habit_id ? null : tasks[0].habit_id
          )
        }
        className="text-green-500 hover:text-green-700"
      >
        <FaPlus />
      </button>
      {addingTaskToHabitId === tasks[0]?.habit_id && (
  <div className="mt-2 flex items-center gap-2">
    <input
      value={newTaskTitle}
      onChange={(e) => setNewTaskTitle(e.target.value)}
      className="border px-2 py-1 rounded w-full"
      placeholder="New task title"
    />
    <button
      onClick={() => handleAddTaskToHabit(tasks[0]?.habit_id)}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
    >
      Add
    </button>
    <button
      onClick={() => {
        setAddingTaskToHabitId(null);
        setNewTaskTitle('');
      }}
      className="text-gray-500 hover:text-gray-700"
    >
      <FaTimes />
    </button>
  </div>
)}


    </div>
  )} {/*done adding task bar*/}
        

      </div>
    </div>
))}

  

</div>


<div className="fixed bottom-6 right-6 flex flex-col items-center z-50">
  <button
    className="w-14 h-14 bg-blue-100 text-blue-500 text-3xl rounded-full shadow hover:scale-105 transition-all"
    onClick={() => setShowAddHabit(true)}
  >
    +
  </button>
  <span className="mt-2 text-sm text-gray-600">Add Habit</span>
</div>


      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
            <input
              type="text"
              placeholder="Habit title"
              value={newHabit.title}
              onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              className="w-full border p-2 rounded mb-3"
            />
           
            <div className="space-y-2 mb-4">
              {newHabit.tasks.map((task, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Task ${index + 1}`}
                  value={task}
                  onChange={(e) => {
                    const updatedTasks = [...newHabit.tasks];
                    updatedTasks[index] = e.target.value;
                    setNewHabit({ ...newHabit, tasks: updatedTasks });
                  }}
                  className="w-full border p-2 rounded"
                />
              ))}
              <button
                className="text-blue-500 text-sm underline"
                onClick={() => setNewHabit({ ...newHabit, tasks: [...newHabit.tasks, ''] })}
              >
                + Add another task
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowAddHabit(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleAddHabit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    
    {/*edit profile*/}
    {showEditProfile && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      
      <input
        type="text"
        placeholder="Name"
        value={profileForm.name}
        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
        className="w-full border p-2 rounded mb-3"
      />
      <input
        type="number"
        placeholder="Age"
        value={profileForm.age}
        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
        className="w-full border p-2 rounded mb-3"
      />
      <select
        value={profileForm.gender}
        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
        className="w-full border p-2 rounded mb-3"
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        type="email"
        value={profileForm.email}
        disabled
        className="w-full border p-2 rounded mb-3 bg-gray-100 text-gray-500 cursor-not-allowed"
      />
      <p className="text-xs text-gray-400 mb-3">Email cannot be edited</p>

      <input
        type="password"
        placeholder="Change password (optional)"
        value={profileForm.password}
        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-4">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setShowEditProfile(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleProfileUpdate}
        >
          Save
        </button>
      </div>
    </div>
    </div>
    )}
    </div>
  );
}


