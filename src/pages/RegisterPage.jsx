import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserLoginPage.css';
import './RegisterPage.css';

// Hero slideshow images (same set as login)
const HERO_IMAGES = [
    `${process.env.PUBLIC_URL}/wallaper_login.jpg`,
    `${process.env.PUBLIC_URL}/login-hero.jpg`,
    `${process.env.PUBLIC_URL}/travel-hero.png`,
    `${process.env.PUBLIC_URL}/admin-bg.png`,
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(i => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="ulogin-wrap">
      {/* Hero side with slideshow */}
      <div className="ulogin-hero reg-hero">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`ulogin-hero-slide${i === heroIdx ? ' active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="ulogin-hero-overlay" style={{ background: 'linear-gradient(120deg, rgba(5,12,26,0.3) 0%, rgba(5,12,26,0.6) 60%, rgba(5,12,26,0.93) 100%)' }} />
        <div className="ulogin-hero-content">
          <div className="ulogin-hero-badge">
            <i className="fas fa-rocket" /> &nbsp;New Account
          </div>
          <h1 className="ulogin-hero-title">Start Your<br />Travel Journey</h1>
          <p className="ulogin-hero-sub">Join thousands of travelers who use TravelAI to plan perfect holidays with AI-powered quotations.</p>
          <div className="reg-features">
            {[
              { icon: 'fa-brain', text: 'AI-powered travel planning' },
              { icon: 'fa-clock', text: 'Instant quotation generation' },
              { icon: 'fa-shield', text: 'Secure & private' },
            ].map(f => (
              <div key={f.icon} className="reg-feature-item">
                <div className="reg-feature-icon"><i className={`fas ${f.icon}`} /></div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* Form side */}
      <div className="ulogin-form-panel">
        <div className="ulogin-form-inner" style={{ maxWidth: 460 }}>
          <div className="ulogin-brand">
            <div className="ulogin-logo" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              <i className="fas fa-user-plus" />
            </div>
            <div>
              <h2 className="ulogin-title">Create Account</h2>
              <p className="ulogin-sub">Join TravelAI — it's free!</p>
            </div>
          </div>

          {error && <div className="ulogin-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

          <form onSubmit={handleSubmit} className="ulogin-form">
            <div className="form-group">
              <label className="form-label"><i className="fas fa-user" style={{ marginRight: 6, color: '#10b981' }} />Full Name</label>
              <input className="form-input" type="text" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Smith" required autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label"><i className="fas fa-envelope" style={{ marginRight: 6, color: '#10b981' }} />Email Address</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" required />
            </div>

            <div className="reg-pwd-row">
              <div className="form-group">
                <label className="form-label"><i className="fas fa-lock" style={{ marginRight: 6, color: '#10b981' }} />Password</label>
                <div className="input-icon-wrap">
                  <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 chars" required minLength={6} style={{ paddingRight: 44 }} />
                  <button type="button" className="input-toggle" onClick={() => setShowPwd(p => !p)}>
                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><i className="fas fa-check" style={{ marginRight: 6, color: '#10b981' }} />Confirm</label>
                <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter" required />
              </div>
            </div>

            <button type="submit" className="ulogin-btn" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> Creating account...</>
                : <><i className="fas fa-user-plus" /> Create Account</>
              }
            </button>
          </form>

          <div className="ulogin-divider"><span>already have an account?</span></div>
          <div className="ulogin-links">
            <p><Link to="/login"><i className="fas fa-arrow-left" style={{ marginRight: 6 }} />Back to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
