import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/ui/StatusBadge';
import Toast, { useToast } from '../components/ui/Toast';
import { adminAPI } from '../services/api';
import './DashboardPage.css';

const AdminQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expanded, setExpanded] = useState(null);
    const { toasts, toast, removeToast } = useToast();
    const LIMIT = 15;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const data = await adminAPI.getQuotations(params);
            setQuotations(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            toast.error(e.message, 'Error');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <AppLayout>
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className="page-header">
                <h1 className="page-title">All Quotations</h1>
                <p className="page-subtitle">View all travel quotations across all users</p>
            </div>

            <div className="glass-card">
                <div className="table-header">
                    <h2 className="table-title">Quotations <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span></h2>
                    <div className="filter-bar" style={{ margin: 0 }}>
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input placeholder="Search quotation no..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="select-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" /></div>
                ) : quotations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No quotations found</h3>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead><tr>
                                    <th>#</th>
                                    <th>Quotation No</th>
                                    <th>User</th>
                                    <th>Date</th>
                                    <th>Request</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr></thead>
                                <tbody>
                                    {quotations.map((q, i) => (
                                        <React.Fragment key={q.id}>
                                            <tr>
                                                <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * LIMIT + i + 1}</td>
                                                <td><span className="quotation-no">#{q.quotation_no}</span></td>
                                                <td>
                                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{q.user_name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.user_email}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(q.created_at)}</td>
                                                <td><span className="prompt-preview">{q.prompt_text}</span></td>
                                                <td><StatusBadge status={q.status} /></td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                                                    >
                                                        {expanded === q.id ? '▲ Hide' : '▼ View'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expanded === q.id && (
                                                <tr>
                                                    <td colSpan={7} style={{ padding: 0 }}>
                                                        <div style={{
                                                            padding: '16px 24px',
                                                            background: 'rgba(255,255,255,0.02)',
                                                            borderBottom: '1px solid var(--border)'
                                                        }}>
                                                            <div style={{ marginBottom: 12 }}>
                                                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Full Request</div>
                                                                <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8 }}>
                                                                    {q.prompt_text}
                                                                </div>
                                                            </div>
                                                            {q.response_data && (
                                                                <div>
                                                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Response Data</div>
                                                                    <pre style={{ color: 'var(--accent-cyan)', fontSize: 12, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8, overflow: 'auto' }}>
                                                                        {JSON.stringify(q.response_data, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination">
                            <span className="pagination-info">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
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

export default AdminQuotations;
