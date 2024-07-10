import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaTachometerAlt, FaUser, FaHotel, FaCheckCircle, FaCalendarCheck, FaEnvelope } from 'react-icons/fa';

const HotelierSidebar = ({ hotelierName }) => {
  return (
    <div className='hotelier-sidebar'>
<Nav className="flex-column ">
      <LinkContainer to="/hotelier/">
        <Nav.Link className='mt-5'>
          <FaTachometerAlt /> Dashboard
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/hotelier/profile">
        <Nav.Link>
          <FaUser /> Profile
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/hotelier/registered-hotels">
        <Nav.Link>
          <FaHotel /> Registered Hotels
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/hotelier/verification">
        <Nav.Link>
          <FaCheckCircle /> Verification
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/hotelier/bookings">
        <Nav.Link>
          <FaCalendarCheck /> Bookings
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/hotelier/messages">
        <Nav.Link>
          <FaEnvelope /> Messages
        </Nav.Link>
      </LinkContainer>
    </Nav>
    </div>
    
  );
};

export default HotelierSidebar;
