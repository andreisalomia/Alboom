import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import MessagesOverview from './components/MessagesOverview';
import Navbar from './components/Navbar';
import HomePage from './components/Home';
import SongDetail from './components/SongDetail';
import AlbumDetail from './components/AlbumDetail';
import ArtistDetail from './components/ArtistDetail';
import UserProfile from './components/UserProfile';
import ProfileSettings from './components/ProfileSettings';
import ResetPasswordForm from './components/ResetPasswordForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import VerifyCodeForm from './components/VerifyCodeForm';
import MessagesPage from './components/MessagesPage';
import ThreadsPage from './components/ThreadsPage';
import ThreadDetail from './components/ThreadDetail';
import { SocketProvider } from './contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventDetail from './components/EventDetail';
import Artists from './components/Artists';
import TopSongs from './components/TopSongs';

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
  return <VerifyCodeForm email={email} onVerified={() => navigate('/login')} />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />        <Route path="/artist/:id" element={<ArtistDetail />} />        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/topsongs" element={<TopSongs />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/threads" element={<ThreadsPage />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
        <Route path="/messages" element={<MessagesOverview />} />
        <Route path="/messages/:userId" element={<MessagesPage />} />
        <Route path="/profile/:userId/*" element={<UserProfile />} />
        <Route
          path="/settings"
          element={user ? <ProfileSettings /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <NotificationProvider>
        <ToastContainer position="bottom-right" autoClose={3000} />
        <AppContent />
      </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
