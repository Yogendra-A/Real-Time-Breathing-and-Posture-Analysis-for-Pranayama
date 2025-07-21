import React, { useEffect, useRef, useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import beepSound from './assets/beep.mp3';

const App = () => {
  const [selectedPranayama, setSelectedPranayama] = useState('Pranayama');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const beep = new Audio(beepSound);

  const videoLinks = {
    Pranayama: 'https://www.youtube.com/embed/QXEj8U8s9uw',
    Kapalabhati: 'https://www.youtube.com/embed/4cKbbzFWHFA',
  };

  useEffect(() => {
    if (isRunning && !isPaused && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, timer]);

  useEffect(() => {
    if (timer === 0 && isRunning) {
      setIsRunning(false);
      beep.play();
      saveSession();
    }
  }, [timer]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Camera error:', err));
  }, []);

  const startSession = () => {
    setTimer(60); // 1 minute session, adjust if needed
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseSession = () => setIsPaused(true);
  const resumeSession = () => setIsPaused(false);
  const endSession = () => {
    setIsRunning(false);
    setTimer(0);
    saveSession();
  };

  const saveSession = async () => {
    try {
      await addDoc(collection(db, 'sessions'), {
        pranayama: selectedPranayama,
        duration: 60 - timer,
        date: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const fetchHistory = async () => {
    const querySnapshot = await getDocs(collection(db, 'sessions'));
    const data = querySnapshot.docs.map(doc => doc.data());
    setHistory(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Pranayama Trainer</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setSelectedPranayama('Pranayama')} className={`px-4 py-2 rounded ${selectedPranayama === 'Pranayama' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Pranayama</button>
        <button onClick={() => setSelectedPranayama('Kapalabhati')} className={`px-4 py-2 rounded ${selectedPranayama === 'Kapalabhati' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Kapalabhati</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-4">
        <video ref={webcamRef} autoPlay className="rounded w-full h-64 object-cover border" />
        <iframe
          className="w-full h-64 border rounded"
          src={videoLinks[selectedPranayama]}
          title="Reference Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="text-4xl font-mono mb-4">{timer}s</div>

      <div className="flex gap-4 mb-6">
        {!isRunning && <button onClick={startSession} className="bg-green-500 text-white px-4 py-2 rounded">Start</button>}
        {isRunning && !isPaused && <button onClick={pauseSession} className="bg-yellow-500 text-white px-4 py-2 rounded">Pause</button>}
        {isRunning && isPaused && <button onClick={resumeSession} className="bg-blue-500 text-white px-4 py-2 rounded">Resume</button>}
        {isRunning && <button onClick={endSession} className="bg-red-500 text-white px-4 py-2 rounded">End</button>}
      </div>

      <button onClick={fetchHistory} className="mb-4 bg-gray-800 text-white px-4 py-2 rounded">View History</button>

      <div className="w-full max-w-xl">
        {history.map((h, idx) => (
          <div key={idx} className="bg-white rounded shadow p-2 mb-2">
            <p><strong>{h.pranayama}</strong> - {h.duration}s</p>
            <p className="text-sm text-gray-500">{new Date(h.date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
