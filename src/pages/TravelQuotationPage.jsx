import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { assistantAPI } from '../services/api';
import './TravelQuotationPage.css';

const TravelQuotationPage = () => {
  const { user, token, sessionId, logout } = useAuth(); // Get token and stable sessionId
  const navigate = useNavigate();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState('');

  const chatMessagesRef = useRef(null);

  // Load chats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('travel_chats');
    if (stored) {
      try {
        const parsedChats = JSON.parse(stored);
        console.log('Loading chats from localStorage:', parsedChats);
        setChats(parsedChats);

        if (Object.keys(parsedChats).length > 0) {
          const firstChatId = Object.keys(parsedChats)[0];
          console.log('Setting initial chat ID:', firstChatId);
          setCurrentChatId(firstChatId);
        }
      } catch (e) {
        console.error('Error loading chats:', e);
      }
    }
  }, []);

  // Ensure chat data is fresh when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const stored = localStorage.getItem('travel_chats');
      if (stored) {
        try {
          const parsedChats = JSON.parse(stored);
          console.log('Parsed chats from localStorage:', parsedChats);
          console.log('Looking for chat:', currentChatId);
          console.log('Chat found:', parsedChats[currentChatId]);
          if (parsedChats[currentChatId]) {
            // Update the entire chats object
            setChats(parsedChats);
          }
        } catch (e) {
          console.error('Error refreshing chat data:', e);
        }
      }
    }
  }, [currentChatId]);

  // Save chats to localStorage
  useEffect(() => {
    if (Object.keys(chats).length > 0) {
      localStorage.setItem('travel_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Scroll to bottom when messages change or chat switches
  useEffect(() => {
    if (chatMessagesRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      });
    }
  }, [chats, currentChatId]);

  const createNewChat = () => {
    const chatId = 'chat_' + Date.now();
    const newChat = {
      id: chatId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
      // No longer store sessionId in chat - we'll use auth token dynamically
    };

    const updatedChats = { ...chats, [chatId]: newChat };
    setChats(updatedChats);
    localStorage.setItem('travel_chats', JSON.stringify(updatedChats));
    setCurrentChatId(chatId);

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const loadChat = (chatId) => {
    console.log('Loading chat:', chatId);
    setCurrentChatId(chatId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this chat?')) {
      const newChats = { ...chats };
      delete newChats[chatId];
      setChats(newChats);

      if (currentChatId === chatId) {
        const remainingChats = Object.keys(newChats);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0]);
        } else {
          setCurrentChatId(null);
        }
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Create new chat if none exists
    let chatId = currentChatId;
    let currentChatData;

    if (!chatId) {
      chatId = 'chat_' + Date.now();
      const newChat = {
        id: chatId,
        title: trimmedMessage.substring(0, 50) + (trimmedMessage.length > 50 ? '...' : ''),
        createdAt: new Date().toISOString(),
        messages: []
        // No longer store sessionId - we use auth token
      };
      const updatedChats = { ...chats, [chatId]: newChat };
      setChats(updatedChats);
      localStorage.setItem('travel_chats', JSON.stringify(updatedChats));
      setCurrentChatId(chatId);
      currentChatData = newChat; // Use the newly created chat
    } else {
      currentChatData = chats[chatId] || {};
    }

    const chat = currentChatData;

    // Update chat title from first message
    if (chat.messages && chat.messages.length === 0) {
      chat.title = trimmedMessage.substring(0, 50) + (trimmedMessage.length > 50 ? '...' : '');
    }

    // Add user message
    const userMsg = {
      type: 'user',
      content: trimmedMessage,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(chat.messages || []), userMsg];

    const updatedChatsWithUserMsg = {
      ...chats,
      [chatId]: {
        ...chat,
        messages: updatedMessages,
        title: chat.title || trimmedMessage.substring(0, 50)
      }
    };
    setChats(updatedChatsWithUserMsg);
    localStorage.setItem('travel_chats', JSON.stringify(updatedChatsWithUserMsg));

    setMessage('');
    setError('');
    setIsLoading(true);

    // Show confirmation message
    const confirmMsg = {
      type: 'info',
      content: 'I got your request. Wait a few minutes while I create that for you...',
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_confirm`,
      timestamp: new Date().toISOString()
    };

    const updatedChatsWithConfirm = {
      ...updatedChatsWithUserMsg,
      [chatId]: {
        ...updatedChatsWithUserMsg[chatId],
        messages: [...updatedChatsWithUserMsg[chatId].messages, confirmMsg]
      }
    };
    setChats(updatedChatsWithConfirm);
    localStorage.setItem('travel_chats', JSON.stringify(updatedChatsWithConfirm));

    try {
      // Validate auth token
      if (!token) {
        console.error('[SEND MESSAGE] No auth token available!');
        setError('Authentication token missing. Please login again.');
        setIsLoading(false);
        return;
      }

      // Keep original sessionId stable for n8n; fallback to token if missing
      const effectiveSessionId = sessionId || token;

      console.log('═══════════════════════════════════════════════════');
      console.log('📨 [SESSION ID] Generated Session ID:', effectiveSessionId);
      console.log('🔑 [AUTH TOKEN] Current Token:', token);
      console.log('✅ [AUTH TOKEN] Token present:', !!token);
      console.log('═══════════════════════════════════════════════════');
      console.log('[SEND MESSAGE] Chat ID:', chatId);
      console.log('[SEND MESSAGE] Session ID for N8N:', effectiveSessionId);
      console.log('[SEND MESSAGE] Auth Token present:', !!token);
      console.log('[SEND MESSAGE] Sending to N8N webhook with:', {
        chatInput: trimmedMessage,
        sessionId: effectiveSessionId,
        user: user?.email || 'unknown'
      });

      const response = await assistantAPI.sendMessage(trimmedMessage, effectiveSessionId, chatId);

      let assistantMessage = '';
      let isSuccess = false;
      let quotationNo = null;

      console.log('Webhook Response:', response);
      console.log('Response Type:', typeof response);
      console.log('Response Keys:', response ? Object.keys(response) : 'null');
      console.log('Full Response:', JSON.stringify(response, null, 2));

      // n8n returns: { quotation_no: "123", status: "success", message: "..." }
      // CRITICAL: Extract quotation_no with strict validation
      if (response && response.quotation_no && response.quotation_no !== '') {
        // Ensure it's a string, trim, and validate it's numeric (not random)
        const qNo = String(response.quotation_no).trim();
        // Check: not "null", not "undefined", is numeric, and length > 3 (reasonable quotation ID)
        if (qNo && qNo !== 'null' && qNo !== 'undefined' && /^\d+$/.test(qNo) && qNo.length > 2) {
          quotationNo = qNo;
          isSuccess = true;
          console.log('✅ [QUOTATION EXTRACTED] Valid quotation_no:', quotationNo, '(length:', qNo.length + ')');
        } else {
          console.warn('⚠️ [QUOTATION INVALID] quotation_no failed validation:', response.quotation_no, 'type:', typeof qNo, 'regex test:', /^\d+$/.test(qNo));
        }
      }

      // Check alternate locations only if primary extraction failed
      if (!quotationNo) {
        if (response.body && response.body.quotation_no) {
          quotationNo = response.body.quotation_no;
          isSuccess = true;
        } else if (response.reference_id) {
          quotationNo = response.reference_id;
          isSuccess = true;
        } else if (response.request_no) {
          quotationNo = response.request_no;
          isSuccess = true;
        } else if (response.refno) {
          quotationNo = response.refno;
          isSuccess = true;
        } else if (response.id) {
          quotationNo = response.id;
          isSuccess = true;
        } else if (response.quotation_number) {
          quotationNo = response.quotation_number;
          isSuccess = true;
        } else if (Array.isArray(response) && response.length > 0) {
          const firstItem = response[0];
          console.log('First item in array:', firstItem);
          if (firstItem.quotation_no) {
            quotationNo = firstItem.quotation_no;
            isSuccess = true;
          } else if (firstItem.reference_id) {
            quotationNo = firstItem.reference_id;
            isSuccess = true;
          } else if (firstItem.refno) {
            quotationNo = firstItem.refno;
            isSuccess = true;
          } else if (firstItem.id) {
            quotationNo = firstItem.id;
            isSuccess = true;
          }
        }
      }

      // Handle webhook response
      if (quotationNo) {
        // SUCCESS: Found and validated quotation number
        console.log('✅ [SUCCESS] Quotation created:', quotationNo);
        assistantMessage = `Your Request Has Been Created\n\nYour Request No is ${quotationNo}\n\nOur team will review your travel request and send you a detailed quote shortly. Thank you for choosing our services.`;
        isSuccess = true;
      } else if (response && response.status === 'success' && response.message) {
        // Webhook succeeded but no valid quotation number - backend issue
        console.warn('⚠️ [WARNING] Status success but no valid quotation_no');
        assistantMessage = 'Request created but unable to retrieve booking number. Please contact support.';
        isSuccess = false;
      } else if (response.error) {
        // ERROR: Webhook returned error field
        console.error('❌ [ERROR] Webhook error:', response.error);
        assistantMessage = response.error;
        isSuccess = false;
      } else if (response.success === false) {
        // ERROR: Webhook indicated failure
        console.error('❌ [ERROR] Webhook failure:', response);
        assistantMessage = response.output || response.message || 'Oops! Something went wrong. Please contact the technical team.';
        isSuccess = false;
      } else if (response.output) {
        // No quotation number but has output - treat as error
        console.warn('⚠️ [WARNING] Output but no quotation_no:', response);
        assistantMessage = 'Oops! Something went wrong. Please contact the technical team.';
        isSuccess = false;
      } else if (response.message && !quotationNo) {
        // No quotation number but has message - treat as error
        console.warn('⚠️ [WARNING] Message but no quotation_no:', response);
        assistantMessage = 'Oops! Something went wrong. Please contact the technical team.';
        isSuccess = false;
      } else {
        // Unrecognized response structure
        console.error('❌ [ERROR] Unrecognized response structure:', response);
        assistantMessage = 'Oops! Something went wrong. Please contact the technical team.';
        isSuccess = false;
      }

      console.log('Final Message:', assistantMessage);
      console.log('Is Success:', isSuccess);
      console.log('Quotation No:', quotationNo);

      const assistantMsg = {
        type: 'assistant',
        content: assistantMessage,
        isSuccess: isSuccess,
        quotationNo: quotationNo,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_response`,
        timestamp: new Date().toISOString()
      };

      const updatedChatsWithAssistantMsg = {
        ...updatedChatsWithConfirm,
        [chatId]: {
          ...updatedChatsWithConfirm[chatId],
          messages: [...updatedChatsWithConfirm[chatId].messages, assistantMsg]
        }
      };
      setChats(updatedChatsWithAssistantMsg);
      localStorage.setItem('travel_chats', JSON.stringify(updatedChatsWithAssistantMsg));
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to the server. Please try again.');

      const errorMsg = {
        type: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_error`,
        timestamp: new Date().toISOString()
      };

      const updatedChatsWithError = {
        ...updatedChatsWithConfirm,
        [chatId]: {
          ...updatedChatsWithConfirm[chatId],
          messages: [...updatedChatsWithConfirm[chatId].messages, errorMsg]
        }
      };
      setChats(updatedChatsWithError);
      localStorage.setItem('travel_chats', JSON.stringify(updatedChatsWithError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const currentChat = chats[currentChatId];
  const chatArray = Object.entries(chats).map(([key, chat]) => ({
    ...chat,
    id: chat.id || key  // Ensure id exists, fallback to key if missing
  })).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Debug logging
  useEffect(() => {
    console.log('Current Chat ID:', currentChatId);
    console.log('Current Chat:', currentChat);
    console.log('All Chats:', chats);
    console.log('Chat Array:', chatArray);
  }, [currentChatId, currentChat, chats, chatArray]);

  return (
    <div className="travel-quotation-page">
      {/* Mobile Menu Toggle */}
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <i className="fas fa-plus"></i>
            <span>New Chat</span>
          </button>
        </div>

        <div className="chat-history">
          <div className="chat-history-title">Recent Chats</div>
          {chatArray.map((chat) => {
            console.log('Rendering chat item:', { id: chat.id, title: chat.title });
            return (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="chat-item-content">
                <div className="chat-item-title">{chat.title}</div>
                <div className="chat-item-date">{formatDate(chat.createdAt)}</div>
              </div>
              <button className="chat-item-delete" onClick={(e) => deleteChat(chat.id, e)}>
                <i className="fas fa-trash"></i>
              </button>
            </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="main-container">
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-icon"><i className="fas fa-plane"></i></div>
            <h1>Travel Quotation Assistant</h1>
            <p>Plan your perfect trip with AI-powered assistance</p>
          </div>

          {error && (
            <div className="error-message active">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="chat-messages" ref={chatMessagesRef}>
            {!currentChat || !currentChat.messages || currentChat.messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><i className="fas fa-comments"></i></div>
                <h2>Start Your Journey</h2>
                <p>Begin a conversation by telling me about your dream travel destination!</p>
              </div>
            ) : (
              currentChat.messages && currentChat.messages.map((msg, index) => {
                // Check if this is a success message by looking at the content
                const isSuccessMsg = msg.content && msg.content.includes('Your Request Has Been Created');
                
                // Try to get request number from stored quotationNo first, then from content
                let requestNumber = msg.quotationNo;
                if (!requestNumber && msg.content) {
                  const requestNumberMatch = msg.content.match(/Your Request No is (\d+)/);
                  requestNumber = requestNumberMatch ? requestNumberMatch[1] : null;
                }

                console.log('Rendering message:', { isSuccessMsg, requestNumber, content: msg.content?.substring(0, 50) });

                return (
                  <div key={msg.id || `msg_${index}`} className={`message ${msg.type} ${msg.isSuccess ? 'success' : ''}`}>
                    {isSuccessMsg ? (
                      <div className="success-message-content">
                        <div className="success-message-title">✅ Your Request Has Been Created</div>
                        <div className="success-message-body">
                          {requestNumber && (
                            <div className="request-number-section">
                              <span className="request-label">Your Request Number:</span>
                              <div 
                                className="request-number-box"
                                onClick={() => {
                                  const copyToClipboard = async () => {
                                    try {
                                      if (navigator.clipboard && window.isSecureContext) {
                                        await navigator.clipboard.writeText(requestNumber);
                                      } else {
                                        // Fallback for non-HTTPS or unsupported browsers
                                        const textarea = document.createElement('textarea');
                                        textarea.value = requestNumber;
                                        document.body.appendChild(textarea);
                                        textarea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textarea);
                                      }
                                      setCopiedNumber(requestNumber);
                                      setShowCopyModal(true);
                                    } catch (err) {
                                      console.error('Copy failed:', err);
                                      setCopiedNumber(requestNumber);
                                      setShowCopyModal(true);
                                    }
                                  };
                                  copyToClipboard();
                                }}
                                title="Click to copy"
                              >
                                {requestNumber}
                                <span className="copy-icon">📋</span>
                              </div>
                            </div>
                          )}
                          <div className="success-message-text">
                            Our team will review your travel request and send you a detailed quote shortly.
                          </div>
                          <div className="success-message-footer">
                            Thank you for choosing our services! 🙏
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="message-content">{msg.content}</div>
                    )}
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="typing-indicator active">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
              <textarea
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your dream trip (e.g., '10 days in Japan for 2 people')"
                rows="1"
                disabled={isLoading}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Copy Success Modal */}
        {showCopyModal && (
          <div className="modal-overlay" onClick={() => setShowCopyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">✅ Success</div>
              <div className="modal-message">
                Request number <strong>{copiedNumber}</strong> has been copied to clipboard!
              </div>
              <div className="modal-buttons">
                <button 
                  className="modal-ok-btn"
                  onClick={() => setShowCopyModal(false)}
                >
                  OK
                </button>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowCopyModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelQuotationPage;
