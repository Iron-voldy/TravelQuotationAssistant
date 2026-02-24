import React from 'react';

const colors = {
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
    accepted: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' },
    expired: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', dot: '#64748b' },
    admin: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', dot: '#8b5cf6' },
    user: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', dot: '#3b82f6' },
    active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' },
    inactive: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const style = colors[s] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', dot: '#94a3b8' };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            background: style.bg,
            color: style.color,
            textTransform: 'capitalize',
            letterSpacing: '0.3px',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
            {status}
        </span>
    );
};

export default StatusBadge;
