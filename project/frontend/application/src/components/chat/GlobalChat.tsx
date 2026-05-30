/**
 * Global Chat Component
 * 
 * General chat visible on the Feed page for logged-in users.
 * Displays messages from all users.
 */

import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import type { Message } from '../../types';

function GlobalChat() {
  const { t } = useTranslation();
  const { user, sendGlobalMessage } = useContext(AuthContext);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = user?.globalChat || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: { id: user.id, username: user.username, avatar: user.avatar },
      timestamp: new Date().toISOString(),
    };
    
    sendGlobalMessage(newMessage);
    setMessage('');
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="global-chat">
      <div className="global-chat-header">
        <h2>{t('feed.globalChat') || 'Global Chat'}</h2>
      </div>

      <div className="global-chat-messages">
        {chat.length > 0 ? (
          chat.map((msg) => (
            <div key={msg.id} className={`global-chat-message ${msg.sender.id === user?.id ? 'own' : ''}`}>
              <img src={msg.sender.avatar} alt={msg.sender.username} className="chat-avatar" />
              <div className="global-chat-message-content">
                <Link to={`/profile/${msg.sender.id}`} className="chat-username">{msg.sender.username}</Link>
                <span className="chat-time">{formatTime(msg.timestamp)}</span>
                <p className="chat-text">{msg.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="chat-empty">{t('chat.noMessages')}. {t('chat.startConversation')}</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="global-chat-input-container">
        <input
          type="text"
          placeholder={t('chat.typeMessage')}
          className="global-chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-primary chat-send">{t('chat.send')}</button>
      </form>
    </div>
  );
}

export default GlobalChat;