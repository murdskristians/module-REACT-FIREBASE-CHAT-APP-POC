import React from 'react';
import { formatRelative } from 'date-fns';
import './Message.css';

const Message = ({
  createdAt = null,
  text = '',
  displayName = '',
  photoURL = '',
}) => {
  return (
    <div className={`message ${!photoURL ? 'message-without-avatar' : ''}`}>
      {photoURL ? (
        <img src={photoURL} alt="Avatar" className="message-avatar" />
      ) : null}
      <div className="message-content">
        {displayName ? (
          <div className="message-header">
            <p className="message-name">{displayName}</p>
            {createdAt?.seconds ? (
              <span className="message-timestamp">
                {formatRelative(new Date(createdAt.seconds * 1000), new Date())}
              </span>
            ) : null}
          </div>
        ) : null}
        <p className="message-text">{text}</p>
      </div>
    </div>
  );
};

export default Message;
