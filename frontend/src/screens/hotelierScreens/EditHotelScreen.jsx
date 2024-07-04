import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetHotelByIdQuery, useUpdateHotelMutation } from '../../slices/hotelierApiSlice';
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout';
import { toast } from 'react-toastify';

const EditHotelScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hotel, isLoading, isError } = useGetHotelByIdQuery(id);
  const [updateHotel] = useUpdateHotelMutation();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    amenities: '',
    images: [],
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        description: hotel.description,
        amenities: hotel.amenities.join(', '),
        images: hotel.images || [], // Set images from hotel data or empty array
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    const imagesArray = await Promise.all(
      files.map(async (file) => {
        const base64 = await convertToBase64(file);
        return base64;
      })
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imagesArray],
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateHotel({ id, ...formData }).unwrap();
      toast.success('Hotel updated successfully');
      navigate('/hotelier/registered-hotels');
    } catch (error) {
      toast.error(error?.data?.message || error?.error || 'Error updating hotel');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    toast.error('Error fetching hotel details');
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <Container className='px-4 w-75'>
        <h1 className="my-3">Edit Hotel</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="city" className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="amenities" className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <Form.Control
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="images" className="mb-3">
            <Form.Label>Images</Form.Label>
            <Row>
              {formData.images.map((image, index) => (
                <Col key={index} md={3} className="mb-3">
                  <Card style={{ width: '100%', height: '100%' }}>
                    <Card.Img
                      variant="top"
                      src={image}
                      alt={`Hotel Image ${index}`}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <Form.Control
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
            />
          </Form.Group>
          <Button type="submit">Update Hotel</Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default EditHotelScreen;
