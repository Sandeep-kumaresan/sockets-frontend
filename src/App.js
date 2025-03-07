import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://flaskwebsockets.azurewebsites.net');

const ChatClient = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState([]);
  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    const name = prompt('Enter your username:');
    setUsername(name);
    socket.emit('register', { username: name });

    socket.on('server_message', (data) => {
      addMessage(`[Server]: ${data}`);
    });

    socket.on('private_message', (data) => {
      addMessage(`[Private from ${data.sender}]: ${data.message}`);
    });

    socket.on('group_message', (data) => {
      addMessage(`[Group ${data.sender}]: ${data.message}`);
    });

    return () => {
      socket.off('server_message');
      socket.off('private_message');
      socket.off('group_message');
    };
  }, []);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const sendMessage = () => {
    if (privateMode) {
      socket.emit('private_message', {
        sender: username,
        receiver: recipient,
        message,
      });
      addMessage(`[Private to ${recipient}]: ${message}`);
    } else {
      socket.emit('group_message', {
        sender: username,
        group_name: recipient,
        message,
      });
      addMessage(`[Group ${recipient}]: ${message}`);
    }
    setMessage('');
  };

  const createGroup = () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
      socket.emit('create_group', { group_name: groupName });
      addMessage(`Created group: ${groupName}`);
    }
  };

  const joinGroup = () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
      socket.emit('join_group', {
        username,
        group_name: groupName,
      });
      addMessage(`Joined group: ${groupName}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Chat Client</h2>
      <div
        style={{
          height: '300px',
          overflowY: 'scroll',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={recipient}
        placeholder="Recipient (user or group)"
        onChange={(e) => setRecipient(e.target.value)}
      />
      <br />
      <textarea
        value={message}
        placeholder="Enter your message"
        onChange={(e) => setMessage(e.target.value)}
        rows="3"
        style={{ width: '100%', marginTop: '10px' }}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={privateMode}
          onChange={() => setPrivateMode(!privateMode)}
        />
        Private Message
      </label>
      <br />
      <button onClick={sendMessage}>Send</button>
      <button onClick={createGroup} style={{ marginLeft: '10px' }}>
        Create Group
      </button>
      <button onClick={joinGroup} style={{ marginLeft: '10px' }}>
        Join Group
      </button>
    </div>
  );
};

export default ChatClient;
