import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useGetHotelsDataMutation } from "../../slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import HotelsSidebar from "../../components/userComponents/HotelsSidebar";
import bgImage from "../../assets/images/bg-1.png";
import Loader from "../../components/userComponents/Loader";
import Footer from "../../components/userComponents/Footer";
import { toast } from "react-toastify";

const HotelsScreen = () => {
  const [hotels, setHotels] = useState([]);
  const [getHotels, { isLoading, isError }] = useGetHotelsDataMutation();
  const navigate = useNavigate();

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

  const handleHotelClick = (id) => {
    navigate(`/hotels/${id}`);
  };

  if (isLoading) return <div><Loader /></div>;
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
                  <Card className="hotel-card" onClick={() => handleHotelClick(hotel._id)}>
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
      <Footer/>
    </div>
  );
};

export default HotelsScreen;
