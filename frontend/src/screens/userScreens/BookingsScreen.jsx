import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Container, Row, Col, Card, Button, Collapse, Form, Modal } from "react-bootstrap";
import Rating from 'react-rating';
import { useGetBookingsQuery, useAddReviewMutation, useGetReviewsQuery, useCancelBookingMutation } from "../../slices/usersApiSlice.js";
import Loader from "../../components/userComponents/Loader";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import bgImage from "../../assets/images/bgimage.jpg";
import Footer from '../../components/userComponents/Footer';
import 'font-awesome/css/font-awesome.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useGetBookingsQuery();
  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useGetReviewsQuery();

  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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

  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ bookingId: selectedBooking }).unwrap();
      setShowCancelModal(false);
      refetchBookings();
      toast.success('Booking successfully canceled! Money will be added to your wallet.'); 
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking. Please try again.'); 
    }
  };

  const isPastCheckoutDate = (checkOutDate) => {
    const today = new Date();
    return new Date(checkOutDate) < today;
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
                      <th></th>
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
                          <td>Rs {booking.totalAmount}</td>
                          <td>
                            <Button variant="link" onClick={() => toggleRow(booking._id)}>
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
                                    <Row>
                                      <Col md={9}>
                                        <p><strong>Hotel Name:</strong> {booking.hotelId.name}</p>
                                        <p><strong>Room Type:</strong> {booking.roomId.type}</p>
                                        <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                                        <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                        <p><strong>Total Amount:</strong> {booking.totalAmount}</p>
                                        <p><strong>Check-In Date:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                        <p><strong>Check-Out Date:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        <p><strong>Amenities:</strong> {booking.roomId.amenities.join(", ")}</p>
                                        <p><strong>Description:</strong> {booking.roomId.description}</p>
                                      </Col>
                                      <Col>
                                        {booking.bookingStatus !== 'cancelled' && (
                                          <Button
                                            variant="danger"
                                            onClick={() => {
                                              setSelectedBooking(booking._id);
                                              setShowCancelModal(true);
                                            }}
                                            className="float-right"
                                          >
                                            Cancel Booking
                                          </Button>
                                        )}
                                      </Col>
                                    </Row>
                                    {getReviewForBooking(booking._id) ? (
                                      <div>
                                        <p><strong>Rating:</strong> {getReviewForBooking(booking._id).rating}</p>
                                        <p><strong>Review:</strong> {getReviewForBooking(booking._id).review}</p>
                                      </div>
                                    ) : (
                                      booking.bookingStatus !== 'cancelled' && isPastCheckoutDate(booking.checkOutDate) && (
                                        <Form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(booking._id, booking.hotelId._id); }}>
                                          <Form.Group controlId="rating">
                                            <Form.Label style={{ marginRight: "10px" }}><strong>Rating</strong></Form.Label>
                                            <Rating
                                              initialRating={rating}
                                              emptySymbol={<i className="fa fa-star-o fa-2x" style={{ color: 'gold' }}></i>}
                                              fullSymbol={<i className="fa fa-star fa-2x" style={{ color: 'gold' }}></i>}
                                              fractions={2}
                                              onChange={(rate) => setRating(rate)}
                                            />
                                          </Form.Group>
                                          <Form.Group controlId="review">
                                            <Form.Label><strong>Review</strong></Form.Label>
                                            <Form.Control
                                              as="textarea"
                                              rows={3}
                                              value={review}
                                              onChange={(e) => setReview(e.target.value)}
                                            />
                                          </Form.Group>
                                          <Button variant="primary" type="submit" disabled={isAddingReview}>
                                            {isAddingReview ? 'Submitting...' : 'Submit Review'}
                                          </Button>
                                        </Form>
                                      )
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
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this booking? The refund amount will be added to your wallet.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            Confirm Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingsScreen;
