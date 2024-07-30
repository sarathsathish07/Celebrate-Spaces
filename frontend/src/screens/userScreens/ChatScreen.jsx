import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  useGetChatRoomsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useCreateChatRoomMutation 
} from '../../slices/usersApiSlice.js';
import io from 'socket.io-client';
import {
  Container,
  Row,
  Col,
} from "react-bootstrap";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import { useSelector } from "react-redux";




const socket = io('http://localhost:5000');

const ChatScreen = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const currentHotelId = location.pathname.split('/')[2];
  const messagesEndRef = useRef(null);

  const { data: chatRooms = [], refetch: refetchChatRooms, error: chatRoomsError, isLoading: chatRoomsLoading } = useGetChatRoomsQuery();
  const { data: messages = [], refetch: refetchMessages, error: messagesError, isLoading: messagesLoading } = useGetMessagesQuery(selectedChatRoom?._id, { skip: !selectedChatRoom });

  const [sendMessage] = useSendMessageMutation();
  const [createChatRoom] = useCreateChatRoomMutation();
  const { userInfo } = useSelector((state) => state.auth);


  useEffect(() => {
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit('joinRoom', { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    socket.on('message', (message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
      }
    });
    return () => {
      socket.off('message');
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    if (chatRoomsError) {
      console.error('Failed to fetch chat rooms:', chatRoomsError);
    }
    if (messagesError) {
      console.error('Failed to fetch messages:', messagesError);
    }
  }, [chatRoomsError, messagesError]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage({
        chatRoomId: selectedChatRoom._id,
        content: newMessage,
        senderType: 'User',
      });
      setNewMessage('');
      refetchMessages();
      socket.emit('message', {
        chatRoomId: selectedChatRoom._id,
        content: newMessage,
        senderType: 'User',
      });
    }
  };

  const handleChatRoomSelect = async (hotelId) => {
    let chatRoom = chatRooms.find(room => room.hotelId._id === hotelId);
    if (!chatRoom) {
      chatRoom = await createChatRoom({ hotelId }).unwrap();
      refetchChatRooms();
    }
    setSelectedChatRoom(chatRoom);
  };

  return (
    <div>
      <Container className="profile-container" style={{height:"50vh"}}>
        <Row>
        <Col md={3} className="sidebar-container">
            <Sidebar profileImage={userInfo.profileImage} name={userInfo.name} />
          </Col>
          <Col md={9}>
<div className="chat-screen">
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {chatRoomsLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {chatRooms.map(room => (
              <li
                key={room.hotelId._id}
                className={currentHotelId === room.hotelId._id ? 'active' : ''}
                onClick={() => handleChatRoomSelect(room.hotelId._id)}
              >
                {room.hotelId.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-messages">
        {selectedChatRoom ? (
          <>
            <h3>Chat with {selectedChatRoom.hotelId.name}</h3>
            <div className="messages">
              {messagesLoading ? (
                <p>Loading messages...</p>
              ) : (
                messages
                  .slice()
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) 
                  .map(msg => (
                    <div key={msg._id} className={`message ${msg.senderType === 'User' ? 'sent' : 'received'}`}>
                      {msg.content}
                    </div>
                  ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="new-message">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..." 
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h3>Select a chat room to view messages</h3>
        )}
      </div>
    </div>
    </Col>
    </Row>
</Container>
    </div>
    
  );
};

export default ChatScreen;
