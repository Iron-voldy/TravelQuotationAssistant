import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Toast, { useToast } from '../components/ui/Toast';
import { adminAPI } from '../services/api';
import './DashboardPage.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const { toasts, toast, removeToast } = useToast();
    const LIMIT = 15;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT };
            if (search) params.search = search;
            const data = await adminAPI.getUsers(params);
            setUsers(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            toast.error(e.message, 'Error');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { load(); }, [load]);

    const toggleUser = async (id) => {
        try {
            await adminAPI.toggleUser(id);
            toast.success('User status updated', 'Done');
            load();
        } catch (e) {
            toast.error(e.message, 'Error');
        }
    };

    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <AppLayout>
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className="page-header">
                <h1 className="page-title">Manage Users</h1>
                <p className="page-subtitle">View and manage all registered users</p>
            </div>

            <div className="glass-card">
                <div className="table-header">
                    <h2 className="table-title">All Users <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span></h2>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" /></div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No users found</h3>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Quotations</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * LIMIT + i + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg,var(--accent-purple),var(--accent-blue))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: 13, flexShrink: 0
                                                    }}>{u.name?.charAt(0).toUpperCase()}</div>
                                                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                                            <td><StatusBadge status={u.role} /></td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 700, color: 'var(--accent-cyan)',
                                                    background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 13
                                                }}>{u.quotation_count}</span>
                                            </td>
                                            <td><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(u.created_at)}</td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                                                    onClick={() => toggleUser(u.id)}
                                                >
                                                    {u.is_active ? '🔒 Deactivate' : '🔓 Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination">
                            <span className="pagination-info">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} users</span>
                            <div className="pagination-btns">
                                <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                                    <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                ))}
                                <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default AdminUsers;
