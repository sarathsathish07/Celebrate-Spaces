import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { useSendNotificationMutation } from '../../slices/adminApiSlice';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/adminComponents/AdminLayout';

const AdminCommunicationScreen = () => {
  const [message, setMessage] = useState('');
  const [sendNotification] = useSendNotificationMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      await sendNotification({ message }).unwrap();
      toast.success('Notification sent successfully');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  return (
    <AdminLayout>
      <Container>
        <Card className="my-4">
          <Card.Header>Send Notification</Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="message">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the notification message"
                />
              </Form.Group>
              <Button type="submit" className="mt-3">
                Send Notification
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default AdminCommunicationScreen;
