import React, { useEffect } from 'react';
import { Button, Container, Card, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useGetHotelsQuery } from '../../slices/hotelierApiSlice.js';
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const RegisteredHotelsScreen = () => {
  const { data: hotels, isLoading, isError } = useGetHotelsQuery();

  const renderHotels = () => {
    return hotels.map((hotel) => (
      <Col key={hotel._id} md={4} className="mb-4">
        <Card className="h-100 shadow hotelscard">
          <Card.Img 
            variant="top" 
            src={hotel.images[0]} 
            alt={hotel.name} 
            style={{ height: '200px', objectFit: 'cover' }} 
          />
          <Card.Body>
            <Card.Title>{hotel.name}</Card.Title>
            <Card.Text><strong>City:</strong> {hotel.city}</Card.Text>
            <Card.Text><strong>Address:</strong> {hotel.address}</Card.Text>
            <Link to={`/hotelier/edit-hotel/${hotel._id}`}>
              <Button className="mt-2" variant="primary">Edit Hotel</Button>
            </Link>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    toast.error('Error fetching hotels');
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <Container className='px-4 w-75'>
        <Row>
          <Col md={10}>
            <h1 className="my-3">Registered Hotels</h1>
          </Col>
          <Col>
            <LinkContainer to="/hotelier/add-hotel">
              <Button className="addhotelbutton my-4">Add Hotel</Button>
            </LinkContainer>
          </Col>
        
        </Row>
        <Row>
          {renderHotels()}
        </Row>
      </Container>
    </HotelierLayout>
  );
};

export default RegisteredHotelsScreen;
