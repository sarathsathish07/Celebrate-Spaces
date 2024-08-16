import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { useHotelierLogoutMutation } from '../../slices/hotelierApiSlice';
import { logout } from '../../slices/hotelierAuthSlice';
import { useNavigate } from 'react-router-dom';

const HotelierHeader = () => {
  const isLoginPage = location.pathname === '/hotelier/login';
  const isRegisterPage = location.pathname === '/hotelier/register';

  if (isLoginPage || isRegisterPage) {
    return null;
  }
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useHotelierLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/hotelier/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header>
      <Navbar bg='custom' variant='dark' expand='lg' collapseOnSelect className="hotel-header">
        <Container>
          <LinkContainer to='/hotelier'>
            <Navbar.Brand className="title">Celebrate Spaces</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              {hotelierInfo ? (
                <NavDropdown title={hotelierInfo?.name} id='username'>
                  <LinkContainer to='/hotelier/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to='/hotelier/login'>
                    <Nav.Link>
                      <FaSignOutAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/hotelier/register'>
                    <Nav.Link>
                      <FaSignOutAlt /> Sign Up
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default HotelierHeader;
