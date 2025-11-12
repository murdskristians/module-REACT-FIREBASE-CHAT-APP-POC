import React, { useEffect, useState } from 'react';

import Message from './Message';

import {
  sendMessage,
  subscribeToMessages,
  type FirestoreMessage,
} from '../firebase/messages';

import type { FirebaseUser } from '../firebase/auth';

import './Channel.css';

type ChannelProps = {
  user: FirebaseUser;
};

const Channel: React.FC<ChannelProps> = ({ user }) => {
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const { uid, displayName, photoURL } = user;

  useEffect(() => {
    const unsubscribe = subscribeToMessages(setMessages);

    return unsubscribe;
  }, []);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setNewMessage(event.target.value);
  };

  const handleOnSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    await sendMessage({
      text: newMessage,
      uid,
      displayName,
      photoURL,
    });

    setNewMessage('');
  };

  return (
    <div className="channel-container">
      <div className="messages-container">
        <ul className="messages-list">
          {messages.map((message) => (
            <li key={message.id}>
              <Message {...message} />
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleOnSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleOnChange}
          placeholder="Type your message here ..."
          className="message-input"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Channel;
