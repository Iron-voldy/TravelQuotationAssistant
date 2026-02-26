import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const CloudLayer = () => (
    <div className="sidebar-cloud-layer">
        <div className="sb-cloud sb-cloud-1" />
        <div className="sb-cloud sb-cloud-2" />
        <div className="sb-cloud sb-cloud-3" />
    </div>
);

const Sidebar = () => {
    const { user, isAdmin, isAgent, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    console.log('[SIDEBAR] Rendering. isAgent:', isAgent, '| isAdmin:', isAdmin, '| user:', user?.email);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close sidebar on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => { 
        const wasAgent = isAgent;
        logout(); 
        navigate(wasAgent ? '/agent-login' : '/login'); 
    };
    const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label="Toggle sidebar"
            >
                <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay active" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
                <CloudLayer />

                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        <i className="fas fa-plane-departure" />
                    </div>
                    <div>
                        <div className="sidebar-title">TravelAI</div>
                        <div className="sidebar-sub">Quotation System</div>
                    </div>
                </div>

                {/* User chip */}
                <div className="sidebar-user-chip">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">
                            <i className={`fas ${isAdmin ? 'fa-crown' : isAgent ? 'fa-user-tie' : 'fa-user'}`} />
                            {isAgent ? 'Agent' : user?.role}
                        </div>
                    </div>
                    <div className="sidebar-online-dot" title="Online" />
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    <div className="nav-section-label">Navigation</div>

                    {isAgent ? (
                        <>
                            {/* Agent-specific navigation */}
                            <NavLink to="/agent-dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-house" /></span>
                                Agent Dashboard
                            </NavLink>

                            <NavLink to="/agent-chat" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-robot" /></span>
                                AI Chat
                                <span className="nav-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Agent</span>
                            </NavLink>
                        </>
                    ) : (
                        <>
                            {/* Regular user navigation */}
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-house" /></span>
                                Dashboard
                            </NavLink>

                            <NavLink to="/chat" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-robot" /></span>
                                AI Chat
                                <span className="nav-badge">AI</span>
                            </NavLink>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <div className="nav-divider" />
                            <div className="nav-section-label">Admin Panel</div>

                            <NavLink to="/admin" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-chart-line" /></span>
                                Dashboard
                            </NavLink>

                            <NavLink to="/admin/users" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-users" /></span>
                                Manage Users
                            </NavLink>

                            <NavLink to="/admin/quotations" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                                <span className="nav-icon"><i className="fas fa-file-invoice" /></span>
                                All Quotations
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div className="sidebar-bottom-actions">
                    <button className="sidebar-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <i className="fas fa-right-from-bracket" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
