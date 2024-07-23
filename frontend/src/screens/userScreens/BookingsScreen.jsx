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
  const [showRefundPolicyModal, setShowRefundPolicyModal] = useState(false);

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

  // const calculateRefundPercentage = (checkInDate) => {
  //   const today = new Date();
  //   const checkIn = new Date(checkInDate);
  //   const diffDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

  //   if (diffDays > 2) {
  //     return 100;
  //   } else if (diffDays > 1) {
  //     return 50;
  //   } else {
  //     return 0;
  //   }
  // };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking({ bookingId: selectedBooking }).unwrap();
      setShowCancelModal(false);
      refetchBookings();
      toast.success('Booking successfully canceled!'); 
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
  const sortedBookings = [...bookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));


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
                    {sortedBookings.map((booking) => (
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
                                        <p><strong>Hotel:</strong> {booking.hotelId.name}</p>
                                        <p><strong>Room:</strong> {booking.roomId.type}</p>
                                        <p><strong>Check-in Date:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                        <p><strong>Check-out Date:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                        <p><strong>Total Amount:</strong> Rs {booking.totalAmount}</p>
                                        <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                                        <p><strong>Status:</strong> {booking.bookingStatus}</p>
                                      </Col>
                                      <Col>
                                        {booking.bookingStatus === 'confirmed' && !isPastCheckoutDate(booking.checkOutDate) && (
                                          <Button
                                            variant="danger"
                                            onClick={() => {
                                              setSelectedBooking(booking._id);
                                              setShowCancelModal(true);
                                            }}
                                            className="me-2"
                                          >
                                            Cancel Booking
                                          </Button>
                                        )}
                                      
                                      </Col>
                                    </Row>
                                    {getReviewForBooking(booking._id) ? (
                                      <>
                                        <h5 className="mt-4">Review</h5>
                                        <p><strong>Rating:</strong> <Rating initialRating={getReviewForBooking(booking._id).rating} readonly emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" /></p>
                                        <p><strong>Review:</strong> {getReviewForBooking(booking._id).review}</p>
                                      </>
                                    ) : (
                                      <>
                                        {booking.bookingStatus === 'confirmed' && isPastCheckoutDate(booking.checkOutDate) && (
                                          <>
                                            <h5 className="mt-4">Add Review</h5>
                                            <Form>
                                              <Form.Group controlId="rating">
                                                <Form.Label style={{ marginRight: "10px" }}><strong>Rating</strong></Form.Label>
                                                <Rating
                                                  initialRating={rating}
                                                  emptySymbol="fa fa-star-o fa-2x"
                                                  fullSymbol="fa fa-star fa-2x"
                                                  onChange={(value) => setRating(value)}
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
                                              <Button
                                                variant="primary"
                                                onClick={() => handleReviewSubmit(booking._id, booking.hotelId._id)}
                                                disabled={isAddingReview}
                                              >
                                                {isAddingReview ? 'Submitting...' : 'Submit Review'}
                                              </Button>
                                            </Form>
                                          </>
                                        )}
                                      </>
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
                  <Button variant="link" onClick={() => setShowRefundPolicyModal(true)}>
                                          View Refund Policy
                                        </Button>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            Confirm Cancellation
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRefundPolicyModal} onHide={() => setShowRefundPolicyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Refund Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Our refund policy is as follows:</p>
          <ul>
            <li>100% refund if canceled at least 2 days prior to the check-in date.</li>
            <li>50% refund if canceled at least 1 day prior to the check-in date.</li>
            <li>No refund if canceled less than 1 day prior to the check-in date.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRefundPolicyModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>
  );
};

export default BookingsScreen;
