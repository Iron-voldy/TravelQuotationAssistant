import React, { useEffect } from 'react';

const Toast = ({ toasts, removeToast }) => {
    return (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
            ))}
        </div>
    );
};

const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
};

const ToastItem = ({ toast, onRemove }) => {
    const c = colors[toast.type] || colors.info;
    useEffect(() => {
        const t = setTimeout(onRemove, 4000);
        return () => clearTimeout(t);
    }, [onRemove]);

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: 280, maxWidth: 360,
            animation: 'slideInRight 0.3s ease',
        }}>
            <span style={{ fontSize: 18 }}>{icons[toast.type] || icons.info}</span>
            <div style={{ flex: 1 }}>
                {toast.title && <div style={{ fontWeight: 600, fontSize: 13, color: c.text, marginBottom: 2 }}>{toast.title}</div>}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
        </div>
    );
};

// Hook
export const useToast = () => {
    const [toasts, setToasts] = React.useState([]);
    const add = (message, type = 'info', title) => {
        setToasts(p => [...p, { id: Date.now(), message, type, title }]);
    };
    const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
    return { toasts, toast: { success: (m, t) => add(m, 'success', t), error: (m, t) => add(m, 'error', t), info: (m, t) => add(m, 'info', t), warning: (m, t) => add(m, 'warning', t) }, removeToast: remove };
};

export default Toast;
