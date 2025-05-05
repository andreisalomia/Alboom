import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import MessagesOverview from './components/MessagesOverview';
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
import MessagesPage from './components/MessagesPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSuccess = () => {
    login();
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

// gen folosim useAuth() in componente si chestii ca sa nu trimiti mereu userInfo ca e urat
// vezi in contexts/authcontext 
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <ToastContainer position='bottom-right' autoClose={3000} />
      <div className="App">
        <Navbar/>

        <Routes>
          <Route
            path="/"
            element={
              <HomePage />
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/messages" element={<MessagesOverview />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />

          <Route
            path="/profile/:userId/*"
            element={<UserProfile />}
          />
        </Routes>
      </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
