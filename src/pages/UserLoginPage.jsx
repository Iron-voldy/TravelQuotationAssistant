import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserLoginPage.css';

// Hero slideshow images (all placed in /public)
const HERO_IMAGES = [
    `${process.env.PUBLIC_URL}/wallaper_login.jpg`,
    `${process.env.PUBLIC_URL}/login-hero.jpg`,
    `${process.env.PUBLIC_URL}/travel-hero.png`,
    `${process.env.PUBLIC_URL}/admin-bg.png`,
];

// Animated particles
const Particles = () => (
    <div className="particles">
        {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${8 + Math.random() * 12}s`,
                animationDelay: `${Math.random() * -15}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                opacity: 0.3 + Math.random() * 0.5,
            }} />
        ))}
    </div>
);

const UserLoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
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
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.user?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="ulogin-wrap">
            <Particles />

            {/* Left hero panel — auto-rotating slideshow */}
            <div className="ulogin-hero">
                {/* All images stacked — active one fades in via CSS */}
                {HERO_IMAGES.map((img, i) => (
                    <div
                        key={i}
                        className={`ulogin-hero-slide${i === heroIdx ? ' active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                {/* Dot indicators */}
                <div className="ulogin-dots">
                    {HERO_IMAGES.map((_, i) => (
                        <button
                            key={i}
                            className={`ulogin-dot${i === heroIdx ? ' active' : ''}`}
                            onClick={() => setHeroIdx(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
                <div className="ulogin-hero-overlay" />
                <div className="ulogin-hero-content">
                    
                    <h1 className="ulogin-hero-title">Your Dream Journey<br />Starts Here</h1>
                    <p className="ulogin-hero-sub">Get AI-generated travel quotations in seconds. Personalized, fast, and hassle-free.</p>
                    <div className="ulogin-hero-stats">
                        <div className="hero-stat"><span className="hero-stat-val">100%</span><span className="hero-stat-label">Automation</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><span className="hero-stat-val">98%</span><span className="hero-stat-label">Satisfaction</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><span className="hero-stat-val">24/7</span><span className="hero-stat-label">AI Support</span></div>
                    </div>
                </div>
                
            </div>

            {/* Right form panel */}
            <div className="ulogin-form-panel">
                <div className="ulogin-form-inner">
                    <div className="ulogin-brand">
                        <div className="ulogin-logo"><i className="fas fa-plane-departure" /></div>
                        <div>
                            <h2 className="ulogin-title">Welcome Back</h2>
                            <p className="ulogin-sub">Sign in to your TravelAI account</p>
                        </div>
                    </div>

                    {error && (
                        <div className="ulogin-error">
                            <i className="fas fa-exclamation-circle" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="ulogin-form">
                        <div className="form-group">
                            <label className="form-label"><i className="fas fa-envelope" style={{ marginRight: 6, color: 'var(--accent-blue)' }} />Email Address</label>
                            <div className="input-icon-wrap">
                                <input className="form-input ulogin-input" type="email" value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="you@example.com" required autoFocus />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label"><i className="fas fa-lock" style={{ marginRight: 6, color: 'var(--accent-blue)' }} />Password</label>
                            <div className="input-icon-wrap">
                                <input className="form-input ulogin-input" type={showPwd ? 'text' : 'password'} value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••" required style={{ paddingRight: 46 }} />
                                <button type="button" className="input-toggle" onClick={() => setShowPwd(p => !p)}>
                                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="ulogin-btn" disabled={loading}>
                            {loading
                                ? <><span className="btn-spinner" /> Signing in...</>
                                : <><i className="fas fa-sign-in-alt" /> Sign In</>
                            }
                        </button>
                    </form>

                    <div className="ulogin-divider">
                        <span>OR</span>
                    </div>

                    <Link to="/agent-login" className="ulogin-agent-btn">
                        <img src={`${process.env.PUBLIC_URL}/user.gif`} alt="Agent" className="ulogin-agent-gif" />
                        <div className="ulogin-agent-btn-text">
                            <span className="ulogin-agent-btn-title">Admin Login</span>
                            <span className="ulogin-agent-btn-sub">Sign in as an admin</span>
                        </div>
                        <i className="fas fa-arrow-right ulogin-agent-arrow" />
                    </Link>

                    <div className="ulogin-links" style={{ marginTop: 20 }}>
                        <p>Don't have an account? <Link to="/register">Create Account →</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLoginPage;
