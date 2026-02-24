import React, { useEffect, useState } from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color = 'blue', subtitle, delay = 0 }) => {
    const [count, setCount] = useState(0);
    const numericValue = parseInt(String(value).replace(/\D/g, '')) || 0;
    const isPercent = String(value).includes('%');

    useEffect(() => {
        if (!numericValue) return;
        const duration = 1200;
        const start = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(numericValue * eased));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [numericValue]);

    const displayValue = numericValue ? `${count}${isPercent ? '%' : ''}` : (value ?? '—');

    return (
        <div
            className={`stats-card stats-card--${color}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="stats-card-glow" />
            <div className="stats-card-icon">
                <i className={icon} />
            </div>
            <div className="stats-card-body">
                <div className="stats-card-value">{displayValue}</div>
                <div className="stats-card-title">{title}</div>
                {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
            </div>
            <div className="stats-card-sparkle" />
        </div>
    );
};

export default StatsCard;
