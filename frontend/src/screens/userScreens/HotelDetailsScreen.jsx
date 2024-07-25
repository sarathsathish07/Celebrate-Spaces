import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Nav, Tab, Card, Button, Modal, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetHotelByIdQuery, useCheckRoomAvailabilityMutation, useSaveBookingMutation, useGetReviewsByHotelIdQuery } from '../../slices/usersApiSlice';
import Loader from '../../components/userComponents/Loader';
import Footer from '../../components/userComponents/Footer';
import { toast } from 'react-toastify';
import Rating from 'react-rating';
import 'font-awesome/css/font-awesome.min.css';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const HotelDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeKey, setActiveKey] = useState('description');
  const { data: hotel, error, isLoading, refetch } = useGetHotelByIdQuery(id);
  const { data: reviews, isLoading: isLoadingReviews, refetch: refetchReviews } = useGetReviewsByHotelIdQuery(id, {
    skip: activeKey !== 'reviews',
  });
  const [checkRoomAvailability] = useCheckRoomAvailabilityMutation();
  const [saveBooking] = useSaveBookingMutation();
  const mainImageRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [roomCount, setRoomCount] = useState(1);

  const baseURL = 'http://localhost:5000/';
  useEffect(() => {
    refetch();
    if (activeKey === 'reviews') {
      refetchReviews();
    }
  }, [refetch, activeKey, refetchReviews]);

  const handleBookNow = (roomId) => {
    setSelectedRoom(roomId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setRoomCount(1);
  };

  const handleBooking = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      const availabilityResponse = await checkRoomAvailability({
        roomId: selectedRoom,
        checkInDate,
        checkOutDate,
        roomCount,
      }).unwrap();

      if (!availabilityResponse.isAvailable) {
        toast.error('Room is not available for the selected dates');
        return;
      }

      const queryParams = {
        hotelId: id,
        room: selectedRoom,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        roomCount: roomCount,
      };
      const queryString = new URLSearchParams(queryParams).toString();
      navigate(`/booking?${queryString}`);
    } catch (error) {
      toast.error('Error checking room availability');
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const mapCenter = {
    lat: hotel?.latitude || 0,
    lng: hotel?.longitude || 0,
  };

  if (isLoading) return <Loader />;
  if (error) {
    toast.error(error?.data?.message || 'Error fetching hotel details');
    return <div>Error fetching hotel details</div>;
  }

  return (
    <div>
      <Container className="hotel-details-content mb-5">
        <Row className="mb-3">
          <Col md={8}>
            <Image
              ref={mainImageRef}
              src={`${baseURL}${hotel?.images[0].replace("backend\\public\\", "")}`}
              alt="Hotel Main Image"
              fluid
              className="hotel-details-main-image"
            />
          </Col>
          <Col md={4}>
            <div className="side-images-container">
              {hotel?.images?.slice(1).map((image, index) => (
                <div className="side-image-wrapper" key={index}>
                  <Image
                    src={`${baseURL}${image.replace("backend\\public\\", "")}`}
                    alt={`Hotel Image ${index + 2}`}
                    fluid
                    className="hotel-details-side-image"
                  />
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>{hotel?.name}</h1>
            <p>{hotel?.city}, {hotel?.address}</p>
            <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="description">Description</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="rooms">Rooms</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="mt-3">
                <Tab.Pane eventKey="description">
                  <p>{hotel?.description}</p>
                  <h4>Amenities</h4>
                  <ul>
                    {hotel?.amenities?.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                  <h4>Location</h4>
                  <LoadScript googleMapsApiKey="AIzaSyDfWY6h4Y7JrizQHDZcfsds0NSLcvC1bVM">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={18}
                    >
                      <Marker position={mapCenter} />
                    </GoogleMap>
                  </LoadScript>
                </Tab.Pane>
                <Tab.Pane eventKey="rooms">
                  <Row>
                    {hotel?.rooms?.map((room) => (
                      <Col md={4} key={room._id} className="mb-3">
                        <Card>
                          <Card.Img
                            variant="top"
                            src={`${baseURL}${room.images[0].replace("backend\\public\\", "")}`}
                            alt="Room Image"
                            className="hotel-details-room-image"
                          />
                          <Card.Body>
                            <Card.Title>{room.type}</Card.Title>
                            <Card.Text>
                              {room.description}
                              <br />
                              <strong>Price:</strong> ${room.price}/night
                            </Card.Text>
                            <Button onClick={() => handleBookNow(room._id)}>
                              Book Now
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="reviews">
                  <h4>Reviews</h4>
                  {isLoadingReviews ? (
                    <Loader />
                  ) : reviews?.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={index} className="review">
                        <Rating
                          emptySymbol="fa fa-star-o fa-2x"
                          fullSymbol="fa fa-star fa-2x"
                          fractions={2}
                          initialRating={review.rating}
                          readonly
                        />
                        <p>{review.comment}</p>
                        <p>
                          <strong>By:</strong> {review.user?.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No reviews available</p>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
      <Footer />
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Book Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="checkInDate">
              <Form.Label>Check-in Date</Form.Label>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Form.Group>
            <Form.Group controlId="checkOutDate">
              <Form.Label>Check-out Date</Form.Label>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                minDate={checkInDate}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Form.Group>
            <Form.Group controlId="roomCount">
              <Form.Label>Number of Rooms</Form.Label>
              <Form.Control
                type="number"
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
                min={1}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBooking}>
            Book Now
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HotelDetailsScreen;
