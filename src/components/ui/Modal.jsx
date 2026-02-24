import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-box modal-${size}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
    </Modal>
);

export default Modal;
