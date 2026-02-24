import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };
    const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <aside className="sidebar">
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
                        <i className={`fas ${isAdmin ? 'fa-crown' : 'fa-user'}`} />
                        {user?.role}
                    </div>
                </div>
                <div className="sidebar-online-dot" title="Online" />
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <div className="nav-section-label">Navigation</div>

                <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <span className="nav-icon"><i className="fas fa-house" /></span>
                    Dashboard
                </NavLink>

                <NavLink to="/chat" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <span className="nav-icon"><i className="fas fa-robot" /></span>
                    AI Chat
                    <span className="nav-badge">AI</span>
                </NavLink>

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
            <button className="sidebar-logout" onClick={handleLogout}>
                <i className="fas fa-right-from-bracket" />
                <span>Sign Out</span>
            </button>
        </aside>
    );
};

export default Sidebar;
