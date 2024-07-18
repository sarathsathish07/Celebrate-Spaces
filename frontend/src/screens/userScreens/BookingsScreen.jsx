import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Container, Row, Col, Card, Button, Collapse, Form } from "react-bootstrap";
import Rating from 'react-rating';
import { useGetBookingsQuery, useAddReviewMutation, useGetReviewsQuery } from "../../slices/usersApiSlice.js";
import Loader from "../../components/userComponents/Loader";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import bgImage from "../../assets/images/bgimage.jpg";
import Footer from '../../components/userComponents/Footer';
import 'font-awesome/css/font-awesome.min.css';

const BookingsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookingsQuery();
  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useGetReviewsQuery();

  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const toggleRow = (bookingId) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  useEffect(() => {
    refetchBookings();
    refetchReviews();
  }, [refetchBookings, refetchReviews]);

  const getReviewForBooking = (bookingId) => {
    return reviews.find((review) => review.bookingId === bookingId);
  };

  const handleReviewSubmit = async (bookingId, hotelId) => {
    try {
      const result = await addReview({ rating, review, bookingId, hotelId }).unwrap();
      setRating(0);
      setReview('');
      refetchReviews();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (bookingsLoading || reviewsLoading) return <Loader />;

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

                                    {getReviewForBooking(booking._id) ? (
                                      <div>
                                        <p><strong>Rating:</strong> {getReviewForBooking(booking._id).rating}</p>
                                        <p><strong>Review:</strong> {getReviewForBooking(booking._id).review}</p>
                                      </div>
                                    ) : (
                                      <Form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(booking._id, booking.hotelId._id); }}>
                                        <Form.Group controlId="rating">
                                          <Form.Label style={{marginRight:"10px"}}><strong>Rating</strong></Form.Label>
                                          <Rating
                                            initialRating={rating}
                                            emptySymbol="fa fa-star-o fa-2x"
                                            fullSymbol="fa fa-star fa-2x"
                                            fractions={2}
                                            onChange={(rate) => setRating(rate)}
                                          />
                                        </Form.Group>
                                        <Form.Group controlId="review" style={{marginBottom:"10px"}}>
                                          <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                            placeholder="Comment your review"
                                            required
                                          />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled={isAddingReview}>
                                          Submit Review
                                        </Button>
                                      </Form>
                                    )}
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
      <Footer />
    </div>
  );
};

export default BookingsScreen;
