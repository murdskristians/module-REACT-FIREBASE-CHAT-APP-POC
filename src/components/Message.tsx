import React from 'react';
import { formatRelative } from 'date-fns';
import firebase from 'firebase/compat/app';

import './Message.css';

type MessageProps = {
  createdAt?: firebase.firestore.Timestamp | null;
  text?: string;
  displayName?: string | null;
  photoURL?: string | null;
};

const Message: React.FC<MessageProps> = ({
  createdAt = null,
  text = '',
  displayName = '',
  photoURL = '',
}) => {
  const timestamp = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : null;

  return (
    <div className={`message ${!photoURL ? 'message-without-avatar' : ''}`}>
      {photoURL ? (
        <img src={photoURL} alt="Avatar" className="message-avatar" referrerPolicy="no-referrer" />
      ) : null}
      <div className="message-content">
        {displayName ? (
          <div className="message-header">
            <p className="message-name">{displayName}</p>
            {timestamp ? (
              <span className="message-timestamp">
                {formatRelative(timestamp, new Date())}
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
