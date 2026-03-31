import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI, quotationAPI } from '../services/api';
import { getOptimizedPrompts } from '../services/promptOptimizer';
import { ConfirmModal } from '../components/ui/Modal';
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
const QuotationCard = ({ quotationNo, chatMessageId, initialStatus, onStatusChange }) => {
    // Derive the starting UI status from the persisted DB value.
    // 'saved' is our UI-only state for an already-accepted+saved quotation.
    const resolveInitial = (s) => {
        if (s === 'accepted') return 'saved';   // already fully saved in DB
        if (s === 'rejected') return 'rejected';
        return 'pending';
    };

    const [status, setStatus] = useState(() => resolveInitial(initialStatus));
    const [confirm, setConfirm] = useState(null); // 'accept' | 'reject'
    const [copied, setCopied] = useState(false);

    const copyQuotationNo = () => {
        navigator.clipboard.writeText(quotationNo).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const setAndNotify = (s) => {
        setStatus(s);
        onStatusChange && onStatusChange(s);
    };

    const doAction = async (action) => {
        setStatus('loading');
        try {
            if (action === 'accept') {
                // Mark accepted locally — user still needs to click Save
                setStatus('accepted');
            } else {
                // Reject — persist to DB (no email)
                await quotationAPI.rejectFromChat(chatMessageId);
                setAndNotify('rejected');
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
            setAndNotify('saved');
        } catch (e) {
            setStatus('accepted'); // revert so user can retry
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
                    {status === 'saved' && (
                        <>
                            Saved
                            <button
                                className={`cp-quot-copy-btn${copied ? ' cp-quot-copy-btn--done' : ''}`}
                                onClick={copyQuotationNo}
                                title={copied ? 'Copied!' : 'Copy quotation number'}
                            >
                                <i className={copied ? 'fas fa-check' : 'fas fa-copy'} />
                            </button>
                        </>
                    )}
                    {status === 'rejected' && 'Rejected'}
                    {status === 'pending' && 'Pending'}
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
   Format Guide Error Card
───────────────────────────────────────────── */
const FormatGuideCard = ({ recommendations, onSelect }) => (
    <div className="cp-format-guide">
        <div className="cp-format-guide-title">
            <i className="fas fa-triangle-exclamation" />
            Couldn't Create Your Quotation
        </div>
        <div className="cp-format-guide-body">
            <p>Please <strong>simplify your request</strong> and include:</p>
            <ul>
                <li><i className="fas fa-location-dot" /><span><strong>Country name</strong> — e.g., Singapore, Malaysia, Sri Lanka, Vietnam</span></li>
                <li><i className="fas fa-moon" /><span><strong>Duration</strong> — e.g., 3 nights / 5 days</span></li>
                <li><i className="fas fa-users" /><span><strong>Travellers</strong> — e.g., 3 pax / 2 adults and 1 child</span></li>
                <li><i className="fas fa-calendar" /><span><strong>Travel date</strong> — optional but recommended</span></li>
            </ul>

            {/* AI-generated recommendations based on user's original prompt */}
            {(() => {
                // undefined = map key not set yet (treat as loading), null = loading, [] = fallback, [...] = AI recs
                if (recommendations === undefined || recommendations === null) return (
                    <p className="cp-format-guide-eg-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 12, color: '#06b6d4' }} />
                        Analyzing your request…
                    </p>
                );
                const examples = Array.isArray(recommendations) && recommendations.length > 0
                    ? recommendations
                    : ['Create Singapore trip/package for 3 nights for 3 pax',
                       'Create Sri Lanka trip/package for 5 days for 2 adults and 2 children, travel starts March 12th',
                       'Create Malaysia trip/package for 2 adults and 1 child traveling on 5th April 2026 with a 4-star hotel'];
                const label = Array.isArray(recommendations) && recommendations.length > 0
                    ? '✨ Try these optimized prompts (click to use):'
                    : 'Try one of these formats:';
                return (
                    <>
                        <p className="cp-format-guide-eg-title">{label}</p>
                        <div className="cp-format-guide-examples">
                            {examples.map((ex, i) => (
                                <button
                                    key={i}
                                    className="cp-format-eg cp-format-eg--btn"
                                    onClick={() => onSelect && onSelect(ex)}
                                    title="Click to use this prompt"
                                >
                                    <i className="fas fa-paper-plane" style={{ marginRight: 6, fontSize: 11 }} />
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </>
                );
            })()}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Single message bubble
───────────────────────────────────────────── */
const ChatMsg = ({ msg, recommendations, onSelectPrompt, onStatusChange }) => {
    const isUser = msg.role === 'user';
    const fmt = d => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Special rendering: format guide error card
    if (msg.is_format_error) {
        return (
            <div className="cp-msg cp-msg--ai">
                <div className="cp-avatar cp-avatar--ai"><i className="fas fa-robot" /></div>
                <div className="cp-msg-inner">
                    <FormatGuideCard
                        recommendations={recommendations}
                        onSelect={onSelectPrompt}
                    />
                    <span className="cp-time">{msg.created_at ? fmt(msg.created_at) : ''}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`cp-msg cp-msg--${isUser ? 'user' : 'ai'}`}>
            {!isUser && <div className="cp-avatar cp-avatar--ai"><i className="fas fa-robot" /></div>}

            <div className="cp-msg-inner">
                {/* Quotation card with approve / reject / save */}
                {!!(msg.is_success && msg.quotation_no) && (
                    <QuotationCard
                        quotationNo={msg.quotation_no}
                        chatMessageId={msg.id}
                        initialStatus={msg.quotation_status || 'pending'}
                        onStatusChange={onStatusChange}
                    />
                )}
                {/* Hide the assistant bubble text when a quotation card is shown — it's redundant */}
                {!(msg.is_success && msg.quotation_no) && (
                    <div className={`cp-bubble cp-bubble--${isUser ? 'user' : 'ai'}`}>
                        {msg.content}
                    </div>
                )}
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
    { icon: 'fa-map-location-dot', text: 'Create Singapore trip/package for 3 nights for 3 pax' },
    { icon: 'fa-umbrella-beach', text: 'Create Sri Lanka trip/package for 5 days for 2 adults and 2 children, travel starts March 12th' },
    { icon: 'fa-mountain', text: 'Create Malaysia trip/package for 2 adults and 1 child traveling on 5th April 2026 with a 4-star hotel' },
    { icon: 'fa-users', text: 'Create Vietnam trip/package for 7 days for 4 pax from 1st May 2026' },
];

const getSpeechRecognition = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const buildVoiceErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'not-allowed':
        case 'service-not-allowed':
            return 'Microphone access was blocked. Please allow microphone permission and try again.';
        case 'audio-capture':
            return 'No microphone was found. Please connect a microphone and try again.';
        case 'network':
            return 'Speech recognition needs a stable connection right now. Please try again.';
        case 'no-speech':
            return 'We could not hear any speech. Please try again.';
        default:
            return 'Voice search is not available right now. Please try again.';
    }
};

const validateTravelPrompt = (rawText) => {
    const msg = (rawText || '').trim();
    if (!msg) return { isValid: false, reason: 'empty' };

    const compact = msg.replace(/\s+/g, ' ');
    const words = compact.split(' ').filter(Boolean);
    const letters = (compact.match(/[a-z]/gi) || []).length;
    const nonSpaceChars = compact.replace(/\s/g, '').length;
    const letterRatio = nonSpaceChars ? letters / nonSpaceChars : 0;

    // Hard reject for obvious keyboard smash / meaningless patterns.
    if (compact.length < 8) return { isValid: false, reason: 'too_short' };
    if (/^(.)\1+$/i.test(compact.replace(/\s/g, ''))) return { isValid: false, reason: 'repeated_chars' };
    if (/\b[bcdfghjklmnpqrstvwxyz]{7,}\b/i.test(compact)) return { isValid: false, reason: 'consonant_smash' };
    if (/\d{4,}[a-z]{4,}|[a-z]{4,}\d{4,}/i.test(compact) && words.length <= 2) {
        return { isValid: false, reason: 'alnum_smash' };
    }
    if (letterRatio < 0.35) return { isValid: false, reason: 'low_letters' };

    const hasTravelKeyword = /\b(trip|travel|package|tour|holiday|vacation|itinerary|quotation|quote|hotel|flight|visa|sightseeing|destination)\b/i.test(compact);
    const hasDuration = /\b\d+\s*(day|days|night|nights|week|weeks)\b/i.test(compact);
    const hasTravellers = /\b\d+\s*(pax|people|persons?|travellers?|adults?|children|kids|child)\b/i.test(compact)
        || /\b(adults?|children|kids|child)\b/i.test(compact);
    const hasDate = /\b(\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)|from\s+\d{4}|travel\s+starts)\b/i.test(compact);
    const hasDestinationCue = /\b(to|for|in)\s+[a-z]{3,}\b/i.test(compact);

    const travelSignals = [hasTravelKeyword, hasDuration, hasTravellers, hasDate, hasDestinationCue].filter(Boolean).length;

    // Require meaningful travel intent so random text doesn't trigger quotation flow.
    if (travelSignals >= 2) return { isValid: true, reason: null };
    if (hasTravelKeyword && words.length >= 4) return { isValid: true, reason: null };
    return { isValid: false, reason: 'missing_travel_details' };
};

const ChatPage = () => {
    const { user, loginPath, logout, theme, toggleTheme, refreshAuthToken, token } = useAuth();
    const navigate = useNavigate();
    const currentLocation = useLocation();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 767);
    const [almostThere, setAlmostThere] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // session id pending delete
    // Map of guideId -> recommendations array (null=loading, []=fallback, [...]=AI recs)
    const [aiRecsMap, setAiRecsMap] = useState({});
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);
    const [voiceListening, setVoiceListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceInterim, setVoiceInterim] = useState('');
    const [voiceError, setVoiceError] = useState('');

    const endRef = useRef(null);
    const textareaRef = useRef(null);
    // Tracks which session the current in-flight send belongs to
    const sendingSessionRef = useRef(null);
    const recognitionRef = useRef(null);
    const voiceTranscriptRef = useRef('');
    const voiceInterimRef = useRef('');
    const closingVoiceModalRef = useRef(false);
    const voiceModalOpenRef = useRef(false);
    const startVoiceRecognitionRef = useRef(null);
    const tokenRefreshIntervalRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending, almostThere]);

    // Set up auto-refresh of authentication token every 30 minutes to prevent expiry during long chat sessions
    useEffect(() => {
        if (!token) return;
        
        console.log('[CHATPAGE] 🔐 Setting up periodic token refresh (every 30 minutes)');
        
        const refreshTokenPeriodically = async () => {
            try {
                console.log('[CHATPAGE] 🔄 Periodically refreshing token...');
                await refreshAuthToken(token);
                console.log('[CHATPAGE] ✅ Token refreshed successfully');
            } catch (e) {
                console.warn('[CHATPAGE] ⚠️ Periodic token refresh failed:', e.message);
                // Don't logout on periodic refresh failures, let the scheduled refresh in AuthContext handle it
            }
        };

        // Set up interval to refresh token every 30 minutes
        tokenRefreshIntervalRef.current = setInterval(refreshTokenPeriodically, 30 * 60 * 1000);
        
        return () => {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
            }
        };
    }, [token, refreshAuthToken]);

    useEffect(() => {
        if (!voiceModalOpen) return undefined;
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [voiceModalOpen]);

    // Keep ref in sync so recognition callbacks can read latest value without stale closure
    useEffect(() => { voiceModalOpenRef.current = voiceModalOpen; }, [voiceModalOpen]);

    // Keep ref pointing to latest startVoiceRecognition for auto-restart inside onend
    useEffect(() => { startVoiceRecognitionRef.current = startVoiceRecognition; });

    const loadSessions = useCallback(async () => {
        try {
            const d = await chatAPI.getSessions();
            setSessions(d.sessions || []);
        } catch { }
    }, []);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // Auto-select session from URL param ?session=<id>
    // (navigated here from dashboard View button)
    useEffect(() => {
        if (!sessions.length) return;
        const params = new URLSearchParams(currentLocation.search);
        const sessionId = params.get('session');
        if (!sessionId) return;
        // If this session is already active, don't reload
        if (activeSession && String(activeSession.id) === sessionId) return;
        const target = sessions.find(s => String(s.id) === sessionId);
        if (target) {
            selectSession(target);
            // Remove ?session from URL without adding to browser history
            navigate('/chat', { replace: true });
        }
    }, [sessions, currentLocation.search]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const newChat = () => {
        setActiveSession(null);
        setMessages([]);
        setSending(false);
        setAlmostThere(false);
        // On mobile close sidebar so the user sees the new-chat input area
        if (window.innerWidth <= 767) setSidebarOpen(false);
    };

    const deleteSession = async (e, id) => {
        e.stopPropagation();
        setDeleteConfirm(id);
    };

    const confirmDeleteSession = async () => {
        const id = deleteConfirm;
        setDeleteConfirm(null);
        try {
            await chatAPI.deleteSession(id);
            setSessions(p => p.filter(s => s.id !== id));
            if (activeSession?.id === id) { setActiveSession(null); setMessages([]); }
        } catch { }
    };

    const resizeTextarea = useCallback(() => {
        requestAnimationFrame(() => {
            if (!textareaRef.current) return;
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
        });
    }, []);

    const getCombinedVoiceTranscript = useCallback(() => (
        `${voiceTranscriptRef.current} ${voiceInterimRef.current}`.replace(/\s+/g, ' ').trim()
    ), []);

    const stopRecognition = useCallback((mode = 'abort') => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognitionRef.current = null;

        try {
            if (mode === 'stop') recognition.stop();
            else recognition.abort();
        } catch { }
    }, []);

    const applyVoiceTranscript = useCallback((spokenText) => {
        const cleanText = spokenText.trim();
        if (!cleanText) return;

        setInput(prev => {
            if (!prev.trim()) return cleanText;
            return /\s$/.test(prev) ? `${prev}${cleanText}` : `${prev} ${cleanText}`;
        });

        setTimeout(() => {
            if (textareaRef.current) textareaRef.current.focus();
            resizeTextarea();
        }, 0);
    }, [resizeTextarea]);

    const closeVoiceModal = useCallback(({ shouldApply = false, stopMode = 'abort' } = {}) => {
        const transcript = getCombinedVoiceTranscript();
        closingVoiceModalRef.current = true;
        stopRecognition(stopMode);
        setVoiceModalOpen(false);
        setVoiceListening(false);
        setVoiceTranscript('');
        setVoiceInterim('');
        setVoiceError('');
        voiceTranscriptRef.current = '';
        voiceInterimRef.current = '';

        if (shouldApply && transcript) {
            applyVoiceTranscript(transcript);
        }
    }, [applyVoiceTranscript, getCombinedVoiceTranscript, stopRecognition]);

    // isRestart = true skips resetting the accumulated transcript so it is preserved
    const startVoiceRecognition = useCallback((isRestart = false) => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            setVoiceListening(false);
            setVoiceError('Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
            return;
        }

        closingVoiceModalRef.current = false;
        stopRecognition('abort');

        // Only wipe the transcript on a fresh open, not on auto-restart after silence
        if (!isRestart) {
            voiceTranscriptRef.current = '';
            voiceInterimRef.current = '';
            setVoiceTranscript('');
        }
        voiceInterimRef.current = '';
        setVoiceInterim('');
        setVoiceError('');

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setVoiceListening(true);
            setVoiceError('');
        };

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const t = event.results[i][0]?.transcript || '';
                if (event.results[i].isFinal) finalText += t;
                else interimText += t;
            }
            if (finalText) {
                const next = `${voiceTranscriptRef.current} ${finalText}`.replace(/\s+/g, ' ').trim();
                voiceTranscriptRef.current = next;
                setVoiceTranscript(next);
            }
            voiceInterimRef.current = interimText.trim();
            setVoiceInterim(interimText.trim());
        };

        recognition.onerror = (event) => {
            // 'no-speech' is not a real error — browser just timed out waiting.
            // onend will fire next and we auto-restart there.
            if (event.error === 'no-speech') return;
            setVoiceListening(false);
            setVoiceError(buildVoiceErrorMessage(event.error));
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            if (closingVoiceModalRef.current) {
                closingVoiceModalRef.current = false;
                return;
            }
            setVoiceListening(false);
            const transcript = getCombinedVoiceTranscript();
            if (transcript) {
                // User spoke something — apply it
                closeVoiceModal({ shouldApply: true, stopMode: 'abort' });
            } else if (voiceModalOpenRef.current) {
                // Modal still open but nothing captured yet — auto-restart silently
                // Use the ref so we always call the latest version without stale closure
                setTimeout(() => {
                    if (voiceModalOpenRef.current && !closingVoiceModalRef.current) {
                        startVoiceRecognitionRef.current?.(true);
                    }
                }, 350);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch {
            setVoiceListening(false);
            setVoiceError('Could not access the microphone. Please check permissions and try again.');
        }
    }, [closeVoiceModal, getCombinedVoiceTranscript, stopRecognition]);

    useEffect(() => {
        if (!voiceModalOpen) return undefined;
        startVoiceRecognition();

        return () => {
            closingVoiceModalRef.current = true;
            stopRecognition('abort');
            setVoiceListening(false);
        };
    }, [voiceModalOpen, startVoiceRecognition, stopRecognition]);

    const handleSend = async (text) => {
        const msg = (text || input).trim();
        if (!msg || sending) return;

        // ── Strong client-side prompt validation ────────────────
        // Prevent keyboard smash / random text from reaching quotation APIs.
        const validation = validateTravelPrompt(msg);
        if (!validation.isValid) {
            setMessages(p => [...p,
                { id: `err_${Date.now()}`, role: 'user', content: msg, created_at: new Date() },
                {
                    id: `valerr_${Date.now()}`,
                    role: 'assistant',
                    content: 'Please enter a valid travel request with destination, duration, and travellers. Example: "Create Singapore trip/package for 3 nights for 3 pax".',
                    created_at: new Date()
                }
            ]);
            setInput('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            return;
        }
        // ────────────────────────────────────────────────────────

        setInput('');
        if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
        setSending(true);

        // Proactively refresh token before sending message to prevent "Token expired" errors
        try {
            console.log('[CHATPAGE] 🔄 Proactively refreshing token before sending message...');
            await refreshAuthToken(token);
            console.log('[CHATPAGE] ✅ Token refreshed before send');
        } catch (e) {
            console.warn('[CHATPAGE] ⚠️ Pre-send token refresh failed (will attempt with current token):', e.message);
        }

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

            // Record which session this send belongs to so we can
            // restore it correctly after the async response lands
            sendingSessionRef.current = sessionId;

            // Send message with confirmed session ID
            const d = await chatAPI.sendMessage(sessionId, msg);

            if (d.chatSessionId) {
                // Check if a quotation was created — add 12-second delay
                if (d.isSuccess && d.quotationNo) {
                    setAlmostThere(true);
                    await new Promise(resolve => setTimeout(resolve, 12000));
                    setAlmostThere(false);
                }

                // Always navigate back to the session that originated this send.
                // The user may have clicked "New Chat" mid-flight, so we must
                // restore the correct session and its messages.
                const respondingSessionId = d.chatSessionId;
                const msgsD = await chatAPI.getMessages(respondingSessionId);

                // Restore active session so sidebar highlights the right item
                setSessions(prev => {
                    const found = prev.find(s => s.id === respondingSessionId);
                    if (found) setActiveSession(found);
                    else setActiveSession({ id: respondingSessionId });
                    return prev;
                });
                setMessages(msgsD.messages || []);

                // If no quotation number was returned, show the format guide card
                if (!d.quotationNo || !d.isSuccess) {
                    const guideId = `guide_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                    setAiRecsMap(prev => ({ ...prev, [guideId]: null }));
                    setMessages(prev => [...prev, {
                        id: guideId,
                        role: 'assistant',
                        is_format_error: true,
                        content: '',
                        created_at: new Date()
                    }]);
                    getOptimizedPrompts(msg).then(recs => {
                        setAiRecsMap(prev => ({ ...prev, [guideId]: recs !== null ? recs : [] }));
                    });
                }

                // Refresh sessions list to get updated titles/timestamps
                loadSessions();
                sendingSessionRef.current = null;
            }
        } catch (e) {
            const guideId = `guide_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            setAiRecsMap(prev => ({ ...prev, [guideId]: null }));
            setMessages(p => [...p,
                {
                    id: `err_${Date.now()}`,
                    role: 'assistant',
                    content: `Sorry, there was an error processing your request. Please try again.`,
                    created_at: new Date()
                },
                {
                    id: guideId,
                    role: 'assistant',
                    is_format_error: true,
                    content: '',
                    created_at: new Date()
                }
            ]);
            getOptimizedPrompts(msg).then(recs => {
                setAiRecsMap(prev => ({ ...prev, [guideId]: recs !== null ? recs : [] }));
            });
        } finally { setSending(false); }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleLogout = () => { logout(); navigate(loginPath, { replace: true }); };

    const fmtDate = d => {
        const date = new Date(d);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        return isToday
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const sessionTitle = sessions.find(s => s.id === activeSession?.id)?.title || 'TravelAI';

    return (
        <div className={`cp-root ${voiceModalOpen ? 'cp-root--voice-open' : ''}`}>
            {/* Delete chat confirmation modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDeleteSession}
                title="Delete Chat"
                message="Are you sure you want to delete this chat? All messages in this chat will be permanently removed."
                confirmText="Delete"
                danger
            />

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
                        <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} />
                    </button>
                    <div className="cp-topbar-title">
                        <i className="fas fa-robot" style={{ color: '#06b6d4', marginRight: 8 }} />
                        {activeSession ? sessionTitle : 'TravelAI — Quotation Assistant'}
                    </div>

                    <button className="cp-topbar-dashboard" onClick={() => navigate(currentLocation.pathname === '/agent-chat' ? '/agent-dashboard' : '/dashboard')} title="Go to Dashboard">
                        <i className="fas fa-th-large" /> Dashboard
                    </button>
                </div>

                {/* Messages / Welcome */}
                <div className="cp-messages">
                    {!activeSession && messages.length === 0 ? (
                        /* Welcome screen */
                        <div className="cp-welcome">
                            <div className="cp-welcome-rings">
                                <div className="cp-welcome-ring r1" />
                                <div className="cp-welcome-ring r2" />
                                <div className="cp-welcome-icon"><i className="fas fa-plane-departure" /></div>
                            </div>
                            <h2 className="cp-welcome-title">AI-Powered Travel Quotation</h2>
                            <p className="cp-welcome-sub">
                                Mention the <strong>country</strong>, <strong>duration</strong>, <strong>number of travellers</strong> and travel date.<br />
                                Our AI will generate a personalized quotation in seconds.
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
                            {messages.map(m => (
                                <ChatMsg
                                    key={m.id}
                                    msg={m}
                                    recommendations={aiRecsMap[m.id]}
                                    onStatusChange={(newStatus) => {
                                        // Map card UI status back to a DB-compatible status
                                        const dbStatus = newStatus === 'saved' ? 'accepted' : newStatus;
                                        setMessages(prev => prev.map(p =>
                                            p.id === m.id
                                                ? { ...p, quotation_status: dbStatus }
                                                : p
                                        ));
                                    }}
                                    onSelectPrompt={(text) => {
                                        setInput(text);
                                        setTimeout(() => {
                                            if (textareaRef.current) {
                                                textareaRef.current.focus();
                                                textareaRef.current.style.height = 'auto';
                                                textareaRef.current.style.height =
                                                    Math.min(textareaRef.current.scrollHeight, 140) + 'px';
                                            }
                                        }, 50);
                                    }}
                                />
                            ))}
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
                    
                    <div className="cp-input-card">
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
                            placeholder="e.g., Create a Singapore trip for 3 nights with 3 pax from April 5th. (Shift+Enter for new line)"
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

            {voiceModalOpen && (
                <div className="cp-voice-overlay" onClick={() => closeVoiceModal()}>
                    <div className="cp-voice-modal" onClick={e => e.stopPropagation()}>
                        {/* Blue arc glow rendered behind all content */}
                        <div className="cp-voice-glow-arc" aria-hidden="true" />

                        <button
                            type="button"
                            className="cp-voice-close"
                            onClick={() => closeVoiceModal()}
                            aria-label="Close voice search"
                        >
                            <i className="fas fa-xmark" />
                        </button>

                        <div className="cp-voice-chip">
                            <i className="fas fa-microphone" />
                            AI Voice Search
                        </div>

                        <div className="cp-voice-panel">
                            <div className="cp-voice-transcript">
                                {voiceTranscript || voiceInterim ? (
                                    <>
                                        <span className="cp-voice-text-final">{voiceTranscript}</span>
                                        {voiceTranscript && voiceInterim ? ' ' : ''}
                                        {voiceInterim && <span className="cp-voice-text-interim">{voiceInterim}</span>}
                                    </>
                                ) : (
                                    <span className="cp-voice-placeholder">
                                        {voiceListening
                                            ? 'Start speaking. Your words will appear here live.'
                                            : 'Preparing your microphone...'}
                                    </span>
                                )}
                            </div>

                            <div className={`cp-voice-wave${voiceListening ? ' is-active' : ''}`}>
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <span key={i} style={{ '--wi': i }} />
                                ))}
                            </div>

                            <button
                                type="button"
                                className={`cp-voice-mic-btn ${voiceListening ? 'is-listening' : ''}`}
                                onClick={() => {
                                    if (voiceListening) closeVoiceModal({ shouldApply: true, stopMode: 'stop' });
                                    else startVoiceRecognition();
                                }}
                                aria-label={voiceListening ? 'Stop voice search' : 'Start voice search'}
                            >
                                <i className={`fas ${voiceListening ? 'fa-stop' : 'fa-microphone'}`} />
                            </button>
                        </div>

                        <p className="cp-voice-status">
                            {voiceError || (voiceListening ? 'Listening now. Tap the button again when you are done.' : 'Tap the microphone to try again.')}
                        </p>

                        <div className="cp-voice-actions">
                            <button type="button" className="cp-voice-btn cp-voice-btn--ghost" onClick={() => closeVoiceModal()}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="cp-voice-btn cp-voice-btn--primary"
                                onClick={() => {
                                    if (voiceListening) closeVoiceModal({ shouldApply: true, stopMode: 'stop' });
                                    else {
                                        const transcript = getCombinedVoiceTranscript();
                                        if (transcript) closeVoiceModal({ shouldApply: true });
                                        else startVoiceRecognition();
                                    }
                                }}
                            >
                                {voiceListening ? 'Use text' : (voiceTranscript || voiceInterim ? 'Add to field' : 'Retry')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
