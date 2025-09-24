import { useState } from "react";

export default function useAuth() {
  // Dummy user state for demo; replace with Firebase logic as needed
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Replace with real authentication
    setUser({ email });
  };

  const logout = () => setUser(null);

  return { user, login, logout };
}