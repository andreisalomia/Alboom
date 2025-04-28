import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import Navbar from './components/Navbar';
import HomePage from './components/Home';
import SongDetail from './components/SongDetail';
import AlbumDetail from './components/AlbumDetail';
import ArtistDetail from './components/ArtistDetail';
import UserProfile from './components/UserProfile';
import ResetPasswordForm from './components/ResetPasswordForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import VerifyCodeForm from './components/VerifyCodeForm';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const handleSuccess = () => {
    onLogin();
    navigate('/');
  };
  return <LoginForm onLogin={handleSuccess} />;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  if (!email) {
    return <RegisterForm onRegistered={setEmail} />;
  }
  // once registered, show the verification step
  return <VerifyCodeForm email={email} onVerified={() => navigate('/login')} />;
}

function App() {
  const token = localStorage.getItem('token');
  const [userInfo, setUserInfo] = useState(() => {
    try { return token ? jwtDecode(token) : null; }
    catch { return null; }
  });

  const handleLogin = () => {
    const newToken = localStorage.getItem('token');
    setUserInfo(jwtDecode(newToken));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserInfo(null);
  };

  return (
    <div className="App">
      <Navbar user={userInfo} />

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

        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route
          path="/profile/:userId/*"
          element={<UserProfile currentUser={userInfo} />}
        />
      </Routes>
    </div>
  );
}

export default App;
