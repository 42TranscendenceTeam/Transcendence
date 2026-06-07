/**
 * Friend Chat Page Component
 * 
 * Direct messaging with a friend.
 * 
 * TODO: Connect to real API when backend is ready
 */

import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import type { Message } from '../../types';
import { groupConsecutiveMessages } from '../../utils/messageUtils';

function FriendChat() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, sendFriendMessage, updateUser, onlineFriendIds } = useContext(AuthContext);
  
  const friendId = parseInt(id || '0');
  const friend = user?.friends.find((f) => f.id === friendId);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !friendId) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('join chat', user.id, friendId, (res: any) => {
        console.log('Joined chat:', res);
      });

      const handleNewMessage = (content: string, ack?: (ok: boolean) => void) => {
        if (ack) ack(true);
        fetchHistory();
      };

      socket.on('chat message', handleNewMessage);

      return () => {
        socket.emit('leave chat', user.id, friendId, (res: any) => {
          console.log('Left chat:', res);
        });
        socket.off('chat message', handleNewMessage);
      };
    }
  }, [user?.id, friendId]);

  const fetchHistory = async () => {
    if (!friendId) return;
    try {
      const history = await api.getFriendMessages(friendId, 50);
      const formattedMessages: Message[] = history.message_list.map((m: any) => {
        const isOwn = Number(m.sender_id) === Number(user?.id);
        return {
          id: m.id,
          text: m.content,
          sender: {
            id: m.sender_id,
            username: isOwn ? (user?.username || '') : (friend?.username || ''),
            avatar: isOwn ? (user?.avatar || '') : (friend?.avatar || ''),
          },
          timestamp: m.sent_at
        };
      }).reverse();

      if (user) {
        const updatedFriends = user.friends.map(f => {
          if (f.id === friendId) return { ...f, chat: formattedMessages };
          return f;
        });
        updateUser({ friends: updatedFriends });
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    if (friendId) {
      api.markFriendMessagesRead(friendId).catch(console.error);
    }
  }, [friendId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [friend?.chat]);

  if (!friend) {
    return (
      <div className="friend-chat-page">
        <h1>{t('friends.notFound') || 'Friend not found'}</h1>
        <p>{t('friends.notFoundDesc') || 'This friend does not exist or you are not friends.'}</p>
        <Link to="/profile/friends" className="btn btn-secondary">{t('friends.backToFriends') || 'Back to Friends'}</Link>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: { id: user.id, username: user.username, avatar: user.avatar },
      timestamp: new Date().toISOString(),
    };
    
    await sendFriendMessage(friendId, newMessage);
    setMessage('');
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chat = friend.chat || [];

  return (
    <div className="friend-chat-page">
      <div className="friend-chat-header">
        <Link to="/profile/friends" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon">
            <path fillRule="evenodd" d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" clipRule="evenodd" />
          </svg>
          {t('friends.backToFriends') || 'Back to Friends'}
        </Link>
        <div className="friend-chat-title">
          <img src={friend.avatar} alt={friend.username} className="friend-chat-avatar" />
          <span className={`status-indicator ${onlineFriendIds.has(friend.id) ? 'online' : 'offline'}`} />
          <Link to={`/profile/${friend.id}`}><h1>{friend.username}</h1></Link>
        </div>
      </div>

      <div className="friend-chat-container">
        <div className="friend-chat-messages">
          {chat.length > 0 ? (
            groupConsecutiveMessages(chat, user?.id).map((group) =>
              group.messages.map((msg, idx) => (
                <div key={msg.id} className={`friend-chat-message ${group.isOwn ? 'own' : ''} ${idx > 0 ? 'grouped' : ''}`}>
                  {idx === 0 && (
                    <img src={group.isOwn ? user?.avatar : msg.sender.avatar} alt={msg.sender.username} className="chat-avatar" />
                  )}
                  <div className="friend-chat-message-content">
                    {idx === 0 && (
                      <Link to={`/profile/${msg.sender.id}`} className="chat-username">{msg.sender.username}</Link>
                    )}
                    <span className="chat-time">{formatTime(msg.timestamp)}</span>
                    <p className="chat-text">{msg.text}</p>
                  </div>
                </div>
              ))
            )
          ) : (
            <p className="chat-empty">{t('teams.noMessages')}. {t('teams.startConversation')}</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="friend-chat-input-container">
          <input
            type="text"
            placeholder={t('chat.typeMessage')}
            className="friend-chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary chat-send">{t('chat.send')}</button>
        </form>
      </div>
    </div>
  );
}

export default FriendChat;