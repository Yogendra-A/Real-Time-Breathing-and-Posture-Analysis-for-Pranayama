// src/components/LoginDropdown.jsx
import { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function LoginDropdown() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      setOpen(false);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-800">{user.email}</span>
          <button
            onClick={logout}
            className="text-xs text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="hover:text-blue-600"
          >
            Login
          </button>
          {open && (
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
