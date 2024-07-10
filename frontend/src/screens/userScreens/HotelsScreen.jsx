import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { useGetHotelsDataMutation } from "../../slices/usersApiSlice";
import HotelsSidebar from "../../components/userComponents/HotelsSidebar";
import bgImage from "../../assets/images/bg-1.png";
import Loader from "../../components/userComponents/Loader";
import { toast } from "react-toastify";

const HotelsScreen = () => {
  const [hotels, setHotels] = useState([]);
  const [getHotels, { isLoading, isError }] = useGetHotelsDataMutation();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await getHotels().unwrap();
        setHotels(response);
      } catch (error) {
        toast.error("Error fetching hotels");
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, [getHotels]);

  if (isLoading) return <div><Loader/></div>;
  if (isError) return <div>Error fetching hotels</div>;

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
                  <Card className="hotel-card">
                    <Card.Img
                      variant="top"
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="hotel-image"
                    />
                    <Card.Body className="hotel-card-body">
                      <Card.Title>{hotel.name}</Card.Title>
                      <Card.Text className="mb-0">{hotel.city}</Card.Text>
                      <Card.Text>{hotel.address}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HotelsScreen;
