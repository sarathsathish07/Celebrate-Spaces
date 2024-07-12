import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Container, Row, Col, Card, Button, Collapse } from 'react-bootstrap';
import { useGetHotelierBookingsQuery } from '../../slices/hotelierApiSlice';
import Loader from '../../components/userComponents/Loader';
import Sidebar from '../../components/hotelierComponents/HotelierSidebar';
import { FaChevronDown } from 'react-icons/fa';

const HotelierBookingsScreen = () => {
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const { data: bookings, isLoading, refetch } = useGetHotelierBookingsQuery(hotelierInfo._id);
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <Loader />;

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
          <Sidebar hotelierName={hotelierInfo.name} />
        </Col>
        <Col md={9}>
          <Card className="mt-5">
            <Card.Header>Bookings</Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Room</th>
                    <th>Guest Name</th>
                    <th>Booking Date</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <tr>
                        <td>{booking.hotelId.name}</td>
                        <td>{booking.roomId.type}</td>
                        <td>{booking.userId.name}</td>
                        <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                        <td>{booking.totalAmount}</td>
                        <td>
                          <Button variant="link" onClick={() => toggleRow(booking._id)}>
                            {expandedRow === booking._id ? 'Hide Details' : 'View Details'}{' '}
                            <FaChevronDown />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="8">
                          <Collapse in={expandedRow === booking._id}>
                            <div>
                              <Card className="mt-2">
                                <Card.Body>
                                  <p><strong>Guest Name:</strong> {booking.userId.name}</p>
                                  <p><strong>Email:</strong> {booking.userId.email}</p>
                                  <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                                  <p><strong>Check-In:</strong>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                  <p><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                </Card.Body>
                              </Card>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelierBookingsScreen;
