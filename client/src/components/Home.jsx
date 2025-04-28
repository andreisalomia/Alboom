import { useState } from "react";
import Dashboard from "./Dashboard";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import MusicFeed from "./MusicFeed";
import SearchBar from "./SearchBar";
import VerifyCodeForm from "./VerifyCodeForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { useEffect } from "react";

export default function HomePage({ user, onLogin, onLogout }) {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [refreshFeed, setRefreshFeed] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        setShowChangePassword(false);
    }, [user]);

    const triggerRefresh = () => {
        setRefreshFeed((prev) => !prev);
    };

    return (
        <div style={{ textAlign: "center", paddingTop: "1rem", paddingBottom: "1rem" }}>
            <h1>Welcome to Alboom</h1>
            <SearchBar />

            {/* Login/Register */}
            {!user && !showLogin && !showRegister && (
                <>
                    <button onClick={() => setShowLogin(true)}>Login</button>
                    <button onClick={() => setShowRegister(true)}>
                        Register
                    </button>
                </>
            )}

            {showLogin && (
                <LoginForm
                    onLogin={() => {
                        onLogin();
                        setShowLogin(false);
                    }}
                />
            )}
            {showRegister && !registeredEmail && (
                <RegisterForm onRegistered={setRegisteredEmail} />
            )}

            {showRegister && registeredEmail && !isVerified && (
                <VerifyCodeForm
                    email={registeredEmail}
                    onVerified={() => setIsVerified(true)}
                />
            )}

            {showRegister && registeredEmail && isVerified && (
                <>
                    <p>Account verified. You can now log in.</p>
                    <button
                        onClick={() => {
                            setShowRegister(false);
                            setShowLogin(true);
                        }}
                    >
                        Go to Login
                    </button>
                </>
            )}
            {(showLogin || showRegister) && (
                <button
                    onClick={() => {
                        setShowLogin(false);
                        setShowRegister(false);
                    }}
                >
                    Back
                </button>
            )}

            {/* User Info + Logout */}
            {user && (
                <div style={{ margin: "1rem 0" }}>
                    <p>
                        Logged in as {user.name} ({user.role})
                    </p>
                    <button onClick={onLogout}>Logout</button>
                    <button onClick={() => setShowChangePassword(true)}>
                        Change Password
                    </button>
                    {showChangePassword && (
                        <ChangePasswordForm
                            onClose={() => setShowChangePassword(false)}
                        />
                    )}
                </div>
            )}

            {user?.role === "admin" && (
                <Dashboard
                    user={user}
                    onLogout={onLogout}
                    onRefresh={triggerRefresh}
                />
            )}

            {/* Featured Section */}
            <div style={{ marginTop: "3rem" }}>
                <MusicFeed refreshTrigger={refreshFeed} />
            </div>
        </div>
    );
}
