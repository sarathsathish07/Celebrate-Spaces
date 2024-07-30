import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, ListGroup, Card, Form, Button } from "react-bootstrap";
import { useGetHotelChatRoomsQuery, useGetHotelMessagesQuery, useSendHotelMessageMutation } from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import Loader from "../../components/userComponents/Loader";
import io from "socket.io-client";

const socket = io('http://localhost:5000');

const HotelierChatScreen = () => {
  const { hotelId } = useParams();
  const { data: chatRooms, isLoading: isLoadingChatRooms, isError: isErrorChatRooms } = useGetHotelChatRoomsQuery(hotelId);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: messages, isLoading: isLoadingMessages, isError: isErrorMessages, refetch: refetchMessages } = useGetHotelMessagesQuery(selectedChatRoom?._id, { skip: !selectedChatRoom });
  const [sendMessage] = useSendHotelMessageMutation();

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

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChatRoom) {
      await sendMessage({
        chatRoomId: selectedChatRoom._id,
        content: newMessage,
        senderType: 'Hotel',
        hotelId,
      });
      setNewMessage('');
    }
  };

  useEffect(() => {
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit('joinRoom', { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoadingChatRooms) return <Loader />;
  if (isErrorChatRooms) return <div>Error loading chat rooms</div>;

  return (
    <HotelierLayout>
      <Container fluid className="px-4">
        <Row className="my-5">
          <Col md={4}>
            <h3>Chats</h3>
            <ListGroup>
              {chatRooms && chatRooms.map(chatRoom => (
                <ListGroup.Item
                  key={chatRoom._id}
                  active={selectedChatRoom && selectedChatRoom._id === chatRoom._id}
                  onClick={() => setSelectedChatRoom(chatRoom)}
                  className={selectedChatRoom && selectedChatRoom._id === chatRoom._id ? 'active-chat-room' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  {chatRoom.userId.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          
          <Col md={8} >
            <Card >
              <Card.Header>Chat</Card.Header>
              <Card.Body>
                {selectedChatRoom ? (
                  <>
                    {isLoadingMessages ? (
                      <Loader />
                    ) : isErrorMessages ? (
                      <div>Error loading messages</div>
                    ) : (
                      <div className="messages">
                        {messages
                          .slice() 
                          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                          .map(message => (
                            <div
                              key={message._id}
                              className={`message ${message.senderType === 'Hotel' ? 'hotel-message' : 'user-message'}`}
                            >
                              {message.content}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                    <Form>
                      <Form.Group controlId="messageInput">
                        <Form.Control
                          type="text"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={handleSendMessage} className="mt-2">
                        Send
                      </Button>
                    </Form>
                  </>
                ) : (
                  <div>Select a user to start chatting</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </HotelierLayout>
  );
};

export default HotelierChatScreen;
