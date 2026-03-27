import React from 'react';
import './StatusBadge.css';

const KNOWN_VARIANTS = ['pending', 'accepted', 'rejected', 'expired', 'admin', 'user', 'active', 'inactive'];

const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const variant = KNOWN_VARIANTS.includes(s) ? s : 'default';

    return (
        <span className={`status-badge status-badge--${variant}`}>
            <span className="status-badge__dot" />
            {status}
        </span>
    );
};

export default StatusBadge;
