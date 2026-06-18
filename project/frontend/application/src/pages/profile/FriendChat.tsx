/**
 * Friend Chat Page Component
 *
 * Direct messaging with a friend.
 */

import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { getAvatarUrl } from '../../utils/avatar';
import type { Message } from '../../types';
import { groupConsecutiveMessages } from '../../utils/messageUtils';

function FriendChat() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user, sendFriendMessage, updateUser, onlineFriendIds } = useContext(AuthContext);

  const friendId = parseInt(id || '0');
  const friend = user?.friends.find((f) => f.id === friendId);
  const [friendInfo, setFriendInfo] = useState<{ id: number; username: string; avatar: string } | null>(null);
  const [isLoadingFriend, setIsLoadingFriend] = useState(true);
  const [friendError, setFriendError] = useState(false);

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

  useEffect(() => {
    if (!friend && !friendInfo && !friendError) {
      api.getUserProfile(friendId)
        .then(data => {
          setFriendInfo({
            id: data.id,
            username: data.username,
            avatar: getAvatarUrl(data.avatar_url)
          });
          setIsLoadingFriend(false);
        })
        .catch(() => {
          setFriendError(true);
          setIsLoadingFriend(false);
        });
    } else if (friend) {
      setIsLoadingFriend(false);
    }
  }, [friend, friendId, friendInfo, friendError]);

  const fetchHistory = async () => {
    if (!friendId) return;
    if (!friendInfo && !friend) return;
    try {
      const history = await api.getFriendMessages(friendId, 50);
      const formattedMessages: Message[] = history.message_list.map((m: any) => {
        const isOwn = Number(m.sender_id) === Number(user?.id);
        const chatFriend = friendInfo ?? friend;
        return {
          id: m.id,
          text: m.content,
          sender: {
            id: m.sender_id,
            username: isOwn ? (user?.username || '') : (chatFriend?.username || ''),
            avatar: isOwn ? (user?.avatar || '') : (chatFriend?.avatar || ''),
          },
          timestamp: m.sent_at
        };
      }).reverse();

      if (user) {
        const existingFriend = user.friends.find(f => f.id === friendId);
        let updatedFriends;

        if (existingFriend) {
          updatedFriends = user.friends.map(f => {
            if (f.id === friendId) return { ...f, chat: formattedMessages };
            return f;
          });
        } else if (friendInfo) {
          updatedFriends = [
            ...user.friends,
            { id: friendInfo.id, username: friendInfo.username, avatar: friendInfo.avatar, chat: formattedMessages }
          ];
        } else {
          updatedFriends = user.friends;
        }

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
  }, [friendId, friendInfo]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [friend?.chat]);

  if (isLoadingFriend) {
    return (
      <div className="friend-chat-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (friendError || (!friend && !friendInfo)) {
    return (
      <div className="friend-chat-page">
        <h1>{t('friends.notFound') || 'Friend not found'}</h1>
        <p>{t('friends.notFoundDesc') || 'This friend does not exist or you are not friends.'}</p>
        <Link to="/profile/friends" className="btn btn-secondary">{t('friends.backToFriends') || 'Back to Friends'}</Link>
      </div>
    );
  }

  const displayFriend = friend ?? friendInfo!;
  const chat = friend?.chat || [];

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

  return (
    <div className="friend-chat-page">
      <div className="friend-chat-header">
        <Link to="/profile/friends" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="back-icon">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 111.06 1.06L5.56 9.25h10.69A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
          {t('friends.backToFriends') || 'Back to Friends'}
        </Link>
        <div className="friend-chat-title">
          <div className="friend-chat-avatar-wrapper">
            <img src={displayFriend.avatar} alt={displayFriend.username} className="friend-chat-avatar" />
            <span className={`status-indicator ${onlineFriendIds.has(displayFriend.id) ? 'online' : 'offline'}`} />
          </div>
          <Link to={`/profile/${displayFriend.id}`}><h1>{displayFriend.username}</h1></Link>
        </div>
      </div>

      <div className="friend-chat-container">
        <div className="friend-chat-messages">
          {chat.length > 0 ? (
            groupConsecutiveMessages(chat, user?.id).map((group) =>
              group.messages.map((msg, idx) => (
                <div key={msg.id} className={`friend-chat-message ${group.isOwn ? 'own' : ''} ${idx > 0 ? 'grouped' : ''}`}>
                  <div className="chat-message-header">
                    <img src={group.isOwn ? user?.avatar : msg.sender.avatar} alt={msg.sender.username} className="chat-avatar" />
                    <Link to={`/profile/${msg.sender.id}`} className="chat-username">{msg.sender.username}</Link>
                  </div>
                  <div className="chat-message-body">
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
