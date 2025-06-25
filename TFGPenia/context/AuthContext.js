// context/AuthContext.js
import { createContext, useState } from 'react';

export const AuthContext = createContext({
  user: null,
  authenticate: () => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  function authenticate(userData) {
    setUser(userData); // Ej: { uid, email }
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
