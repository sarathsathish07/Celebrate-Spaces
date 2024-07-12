import React, { useState,useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Container, Row, Col, Card, Button, Collapse } from "react-bootstrap";
import { useGetBookingsQuery } from "../../slices/usersApiSlice.js";
import Loader from "../../components/userComponents/Loader";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import bgImage from "../../assets/images/bgimage.jpg";

const BookingsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: bookings, isLoading,refetch } = useGetBookingsQuery(userInfo._id);
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>My Bookings</h1>
        </div>
      </div>
      <Container className="profile-container">
        <Row>
          <Col md={3} className="sidebar-container">
            <Sidebar profileImage={userInfo.profileImage} name={userInfo.name} />
          </Col>
          <Col md={9}>
            <Card>
              <Card.Header>My Bookings</Card.Header>
              <Card.Body>
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Room</th>
                      <th>Payment Method</th>
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
                          <td>{booking.paymentMethod}</td>
                          <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                          <td>{booking.totalAmount}</td>
                          <td>
                            <Button
                              variant="link"
                              onClick={() => toggleRow(booking._id)}
                            >
                              {expandedRow === booking._id ? "Hide" : "View"} Details
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6">
                            <Collapse in={expandedRow === booking._id}>
                              <div>
                                <Card className="mt-2">
                                  <Card.Body>
                                    <p><strong>Hotel Name:</strong> {booking.hotelId.name}</p>
                                    <p><strong>Room Type:</strong> {booking.roomId.type}</p>
                                    <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                                    <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                    <p><strong>Total Amount:</strong> {booking.totalAmount}</p>
                                    <p><strong>Check-In Date:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                    <p><strong>Check-Out Date:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                    <p><strong>Amenities:</strong> {booking.roomId.amenities.join(", ")}</p>
                                    <p><strong>Description:</strong> {booking.roomId.description}</p>
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
    </div>
  );
};

export default BookingsScreen;
