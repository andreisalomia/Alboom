import MusicFeed from './MusicFeed';

export default function Dashboard({ user, onLogout }) {
    return (
        <div>
            <h2>Welcome {user.name}</h2>
            <p>Your role: {user.role}</p>

            {user.role === "authenticated_user" && (
                <p>Welcome, authenticated user</p>
            )}
            {user.role === "admin" && <p>You have admin privileges.</p>}
            {user.role === "moderator" && (
                <p>Moderator dashboard access granted.</p>
            )}

            <button onClick={onLogout}>Logout</button>

            <MusicFeed />
        </div>
    );
}
