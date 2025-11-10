import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import Message from './Message';
import './Channel.css';

const Channel = ({ user = null, db = null }) => {
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');

const { uid, displayName, photoURL } = user;

useEffect(() => {
    if (db) {
        const unsubscribe = db
        .collection('messages')
        .orderBy('createdAt')
        .limit(100)
        .onSnapshot(querySnapshot => {
            const data = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            }));
            setMessages(data);
        })

        return unsubscribe;
    }
}, [db]);


    const handleOnChange = e => {
        setNewMessage(e.target.value);
    };

    const handleOnSubmit = e => {
        e.preventDefault();

        if (db) {
            db.collection('messages').add({
                text: newMessage,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                displayName,
                photoURL
            });
        }

        setNewMessage('');
    };


    return (
    <div className="channel-container">
        <div className="messages-container">
            <ul className="messages-list">
                {messages.map(message => (
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
            <button type="submit" disabled={!newMessage} className="send-button">
                Send
            </button>
        </form>
    </div>
  );
};

export default Channel;