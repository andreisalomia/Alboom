import { useState } from 'react';
import './styles/App.css';
import { jwtDecode } from 'jwt-decode';
import HomePage from './components/Home';
// import Dashboard from './components/Dashboard';

function App() {
  const token = localStorage.getItem('token');
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo(null);
  };

  const handleLogin = () => {
    const newToken = localStorage.getItem('token');
    setUserInfo(jwtDecode(newToken));
  };

  return (
    <div className="App">
      <HomePage user={userInfo} onLogin={handleLogin} onLogout={handleLogout} />

      {userInfo?.role === 'admin' && (
        <div style={{ marginTop: '3rem' }}>
        </div>
      )}
    </div>
  );
}

export default App;
