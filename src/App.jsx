// Project: Pranayama Trainer App (with Tailwind)
// Type: React + Tailwind CSS

import { useState, useRef } from 'react';
import { FaUserCircle, FaPause, FaStop } from 'react-icons/fa';
import './index.css';

const pranayamaOptions = [
  { label: 'Anulom Vilom', icon: '🧘' },
  { label: 'Kapalbhati', icon: '💨' },
  { label: 'Bhramari', icon: '🐝' },
];

function App() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState('Anulom Vilom');
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isSession, setIsSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const practiceRef = useRef(null);

  const startSession = () => {
    const totalSeconds = minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    setIsSession(true);
  };

  const scrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = () => {
    setUser({ name: 'Yogi', avatar: '' }); // Simulate login
  };

  return (
    <div className="font-sans text-gray-800">
      <header className="fixed top-0 left-0 w-full bg-white shadow-md flex items-center justify-between px-6 py-4 z-50">
        <h1 className="text-xl font-bold">🫁 Pranayama</h1>
        <nav className="space-x-4">
          <button className="hover:text-blue-600" onClick={scrollToPractice}>Start</button>
          {!user ? (
            <button className="hover:text-blue-600" onClick={handleLogin}>Login</button>
          ) : (
            <span className="hover:text-blue-600">Hello, {user.name}</span>
          )}
          <button className="hover:text-blue-600">History</button>
        </nav>
        <div className="flex items-center space-x-2">
          <FaUserCircle className="text-2xl" />
          <span>{user ? user.name : 'Guest'}</span>
        </div>
      </header>

      <section className="h-screen flex flex-col justify-center items-center bg-gray-100 pt-24">
        <h2 className="text-4xl font-semibold mb-6">Your Breath. Your Space.</h2>
        <button onClick={scrollToPractice} className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
          Start Session
        </button>
      </section>

      <main ref={practiceRef} className="px-6 py-12">
        {!isSession ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Start Your Practice</h2>

            <div className="mb-4">
              <label className="block mb-1">Pranayama Type</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {pranayamaOptions.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={minutes}
                  onChange={(e) => setMinutes(+e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(+e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <button onClick={startSession} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Start Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-100 rounded shadow p-4 mb-4 text-center h-64 flex items-center justify-center">
                <p>Live video from camera</p>
              </div>
              <div className="text-center text-lg mb-4">
                Timer: {String(Math.floor(timeLeft / 60)).padStart(2, '0')}
                :{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div className="flex justify-center space-x-4">
                <button className="bg-yellow-500 text-white p-2 rounded"><FaPause /></button>
                <button onClick={() => setIsSession(false)} className="bg-red-600 text-white p-2 rounded"><FaStop /></button>
              </div>
            </div>
            <div>
              <div className="bg-gray-100 rounded shadow p-4 mb-4 text-center h-64 flex items-center justify-center">
                <p>Recorded video to guide</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="font-semibold mb-2">Comments:</p>
                <ul className="list-disc list-inside">
                  <li>Breathe in and out</li>
                  <li>Correct posture count</li>
                  <li>Incorrect posture count</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
