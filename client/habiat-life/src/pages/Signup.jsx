// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', age: '', gender: '', email: '', password: '', useDefaults: true });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://habit.saaifshuvo.online/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="w-full mb-3 px-3 py-2 border rounded" />
        <input name="age" value={form.age} onChange={handleChange} placeholder="Age" type="number" required className="w-full mb-3 px-3 py-2 border rounded" />
        <select name="gender" value={form.gender} onChange={handleChange} required className="w-full mb-3 px-3 py-2 border rounded">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="w-full mb-3 px-3 py-2 border rounded" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className="w-full mb-4 px-3 py-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Sign Up
        </button>
        <p className="text-sm text-center mt-3">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </form>
    </div>
  );
}