import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Home({ onLogin }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>Welcome to Alboom</h1>
      <p>Ce pizda matii vrei ma</p>
      {!showLogin && !showRegister && (
        <>
          <button onClick={() => setShowLogin(true)}>Login</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </>
      )}

      {showLogin && <LoginForm onLogin={onLogin} />}
      {showRegister && <RegisterForm />}
      {(showLogin || showRegister) && (
        <button onClick={() => { setShowLogin(false); setShowRegister(false); }}>
          Back
        </button>
      )}
    </div>
  );
}
