import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/ui/Modal';
import Toast, { useToast } from '../components/ui/Toast';
import { quotationAPI } from '../services/api';
import './DashboardPage.css';
import './AgentDashboardPage.css';

const AgentDashboardPage = () => {
    const [quotations, setQuotations] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [confirm, setConfirm] = useState({ open: false, id: null, action: null });
    const { toasts, toast, removeToast } = useToast();
    const LIMIT = 10;

    console.log('[AGENT DASHBOARD] Rendering agent dashboard');

    const loadQuotations = useCallback(async () => {
        setLoading(true);
        try {
            console.log('[AGENT DASHBOARD] Loading quotations...');
            const params = { page, limit: LIMIT };
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;
            const data = await quotationAPI.list(params);
            setQuotations(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            const all = await quotationAPI.list({ limit: 1000 });
            const s = { total: 0, pending: 0, accepted: 0, rejected: 0 };
            (all.data || []).forEach(q => { s.total++; s[q.status] = (s[q.status] || 0) + 1; });
            setStats(s);
            console.log('[AGENT DASHBOARD] Loaded', (data.data || []).length, 'quotations. Stats:', s);
        } catch (e) {
            console.error('[AGENT DASHBOARD] Error loading quotations:', e.message);
            toast.error(e.message, 'Error');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadQuotations(); }, [loadQuotations]);

    const handleAction = async () => {
        const { id, action } = confirm;
        setConfirm({ open: false });
        try {
            if (action === 'accept') await quotationAPI.accept(id);
            else await quotationAPI.reject(id);
            toast.success(`Quotation ${action}ed successfully`, 'Done');
            loadQuotations();
        } catch (e) {
            toast.error(e.message, 'Error');
        }
    };

    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <AppLayout>
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className="page-header">
                <div className="agent-dashboard-header">
                    <h1 className="page-title">
                        <i className="fas fa-user-tie agent-title-icon" />
                        Agent Dashboard
                    </h1>
                    <span className="agent-badge-indicator">
                        <i className="fas fa-shield-halved" />
                        Agent Mode
                    </span>
                </div>
                <p className="page-subtitle">Manage travel quotations for your clients — emails are handled by you, not the system</p>
            </div>

            <div className="stats-grid">
                <StatsCard title="Total Quotations" value={stats.total} icon="fas fa-file-invoice" color="blue" delay={0} />
                <StatsCard title="Pending" value={stats.pending} icon="fas fa-clock" color="amber" delay={100} />
                <StatsCard title="Accepted" value={stats.accepted} icon="fas fa-circle-check" color="green" delay={200} />
                <StatsCard title="Rejected" value={stats.rejected} icon="fas fa-circle-xmark" color="red" delay={300} />
            </div>

            {/* Agent info banner */}
            <div className="agent-info-banner">
                <i className="fas fa-info-circle" />
                <span>
                    As an agent, quotation emails are <strong>not</strong> automatically sent to clients.
                    You manage client communications directly.
                </span>
            </div>

            <div className="glass-card">
                <div className="table-header">
                    <h2 className="table-title">
                        <i className="fas fa-file-invoice" style={{ marginRight: 8, opacity: 0.7 }} />
                        Agent Quotations
                    </h2>
                    <div className="filter-bar" style={{ margin: 0 }}>
                        <div className="search-box">
                            <span className="search-icon"><i className="fas fa-magnifying-glass" /></span>
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
                        <h3>No quotations yet</h3>
                        <p>Go to AI Chat to create your first travel quotation for a client</p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Quotation No</th>
                                        <th>Date</th>
                                        <th>Request Preview</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotations.map((q, i) => (
                                        <tr key={q.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * LIMIT + i + 1}</td>
                                            <td>
                                                <span className="quotation-no">#{q.quotation_no}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{fmt(q.created_at)}</td>
                                            <td>
                                                <span className="prompt-preview">{q.prompt_text}</span>
                                            </td>
                                            <td><StatusBadge status={q.status} /></td>
                                            <td>
                                                {q.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button className="btn btn-success btn-sm" onClick={() => setConfirm({ open: true, id: q.id, action: 'accept' })}><i className="fas fa-check" /> Accept</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: q.id, action: 'reject' })}><i className="fas fa-xmark" /> Reject</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
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

            <ConfirmModal
                isOpen={confirm.open}
                onClose={() => setConfirm({ open: false })}
                onConfirm={handleAction}
                title={`${confirm.action === 'accept' ? 'Accept' : 'Reject'} Quotation`}
                message={`Are you sure you want to ${confirm.action} this quotation? This action cannot be undone.`}
                confirmText={confirm.action === 'accept' ? '✓ Accept' : '✗ Reject'}
                danger={confirm.action === 'reject'}
            />
        </AppLayout>
    );
};

export default AgentDashboardPage;
