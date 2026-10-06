import { useState } from 'react';
import { api } from '../lib/api';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onLogin(data.user, data.token);
      } else {
        const data = await api.signup(name, email, password);
        const loginData = await api.login(email, password);
        onLogin(loginData.user, loginData.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent)' }}>
        Fest Manager
      </h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <button 
          className="btn-outline" 
          style={{ border: 'none', color: 'var(--text-secondary)', padding: 0 }} 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
