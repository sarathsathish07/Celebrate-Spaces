import React from "react";
import { useSelector } from "react-redux";
import { Table, Container, Row, Col, Card } from "react-bootstrap";
import { useGetBookingsQuery } from "../../slices/usersApiSlice.js";
import Loader from "../../components/userComponents/Loader";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import bgImage from "../../assets/images/bgimage.jpg";


const BookingsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: bookings, isLoading } = useGetBookingsQuery(userInfo._id);

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
              <Table  responsive className="table-sm">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Room</th>
                    <th>Payment Method</th>
                    <th>Booking Date</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.hotelId.name}</td>
                      <td>{booking.roomId.type}</td>
                      <td>{booking.paymentMethod}</td>
                      <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td>{booking.totalAmount}</td>
                    </tr>
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
