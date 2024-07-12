import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import {
  useGetHotelsDataMutation,
  useGetRoomsDataMutation,
} from "../../slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import HotelsSidebar from "../../components/userComponents/HotelsSidebar";
import bgImage from "../../assets/images/bg-1.png";
import Loader from "../../components/userComponents/Loader";
import Footer from "../../components/userComponents/Footer";
import { toast } from "react-toastify";

const HotelsScreen = () => {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [getHotels, { isLoading: isLoadingHotels }] =
    useGetHotelsDataMutation();
  const [getRooms, { isLoading: isLoadingRooms }] = useGetRoomsDataMutation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelsAndRooms = async () => {
      try {
        const hotelResponse = await getHotels().unwrap();
        setHotels(hotelResponse);

        const hotelIds = hotelResponse.map((hotel) => hotel._id);
        const roomResponse = await getRooms(hotelIds).unwrap();
        setRooms(roomResponse);
      } catch (error) {
        toast.error("Error fetching hotels and rooms");
        console.error("Error fetching hotels and rooms:", error);
      }
    };

    fetchHotelsAndRooms();
  }, [getHotels, getRooms]);

  const handleHotelClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  const calculateAveragePrice = (hotelId) => {
    const hotelRooms = rooms.filter((room) => room.hotelId === hotelId);
    if (hotelRooms.length === 0) return 0;
    const total = hotelRooms.reduce((sum, room) => sum + room.price, 0);
    return (total / hotelRooms.length).toFixed(2);
  };

  if (isLoadingHotels || isLoadingRooms)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Find Your Dream Luxury Hotel</h1>
        </div>
      </div>
      <Container>
        <Row>
          <Col md={3}>
            <HotelsSidebar />
          </Col>
          <Col md={9} className="mt-5">
            <Row>
              {hotels.map((hotel) => (
                <Col key={hotel._id} md={4} className="mb-4">
                  <Card
                    className="hotel-card"
                    onClick={() => handleHotelClick(hotel._id)}
                  >
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000/${hotel.images[0].replace(
                        "backend\\public\\",
                        ""
                      )}`}
                      alt={hotel.name}
                      className="hotel-image"
                    />
                    <Card.Body className="hotel-card-body">
                      <Card.Title>{hotel.name}</Card.Title>
                      <Row>
                        <Col>
                          <Card.Text className="mb-0">{hotel.city}</Card.Text>
                          <Card.Text>{hotel.address}</Card.Text>
                        </Col>
                        <Col>
                          <Card.Text className="mb-0">Avg Price</Card.Text>
                          <Card.Text>
                            Rs {calculateAveragePrice(hotel._id)}
                          </Card.Text>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default HotelsScreen;
