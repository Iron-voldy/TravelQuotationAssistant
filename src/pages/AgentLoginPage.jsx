import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AgentLoginPage.css';

const AgentLoginPage = () => {
    const { agentLogin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await agentLogin(form.email, form.password);
            if (data.user?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-login-wrap">
            {/* Animated background particles */}
            <div className="agent-particles">
                {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="agent-particle" style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${8 + Math.random() * 12}s`,
                        animationDelay: `${Math.random() * -15}s`,
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                        opacity: 0.3 + Math.random() * 0.5,
                    }} />
                ))}
            </div>

            <div className="agent-login-container">
                {/* Left side - Branding with GIF */}
                <div className="agent-login-hero">
                    <div className="agent-hero-overlay" />
                    <div className="agent-hero-content">
                        <div className="agent-gif-wrapper">
                            <img
                                src={`${process.env.PUBLIC_URL}/user.gif`}
                                alt="Agent"
                                className="agent-gif"
                            />
                        </div>
                        <h1 className="agent-hero-title">Agent Portal</h1>
                        <p className="agent-hero-sub">
                            Access your agent dashboard to create and manage travel quotations for your clients.
                        </p>
                        <div className="agent-hero-features">
                            <div className="agent-feature">
                                <i className="fas fa-bolt" />
                                <span>Instant Quotations</span>
                            </div>
                            <div className="agent-feature">
                                <i className="fas fa-users" />
                                <span>Client Management</span>
                            </div>
                            <div className="agent-feature">
                                <i className="fas fa-chart-line" />
                                <span>Performance Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="agent-login-form-panel">
                    <div className="agent-form-inner">
                        <div className="agent-form-header">
                            <div className="agent-icon-circle">
                                <i className="fas fa-user-tie" />
                            </div>
                            <h2 className="agent-form-title">Admin Login</h2>
                            <p className="agent-form-sub">Sign in with your admin credentials</p>
                        </div>

                        {error && (
                            <div className="agent-error">
                                <i className="fas fa-exclamation-triangle" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="agent-form">
                            <div className="agent-field">
                                <label className="agent-label">
                                    <i className="fas fa-envelope" />
                                    Email Address
                                </label>
                                <div className="agent-input-wrap">
                                    <input
                                        className="agent-input"
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        placeholder="john@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="agent-field">
                                <label className="agent-label">
                                    <i className="fas fa-lock" />
                                    Password
                                </label>
                                <div className="agent-input-wrap">
                                    <input
                                        className="agent-input"
                                        type={showPwd ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="agent-pwd-toggle"
                                        onClick={() => setShowPwd(p => !p)}
                                    >
                                        <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="agent-submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="agent-spinner" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt" />
                                        Sign In as Agent
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="agent-form-footer">
                            <Link to="/login" className="agent-back-link">
                                <i className="fas fa-arrow-left" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentLoginPage;
