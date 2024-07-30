import React, { useEffect } from "react";
import { Button, Container, Card, Row, Col } from "react-bootstrap";
import { useGetHotelsQuery } from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const RegisteredHotelsScreen = () => {
  const { data: hotels, isLoading, isError, refetch } = useGetHotelsQuery();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);

  useEffect(() => {
    if (hotelierInfo) {
      refetch();
    }
  }, [hotelierInfo, refetch]);

  const renderHotels = () => {
    return hotels?.map((hotel) => (
      <Col key={hotel._id} md={4} className="mb-4">
        <Card className="h-100 shadow hotelscard">
          {hotel.images.length > 0 && (
            <Card.Img
              variant="top"
              src={`http://localhost:5000/${hotel.images[0].replace(
                "backend\\public\\",
                ""
              )}`}
              alt={hotel.name}
              style={{ height: "200px", objectFit: "cover" }}
            />
          )}
          <Card.Body>
            <Card.Title>{hotel.name}</Card.Title>
            <Card.Text>
              <strong>City:</strong> {hotel.city}
            </Card.Text>
            <Card.Text>
              <strong>Address:</strong> {hotel.address}
            </Card.Text>
            {hotel.verificationStatus !== "accepted" && (
              <Link to={`/hotelier/verify-hotel/${hotel._id}`}>
                <Button className="mt-2">Verify</Button><br/>
              </Link>
            )}
            <Link to={`/hotelier/hotel-details/${hotel._id}`}>
              <Button className="mt-2">View Details</Button>
            </Link>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    toast.error("Error fetching hotels");
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
      <Container className="px-4 w-75">
        <Row>
          <Col md={10}>
            <h1 className="my-3">Registered Hotels</h1>
          </Col>
          <Col>
            <Link to="/hotelier/add-hotel">
              <Button className="addhotelbutton my-4">Add Hotel</Button>
            </Link>
          </Col>
        </Row>
        <Row>{renderHotels()}</Row>
      </Container>
      </div>
    </HotelierLayout>
  );
};

export default RegisteredHotelsScreen;
