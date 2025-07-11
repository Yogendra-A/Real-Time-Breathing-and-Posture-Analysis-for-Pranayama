// Project: Pranayama Trainer App (with Tailwind)
// Type: React + Tailwind CSS

import { useEffect, useState, useRef } from 'react';
import { FaUserCircle, FaPause, FaStop, FaPlay } from 'react-icons/fa';
import './index.css';
import useAuth from './hooks/useAuth';
import { db } from './firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

const pranayamaOptions = [
  { label: 'Anulom Vilom', icon: '🧘', video: '/anulom.mp4' },
  { label: 'Kapalbhati', icon: '💨', video: '/kapalbhati.mp4' },
  { label: 'Bhramari', icon: '🐝', video: '/bhramari.mp4' },
];

function App() {
  const { user, login, logout, register } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [selected, setSelected] = useState('Anulom Vilom');
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [isSession, setIsSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const practiceRef = useRef(null);

  useEffect(() => {
    if (isSession && timeLeft > 0 && !isPaused) {
      const id = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (timeLeft === 0) {
      clearInterval(intervalId);
      setIsSession(false);
      if (user) saveSession();
    }
  }, [isSession, timeLeft, isPaused]);

  const scrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSession = () => {
    const totalSeconds = minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    setIsPaused(false);
    setIsSession(true);
  };

  const pauseSession = () => {
    setIsPaused(true);
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const stopSession = () => {
    clearInterval(intervalId);
    setIsSession(false);
    setTimeLeft(null);
  };

  const saveSession = async () => {
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        pranayama: selected,
        duration: minutes * 60 + seconds,
        timestamp: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const q = query(
        collection(db, 'sessions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      if (isRegistering) {
        if (!register) throw new Error("Register function is not available.");
        await register(email, password);
      } else {
        await login(email, password);
      }
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email or password.');
    }
  };

  const selectedVideo = pranayamaOptions.find((opt) => opt.label === selected)?.video || '/sample-pranayama.mp4';

  return (
    <div className="font-sans text-gray-800">
      <header className="fixed top-0 left-0 w-full bg-white shadow-md flex items-center justify-between px-6 py-4 z-50">
        <h1 className="text-xl font-bold">🫁 Pranayama</h1>
        <nav className="space-x-4">
          <button className="hover:text-blue-600" onClick={scrollToPractice}>Start</button>
          <div className="inline-block relative">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-800">{user.email}</span>
                <button onClick={logout} className="text-xs text-red-500 hover:underline">Logout</button>
              </div>
            ) : (
              <div>
                <button onClick={() => setShowLogin(!showLogin)} className="hover:text-blue-600">Login</button>
                {showLogin && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded p-4 z-50">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full mb-2 border rounded px-3 py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full mb-2 border rounded px-3 py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <button
                      onClick={handleLogin}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      {isRegistering ? 'Register' : 'Login'}
                    </button>
                    <button
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-xs text-blue-500 mt-2 hover:underline"
                    >
                      {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="hover:text-blue-600" onClick={fetchSessions}>History</button>
        </nav>
      </header>

      <section className="h-screen flex flex-col justify-center items-center bg-gray-100 pt-24">
        <h2 className="text-4xl font-semibold mb-6">Your Breath. Your Space.</h2>
        <button onClick={scrollToPractice} className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
          Start Session
        </button>
      </section>

      <main ref={practiceRef} className="px-6 py-12">
        {showHistory ? (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Your Practice History</h3>
            {sessions.length === 0 ? <p>No sessions found.</p> : (
              <ul className="divide-y divide-gray-200">
                {sessions.map(session => (
                  <li key={session.id} className="py-2">
                    <div className="flex justify-between">
                      <span>{session.pranayama}</span>
                      <span>{Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                      <span>{new Date(session.timestamp.seconds * 1000).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : !isSession ? (
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
                {!isPaused ? (
                  <button onClick={pauseSession} className="bg-yellow-500 text-white p-2 rounded"><FaPause /></button>
                ) : (
                  <button onClick={resumeSession} className="bg-green-500 text-white p-2 rounded"><FaPlay /></button>
                )}
                <button onClick={stopSession} className="bg-red-600 text-white p-2 rounded"><FaStop /></button>
              </div>
            </div>
            <div>
              <div className="bg-gray-100 rounded shadow p-4 mb-4 text-center h-64 flex items-center justify-center">
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="rounded w-full h-full object-cover"
                />
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
