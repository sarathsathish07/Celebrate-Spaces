import React, { useEffect } from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { useGetHotelByIdQuery } from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";

const HotelDetailScreen = () => {
  const { id } = useParams();
  const { data: hotel, isLoading, isError, refetch } = useGetHotelByIdQuery(id);

  useEffect(() => {
    refetch();
  }, [id, refetch]);

  if (isLoading) return <Loader />;
  if (isError) {
    toast.error("Error fetching hotel details");
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <Container className="px-4">
        <Row className="my-5 mx-5">
          <Col md={10}>
            <Card className="mb-3">
            <h1>{hotel.name}</h1>
              {hotel.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000/${hotel.images[0].replace(
                    "backend\\public\\",
                    ""
                  )}`}
                  alt={hotel.name}
                  style={{ height: "400px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Text>
                  <strong>City:</strong> {hotel.city}
                </Card.Text>
                <Card.Text>
                  <strong>Address:</strong> {hotel.address}
                </Card.Text>
                <Card.Text>
                  <strong>Description:</strong> {hotel.description}
                </Card.Text>
                <Card.Text>
                  <strong>Amenities:</strong> {hotel.amenities.join(", ")}
                </Card.Text>
              </Card.Body>
            <div style={{display:'flex',flexDirection:'row'}}>
            <Link to={`/hotelier/edit-hotel/${hotel._id}`}>
              <Button variant="primary">Edit Hotel</Button>
            </Link>
            <Link to={`/hotelier/add-room/${hotel._id}`}>
              <Button variant="success" className="ms-2">Add Room</Button>
            </Link>
            </div>
            </Card>
          </Col>
        </Row>
        <Row className="mx-5">
        <h2>Rooms</h2>
          {hotel.rooms.map((room) => (
            <Col key={room._id} md={4} className="mb-4">
              <Card className="h-100 shadow roomsCard">
                <Card.Body>
                  <Card.Title>{room.type}</Card.Title>
                  <Card.Text>
                    <strong>Price:</strong> Rs {room.price}
                  </Card.Text>
                  <Card.Text>
                    <strong>Description:</strong> {room.description}
                  </Card.Text>
                  <Link to={`/hotelier/edit-room/${room._id}`}>
                    <Button variant="info">Edit Room</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </HotelierLayout>
  );
};

export default HotelDetailScreen;
