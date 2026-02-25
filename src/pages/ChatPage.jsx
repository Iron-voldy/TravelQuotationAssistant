import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI, quotationAPI } from '../services/api';
import './ChatPage.css';

/* ─────────────────────────────────────────────
   Typing dots indicator
───────────────────────────────────────────── */
const TypingDots = () => (
    <div className="cp-msg cp-msg--ai">
        <div className="cp-avatar cp-avatar--ai"><i className="fas fa-robot" /></div>
        <div className="cp-bubble cp-bubble--ai cp-typing">
            <span /><span /><span />
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Quotation action card (approve / reject / save)
───────────────────────────────────────────── */
const QuotationCard = ({ quotationNo, chatMessageId, onAction }) => {
    // pending → accept/reject buttons
    // accepted → save button (saves to DB)
    // saved → done message
    // rejected → done message
    const [status, setStatus] = useState('pending'); // pending | accepted | saved | rejected | loading | saving
    const [confirm, setConfirm] = useState(null);    // 'accept' | 'reject'

    const doAction = async (action) => {
        setStatus('loading');
        try {
            if (action === 'accept') {
                // Just mark as accepted locally — not yet saved to DB
                setStatus('accepted');
                onAction && onAction('accept');
            } else {
                // Reject — no DB save needed, just update UI
                setStatus('rejected');
                onAction && onAction('reject');
            }
        } catch (e) {
            setStatus('pending');
            alert('Action failed: ' + e.message);
        }
    };

    const doSave = async () => {
        setStatus('saving');
        try {
            await quotationAPI.saveFromChat(chatMessageId);
            setStatus('saved');
            onAction && onAction('saved');
        } catch (e) {
            setStatus('accepted'); // revert to accepted so user can retry
            alert('Save failed: ' + e.message);
        }
    };

    return (
        <div className={`cp-quot-card cp-quot-card--${status === 'saving' ? 'loading' : status === 'saved' ? 'accepted' : status}`}>
            <div className="cp-quot-top">
                <div className="cp-quot-icon">
                    {(status === 'accepted' || status === 'saved') && <i className="fas fa-circle-check" />}
                    {status === 'rejected' && <i className="fas fa-circle-xmark" />}
                    {(status === 'pending' || status === 'loading' || status === 'saving') && <i className="fas fa-file-invoice-dollar" />}
                </div>
                <div className="cp-quot-info">
                    <span className="cp-quot-label">Quotation Generated</span>
                    <span className="cp-quot-no">#{quotationNo}</span>
                </div>
                <div className={`cp-quot-badge cp-quot-badge--${status === 'saving' ? 'loading' : status === 'saved' ? 'accepted' : status}`}>
                    {status === 'accepted' && 'Accepted'}
                    {status === 'saved' && 'Saved'}
                    {status === 'rejected' && 'Rejected'}
                    {status === 'pending' && 'Pending Review'}
                    {status === 'loading' && <><span className="cp-spin" /> Processing</>}
                    {status === 'saving' && <><span className="cp-spin" /> Saving…</>}
                </div>
            </div>

            {/* Pending — show Accept / Reject buttons */}
            {status === 'pending' && !confirm && (
                <div className="cp-quot-actions">
                    <p className="cp-quot-hint">
                        <i className="fas fa-circle-info" /> Review and confirm your travel quotation
                    </p>
                    <div className="cp-quot-btns">
                        <button className="cp-quot-btn cp-quot-btn--accept" onClick={() => setConfirm('accept')}>
                            <i className="fas fa-check" /> Accept Quotation
                        </button>
                        <button className="cp-quot-btn cp-quot-btn--reject" onClick={() => setConfirm('reject')}>
                            <i className="fas fa-xmark" /> Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm dialog */}
            {confirm && status === 'pending' && (
                <div className="cp-quot-confirm">
                    <p>Are you sure you want to <strong>{confirm}</strong> quotation <strong>#{quotationNo}</strong>?</p>
                    <div className="cp-quot-btns">
                        <button
                            className={`cp-quot-btn ${confirm === 'accept' ? 'cp-quot-btn--accept' : 'cp-quot-btn--reject'}`}
                            onClick={() => doAction(confirm)}
                        >
                            {confirm === 'accept' ? <><i className="fas fa-check" /> Yes, Accept</> : <><i className="fas fa-xmark" /> Yes, Reject</>}
                        </button>
                        <button className="cp-quot-btn cp-quot-btn--ghost" onClick={() => setConfirm(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Accepted — show Save button */}
            {status === 'accepted' && (
                <div className="cp-quot-actions">
                    <p className="cp-quot-hint">
                        <i className="fas fa-circle-check" style={{ color: '#34d399' }} /> Quotation accepted! Click Save to confirm and store it.
                    </p>
                    <div className="cp-quot-btns">
                        <button className="cp-quot-btn cp-quot-btn--save" onClick={doSave}>
                            <i className="fas fa-floppy-disk" /> Save Quotation
                        </button>
                    </div>
                </div>
            )}

            {/* Saved — final success */}
            {status === 'saved' && (
                <p className="cp-quot-done cp-quot-done--accept">
                    <i className="fas fa-circle-check" /> Quotation saved successfully! Our team will contact you shortly.
                </p>
            )}

            {/* Rejected */}
            {status === 'rejected' && (
                <p className="cp-quot-done cp-quot-done--reject">
                    <i className="fas fa-circle-xmark" /> Quotation rejected. Feel free to request a new one.
                </p>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Single message bubble
───────────────────────────────────────────── */
const ChatMsg = ({ msg }) => {
    const isUser = msg.role === 'user';
    const fmt = d => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`cp-msg cp-msg--${isUser ? 'user' : 'ai'}`}>
            {!isUser && <div className="cp-avatar cp-avatar--ai"><i className="fas fa-robot" /></div>}

            <div className="cp-msg-inner">
                {/* Quotation card with approve / reject / save */}
                {msg.is_success && msg.quotation_no && (
                    <QuotationCard
                        quotationNo={msg.quotation_no}
                        chatMessageId={msg.id}
                        onAction={() => { }}
                    />
                )}
                <div className={`cp-bubble cp-bubble--${isUser ? 'user' : 'ai'}`}>
                    {msg.content}
                </div>
                <span className="cp-time">{msg.created_at ? fmt(msg.created_at) : ''}</span>
            </div>

            {isUser && <div className="cp-avatar cp-avatar--user"><i className="fas fa-user" /></div>}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main ChatPage
───────────────────────────────────────────── */
const SUGGESTIONS = [
    { icon: 'fa-umbrella-beach', text: 'Sri Lanka beach tour for 2, 5 nights in Mirissa' },
    { icon: 'fa-mountain', text: 'Vietnam 7-day adventure Hanoi to Ho Chi Minh' },
    { icon: 'fa-city', text: 'Singapore family holiday for 4, 3 nights' },
    { icon: 'fa-train', text: 'Sri Lanka hill country rail trip 6 days Kandy to Ella' },
];

const ChatPage = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 767);
    const [almostThere, setAlmostThere] = useState(false);

    const endRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending, almostThere]);

    const loadSessions = useCallback(async () => {
        try {
            const d = await chatAPI.getSessions();
            setSessions(d.sessions || []);
        } catch { }
    }, []);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // Close sidebar on mobile when a session is selected
    const selectSession = async (s) => {
        setActiveSession(s);
        if (window.innerWidth <= 767) setSidebarOpen(false);
        setLoadingMsgs(true);
        setMessages([]);
        try {
            const d = await chatAPI.getMessages(s.id);
            setMessages(d.messages || []);
        } catch { }
        finally { setLoadingMsgs(false); }
    };

    const newChat = async () => {
        try {
            const d = await chatAPI.createSession('New Chat');
            setSessions(p => [d.session, ...p]);
            setActiveSession(d.session);
            setMessages([]);
        } catch { }
    };

    const deleteSession = async (e, id) => {
        e.stopPropagation();
        try {
            await chatAPI.deleteSession(id);
            setSessions(p => p.filter(s => s.id !== id));
            if (activeSession?.id === id) { setActiveSession(null); setMessages([]); }
        } catch { }
    };

    const handleSend = async (text) => {
        const msg = (text || input).trim();
        if (!msg || sending) return;
        setInput('');
        if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
        setSending(true);

        // Optimistically add user message to UI
        setMessages(p => [...p, { id: Date.now(), role: 'user', content: msg, created_at: new Date() }]);

        try {
            let sessionId = activeSession?.id || null;

            // If no active session, create one first
            if (!sessionId) {
                const sessionData = await chatAPI.createSession(msg.substring(0, 60) || 'New Chat');
                const newSession = sessionData.session;
                sessionId = newSession.id;
                setActiveSession(newSession);
                setSessions(p => [newSession, ...p]);
            }

            // Send message with confirmed session ID
            const d = await chatAPI.sendMessage(sessionId, msg);

            if (d.chatSessionId) {
                // Check if a quotation was created — add 10-second delay
                // so the API has time to finish configuration
                if (d.isSuccess && d.quotationNo) {
                    setAlmostThere(true);
                    // Wait 10 seconds for API configuration to complete
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    setAlmostThere(false);
                }

                // Reload messages from server for this session
                const msgsD = await chatAPI.getMessages(d.chatSessionId);
                setMessages(msgsD.messages || []);

                // Update session ID if it changed (shouldn't anymore, but safety)
                if (d.chatSessionId !== sessionId) {
                    setActiveSession({ id: d.chatSessionId });
                }
                // Refresh sessions list to get updated titles/timestamps
                loadSessions();
            }
        } catch (e) {
            setMessages(p => [...p, {
                id: Date.now() + 1, role: 'assistant',
                content: `⚠ Error: ${e.message}`, created_at: new Date()
            }]);
        } finally { setSending(false); }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

    const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sessionTitle = sessions.find(s => s.id === activeSession?.id)?.title || 'TravelAI';

    return (
        <div className="cp-root">
            {/* Mobile overlay when sidebar is open */}
            {sidebarOpen && (
                <div className="cp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ─────────────────────────── */}
            <aside className={`cp-sidebar ${sidebarOpen ? 'cp-sidebar--open' : 'cp-sidebar--closed'}`}>
                {/* Brand + mobile close btn */}
                <div className="cp-sb-brand">
                    <div className="cp-sb-logo"><i className="fas fa-plane-departure" /></div>
                    {sidebarOpen && <span className="cp-sb-brand-name">TravelAI</span>}
                    {sidebarOpen && (
                        <button className="cp-sb-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                            <i className="fas fa-xmark" />
                        </button>
                    )}
                </div>

                {/* New chat */}
                <button className="cp-sb-newchat" onClick={newChat} title="New chat">
                    <i className="fas fa-plus" />
                    {sidebarOpen && <span>New Chat</span>}
                </button>

                {/* Session list */}
                <div className="cp-sb-label">{sidebarOpen && 'Recent Chats'}</div>
                <div className="cp-sb-list">
                    {sessions.length === 0 && sidebarOpen && (
                        <div className="cp-sb-empty">
                            <i className="fas fa-comment-slash" />
                            <p>No chats yet</p>
                        </div>
                    )}
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            className={`cp-sb-item ${activeSession?.id === s.id ? 'active' : ''}`}
                            onClick={() => selectSession(s)}
                            title={s.title || 'New Chat'}
                        >
                            <i className="fas fa-message cp-sb-item-icon" />
                            {sidebarOpen && (
                                <>
                                    <div className="cp-sb-item-text">
                                        <div className="cp-sb-item-title">{s.title || 'New Chat'}</div>
                                        <div className="cp-sb-item-meta">{fmtDate(s.updated_at)} · {s.message_count || 0} msgs</div>
                                    </div>
                                    <button className="cp-sb-item-del" onClick={e => deleteSession(e, s.id)} title="Delete">
                                        <i className="fas fa-trash" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* User info + theme toggle + logout */}
                <div className="cp-sb-footer">
                    <div className="cp-sb-user">
                        <div className="cp-sb-user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                        {sidebarOpen && (
                            <div className="cp-sb-user-info">
                                <div className="cp-sb-user-name">{user?.name || 'User'}</div>
                                <div className="cp-sb-user-email">{user?.email || ''}</div>
                            </div>
                        )}
                    </div>
                    <button className="cp-sb-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                    </button>
                    <button className="cp-sb-logout" onClick={handleLogout} title="Sign out">
                        <i className="fas fa-sign-out-alt" />
                    </button>
                </div>
            </aside>

            {/* ── Main Area ───────────────────────── */}
            <div className="cp-main">
                {/* Topbar */}
                <div className="cp-topbar">
                    <button className="cp-topbar-toggle" onClick={() => setSidebarOpen(p => !p)} title="Toggle sidebar">
                        <i className={`fas fa-${sidebarOpen ? 'sidebar' : 'bars'}`} />
                    </button>
                    <div className="cp-topbar-title">
                        <i className="fas fa-robot" style={{ color: '#06b6d4', marginRight: 8 }} />
                        {activeSession ? sessionTitle : 'TravelAI — Quotation Assistant'}
                    </div>
                    {activeSession && (
                        <button className="cp-topbar-newchat" onClick={newChat}>
                            <i className="fas fa-plus" /> New Chat
                        </button>
                    )}
                </div>

                {/* Messages / Welcome */}
                <div className="cp-messages">
                    {!activeSession ? (
                        /* Welcome screen */
                        <div className="cp-welcome">
                            <div className="cp-welcome-rings">
                                <div className="cp-welcome-ring r1" />
                                <div className="cp-welcome-ring r2" />
                                <div className="cp-welcome-icon"><i className="fas fa-plane-departure" /></div>
                            </div>
                            <h2 className="cp-welcome-title">AI-Powered Travel Quotation</h2>
                            <p className="cp-welcome-sub">
                                Describe your dream destination, dates, group size and preferences —<br />
                                our AI will generate a personalized quotation in seconds.
                            </p>
                            <div className="cp-suggest-grid">
                                {SUGGESTIONS.map(s => (
                                    <button key={s.text} className="cp-suggest-tile" onClick={() => handleSend(s.text)}>
                                        <i className={`fas ${s.icon}`} />
                                        <span>{s.text}</span>
                                        <i className="fas fa-arrow-right cp-suggest-arrow" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {loadingMsgs && <div className="cp-loader"><div className="spinner" /></div>}
                            {!loadingMsgs && messages.length === 0 && (
                                <div className="cp-empty-hint">
                                    <i className="fas fa-paper-plane" />
                                    <p>Send a message to start your quotation</p>
                                </div>
                            )}
                            {messages.map(m => <ChatMsg key={m.id} msg={m} />)}
                            {sending && !almostThere && <TypingDots />}
                            {almostThere && (
                                <div className="cp-msg cp-msg--ai">
                                    <div className="cp-avatar cp-avatar--ai"><i className="fas fa-robot" /></div>
                                    <div className="cp-bubble cp-bubble--ai cp-almost-there">
                                        <div className="cp-almost-there-inner">
                                            <i className="fas fa-circle-notch fa-spin" />
                                            <span>✨ Almost there... Please wait while we prepare your quotation details.</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </>
                    )}
                </div>

                {/* Input bar */}
                <div className="cp-input-zone">
                    {sending && (
                        <div className="cp-processing">
                            <i className="fas fa-circle-notch fa-spin" />
                            {almostThere
                                ? '✨ Almost there... Please wait while we prepare your quotation details.'
                                : 'Processing your request — this may take 1–3 minutes…'
                            }
                        </div>
                    )}
                    <div className="cp-input-card">
                        <div className="cp-input-toolbar">
                            <button className="cp-toolbar-btn" onClick={newChat} title="New chat">
                                <i className="fas fa-plus" />
                            </button>
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="cp-textarea"
                            value={input}
                            onChange={e => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                            }}
                            onKeyDown={onKeyDown}
                            placeholder="Describe your travel plans… (Shift+Enter for new line)"
                            rows={1}
                            disabled={sending}
                        />
                        <div className="cp-input-foot">
                            <span className="cp-char-hint">
                                {input.length > 0 ? `${input.length} chars` : 'Enter to send · Shift+Enter for newline'}
                            </span>
                            <button
                                className={`cp-send-btn ${input.trim() && !sending ? 'active' : ''}`}
                                onClick={() => handleSend()}
                                disabled={sending || !input.trim()}
                            >
                                {sending
                                    ? <i className="fas fa-circle-notch fa-spin" />
                                    : <i className="fas fa-paper-plane" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
