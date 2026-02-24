import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import Toast, { useToast } from '../components/ui/Toast';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentQuotations, setRecentQuotations] = useState([]);
    const { toasts, toast, removeToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [s, q] = await Promise.all([
                    adminAPI.getStats(),
                    adminAPI.getQuotations({ limit: 8 })
                ]);
                setStats(s.stats);
                setRecentQuotations(q.data || []);
            } catch (e) {
                toast.error(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div style={{ background: '#111827', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                    <p style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{payload[0].value} quotations</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout>
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">System overview and analytics</p>
            </div>

            {loading ? (
                <div className="empty-state"><div className="spinner" /></div>
            ) : (
                <>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                        <StatsCard title="Total Users" value={stats?.totalUsers} icon="fas fa-users" color="blue" delay={0} />
                        <StatsCard title="Total Quotations" value={stats?.totalQuotations} icon="fas fa-file-invoice" color="cyan" delay={100} />
                        <StatsCard title="Acceptance Rate" value={`${stats?.acceptanceRate || 0}%`} icon="fas fa-chart-line" color="green" delay={200} />
                        <StatsCard title="Active Users" value={stats?.activeUsers} icon="fas fa-circle-check" color="purple" delay={300} />
                    </div>

                    <div className="admin-grid">
                        {/* Chart */}
                        <div className="glass-card admin-chart-card">
                            <div className="table-header">
                                <h2 className="table-title">Quotations — Last 30 Days</h2>
                            </div>
                            <div style={{ height: 220, padding: '16px 16px 0' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.dailyTrend || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} interval="preserveStartEnd" />
                                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="count" stroke="var(--accent-cyan)" strokeWidth={2} dot={{ fill: 'var(--accent-cyan)', r: 3 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="glass-card">
                            <div className="table-header"><h2 className="table-title">Status Breakdown</h2></div>
                            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Pending', value: stats?.pending, color: 'var(--warning)', pct: stats?.totalQuotations ? Math.round((stats.pending / stats.totalQuotations) * 100) : 0 },
                                    { label: 'Accepted', value: stats?.accepted, color: 'var(--success)', pct: stats?.totalQuotations ? Math.round((stats.accepted / stats.totalQuotations) * 100) : 0 },
                                    { label: 'Rejected', value: stats?.rejected, color: 'var(--danger)', pct: stats?.totalQuotations ? Math.round((stats.rejected / stats.totalQuotations) * 100) : 0 },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                            <span style={{ color: item.color, fontWeight: 600 }}>{item.value || 0} ({item.pct}%)</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                            <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Quotations */}
                    <div className="glass-card" style={{ marginTop: 20 }}>
                        <div className="table-header">
                            <h2 className="table-title">Recent Quotations</h2>
                            <Link to="/admin/quotations" className="btn btn-ghost btn-sm">View All →</Link>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead><tr>
                                    <th>Quotation No</th><th>User</th><th>Date</th><th>Status</th>
                                </tr></thead>
                                <tbody>
                                    {recentQuotations.map(q => (
                                        <tr key={q.id}>
                                            <td><span className="quotation-no">#{q.quotation_no}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 500, fontSize: 13 }}>{q.user_name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.user_email}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(q.created_at)}</td>
                                            <td><StatusBadge status={q.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default AdminDashboard;
