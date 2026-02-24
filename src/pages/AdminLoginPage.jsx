import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.user?.role !== 'admin') {
                setError('Access denied. This portal is for administrators only.');
                return;
            }
            navigate('/admin', { replace: true });
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="admin-login-wrap">
            {/* Animated background */}
            <div className="admin-bg" />
            <div className="admin-bg-grid" />

            {/* Floating orbs */}
            <div className="admin-orb admin-orb-1" />
            <div className="admin-orb admin-orb-2" />
            <div className="admin-orb admin-orb-3" />

            {/* Animated rings */}
            <div className="admin-ring admin-ring-1" />
            <div className="admin-ring admin-ring-2" />

            <div className="admin-login-container">
                {/* Top logo */}
                <div className="admin-logo-area">
                    <div className="admin-logo-icon">
                        <i className="fas fa-shield-halved" />
                    </div>
                    <div className="admin-logo-badge">ADMIN PORTAL</div>
                </div>

                <div className="admin-login-card">
                    <div className="admin-card-header">
                        <h1 className="admin-card-title">
                            <i className="fas fa-lock" style={{ fontSize: 18, marginRight: 10 }} />
                            Secure Admin Access
                        </h1>
                        <p className="admin-card-sub">Restricted to authorized personnel only</p>
                    </div>

                    {error && (
                        <div className="admin-error">
                            <i className="fas fa-triangle-exclamation" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-user-shield" style={{ marginRight: 6, color: 'var(--accent-purple)' }} /> Admin Email
                            </label>
                            <div className="admin-input-wrap">
                                <i className="fas fa-at admin-input-icon" />
                                <input
                                    className="form-input admin-input"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                    required autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-key" style={{ marginRight: 6, color: 'var(--accent-purple)' }} /> Password
                            </label>
                            <div className="admin-input-wrap">
                                <i className="fas fa-lock admin-input-icon" />
                                <input
                                    className="form-input admin-input"
                                    type={showPwd ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    required style={{ paddingLeft: 44, paddingRight: 46 }}
                                />
                                <button type="button" className="admin-eye-btn" onClick={() => setShowPwd(p => !p)}>
                                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="admin-submit-btn" disabled={loading}>
                            {loading
                                ? <><span className="btn-spinner" /> Authenticating...</>
                                : <><i className="fas fa-right-to-bracket" /> Access Dashboard</>
                            }
                        </button>
                    </form>

                    <div className="admin-back-link">
                        <Link to="/login">
                            <i className="fas fa-arrow-left" style={{ marginRight: 6 }} /> Back to User Login
                        </Link>
                    </div>
                </div>

                <div className="admin-security-notice">
                    <i className="fas fa-circle-info" />
                    All admin actions are logged and monitored
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
