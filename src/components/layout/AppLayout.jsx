import React from 'react';
import Sidebar from '../ui/Sidebar';
import '../../App.css';

const CloudOverlay = () => (
    <>
        <div className="cloud-layer">
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
            <div className="cloud cloud-3" />
            <div className="cloud cloud-4" />
        </div>
        <div style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: "url('/admin-bg.png')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.04,
        }} />
    </>
);

const AppLayout = ({ children }) => (
    <>
        <CloudOverlay />
        <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
            <Sidebar />
            <main className="page-content">
                {children}
            </main>
        </div>
    </>
);

export default AppLayout;
