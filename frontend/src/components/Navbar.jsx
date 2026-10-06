import { Link } from 'react-router-dom';
import { Sparkles, LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <Sparkles size={24} color="var(--accent)" />
          FestManager
        </Link>
        <div className="navbar-nav">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <UserCircle size={20} />
            {user.name} <span className="badge">{user.role}</span>
          </span>
          <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
