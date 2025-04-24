import { useState } from 'react';
import './styles/App.css';
import { jwtDecode } from 'jwt-decode';
import HomePage from './components/Home';
import { Routes, Route } from 'react-router-dom';
import SongDetail from './components/SongDetail';
import AlbumDetail from './components/AlbumDetail';
import ArtistDetail from './components/ArtistDetail';

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
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={userInfo}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
      </Routes>
    </div>
  );
}

export default App;
