import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-glow login-glow-1" />
      <div className="login-glow login-glow-2" />

      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">✈</div>
          <h1 className="login-title">TravelAI</h1>
          <p className="login-subtitle">Quotation Assistant — Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pwd-wrap">
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <><span className="login-spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
