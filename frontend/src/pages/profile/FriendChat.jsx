import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function FriendChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, sendFriendMessage } = useContext(AuthContext);
  
  const friendId = parseInt(id);
  const friend = user?.friends.find((f) => f.id === friendId);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [friend?.chat]);

  if (!friend) {
    return (
      <div className="friend-chat-page">
        <h1>Friend not found</h1>
        <p>This friend does not exist or you are not friends.</p>
        <Link to="/profile/friends" className="btn btn-secondary">Back to Friends</Link>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      senderUsername: user.username,
      senderAvatar: user.avatar,
      text: message,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    
    sendFriendMessage(friendId, newMessage);
    setMessage('');
  };

  const formatTime = (timestamp) => {
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
          Back to Friends
        </Link>
        <div className="friend-chat-title">
          <img src={friend.avatar} alt={friend.username} className="friend-chat-avatar" />
          <h1>{friend.username}</h1>
        </div>
      </div>

      <div className="friend-chat-container">
        <div className="friend-chat-messages">
          {chat.length > 0 ? (
            chat.map((msg) => (
              <div key={msg.id} className={`friend-chat-message ${msg.isOwn ? 'own' : ''}`}>
                {!msg.isOwn && (
                  <img src={msg.senderAvatar || friend.avatar} alt={msg.senderUsername} className="chat-avatar" />
                )}
                <div className="friend-chat-message-content">
                  {!msg.isOwn && <span className="chat-username">{msg.senderUsername}</span>}
                  <span className="chat-time">{formatTime(msg.timestamp)}</span>
                  <p className="chat-text">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="chat-empty">No messages yet. Start the conversation!</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="friend-chat-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            className="friend-chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary chat-send">Send</button>
        </form>
      </div>
    </div>
  );
}

export default FriendChat;