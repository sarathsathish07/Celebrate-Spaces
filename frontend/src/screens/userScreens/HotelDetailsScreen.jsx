import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Nav, Tab, Card, Button, Modal, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetHotelByIdQuery } from '../../slices/usersApiSlice';
import Loader from '../../components/userComponents/Loader';
import Footer from '../../components/userComponents/Footer';
import { toast } from 'react-toastify';

const HotelDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: hotel, error, isLoading } = useGetHotelByIdQuery(id);
  const [activeKey, setActiveKey] = useState('description');
  const mainImageRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [roomCount, setRoomCount] = useState(1);

  const baseURL = 'http://localhost:5000/';

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

  const handleBooking = () => {
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

    const queryParams = {
      hotelId: id,
      room: selectedRoom,
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      roomCount: roomCount
    };
    const queryString = new URLSearchParams(queryParams).toString();
    navigate(`/booking?${queryString}`);
  };

  if (isLoading) return <Loader />;
  if (error) {
    toast.error(error?.data?.message || 'Error fetching hotel details');
    return <div>Error fetching hotel details</div>;
  }

  return (
    <div>
      <Container className="hotel-details-content">
        <Row className="mb-3">
          <Col md={8}>
            <Image
              ref={mainImageRef}
              src={`${baseURL}${hotel?.images[0].replace(
                "backend\\public\\",
                ""
              )}`}
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
                    src={`${baseURL}${image.replace(
                      "backend\\public\\",
                      ""
                    )}`}
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
              <Tab.Content>
                <Tab.Pane eventKey="description">
                  <p>{hotel?.description}</p>
                  <h5>Top Facilities</h5>
                  <ul>
                    {hotel?.amenities?.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                </Tab.Pane>
                <Tab.Pane eventKey="rooms">
                  <Row>
                    {hotel?.rooms?.map((room) => (
                      <Col key={room._id} md={4}>
                        <Card className="hotel-card room-card">
                          <Card.Img 
                            variant="top" 
                            src={`${baseURL}${room.images[0].replace("backend\\public\\", "")}`} 
                            alt={room.type} 
                            className="room-image" 
                          />
                          <Card.Body className="room-card-body">
                            <Card.Title>{room.type}</Card.Title>
                            <Card.Text>
                              <strong>Price:</strong> Rs {room.price}<br />
                              <strong>Area:</strong> {room.area} sq.ft<br />
                              <strong>Occupancy:</strong> {room.occupancy}<br />
                              <strong>Amenities:</strong> {room.amenities.join(', ')}
                            </Card.Text>
                            <Button variant="primary" onClick={() => handleBookNow(room._id)}>Book Now</Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="reviews">
                  {/* Add review section here */}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>

        <Modal show={showModal} onHide={handleCloseModal} className="modal-custom">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Book Room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="checkInDate" className='modal-group'>
                <Form.Label className='modal-label'>Check-In Date</Form.Label>
                <DatePicker 
                  selected={checkInDate} 
                  onChange={(date) => setCheckInDate(date)} 
                  className="form-control datepicker"
                  minDate={new Date()}
                />
              </Form.Group>
              <Form.Group controlId="checkOutDate" className='modal-group'>
                <Form.Label className='modal-label'>Check-Out Date</Form.Label>
                <DatePicker 
                  selected={checkOutDate} 
                  onChange={(date) => setCheckOutDate(date)} 
                  className="form-control datepicker"
                  minDate={checkInDate}
                />
              </Form.Group>
              <Form.Group controlId="roomCount" className="form-group-inline">
                <Form.Label className='modal-label'>Rooms</Form.Label>
                <Form.Control 
                  type="number" 
                  value={roomCount} 
                  onChange={(e) => setRoomCount(e.target.value)} 
                  min="1"
                  className="form-room"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
            <Button variant="primary" onClick={handleBooking}>Book</Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <Footer/>
    </div>
  );
};

export default HotelDetailsScreen;
