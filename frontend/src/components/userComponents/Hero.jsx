import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import backgroundImage from '../../assets/images/pexels-donaldtong94-189296.jpg';

const Hero = () => {
  return (
    <div className="py-5 hero-section" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh' }}>
      <Container className="d-flex flex-column justify-content-center align-items-center text-white text-center" style={{ height: '100%' }}>
      
          <h1 className="mb-4">Start your unforgettable journey with us.</h1>
          <p className="mb-4">Discover amazing places and exclusive deals for your next stay</p>
          <Button  size="lg" className="custom-button">Book Now</Button>
        
      </Container>
    </div>
  );
};

export default Hero;
