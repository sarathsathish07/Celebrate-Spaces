import React from 'react';
import { Image, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import defaultProfileImage from '../../assets/images/5856.jpg';

const Sidebar = ({ profileImage, name }) => {
  const getImageUrl = (imageName) => {
    if (!imageName) return defaultProfileImage;
    return `http://localhost:5000/UserProfileImages/${imageName.replace(
      'backend\\public\\',
      ''
    )}`;
  };

  return (
    <div className="sidebarprofile">
      <Image
        src={
          profileImage
            ? typeof profileImage === 'string'
              ? getImageUrl(profileImage)
              : URL.createObjectURL(profileImage)
            : defaultProfileImage
        }
        className="sidebar-image"
        alt={name}
      />
      <Nav className="flex-column">
        <LinkContainer to="/profile">
          <Nav.Link className='sidebar-link'>My Profile</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/bookings">
          <Nav.Link className='sidebar-link'>Bookings</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/wallet">
          <Nav.Link className='sidebar-link'>Wallet</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/chat/:hotelId">
          <Nav.Link className='sidebar-link'>Messages</Nav.Link>
        </LinkContainer>
      </Nav>
    </div>
  );
};

export default Sidebar;
