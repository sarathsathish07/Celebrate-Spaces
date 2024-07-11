import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useGetHotelByIdQuery, useUpdateHotelMutation } from "../../slices/hotelierApiSlice";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import { toast } from "react-toastify";

const EditHotelScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hotel, isLoading, isError, refetch } = useGetHotelByIdQuery(id);
  const [updateHotel] = useUpdateHotelMutation();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    amenities: "",
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        description: hotel.description,
        amenities: hotel.amenities.join(", "),
        images: hotel.images || [],
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

  const handleImageChange = (e) => {
    setSelectedImages(e.target.files);
  };

  const handleRemoveImage = (index) => {
    setImagesToDelete((prev) => [...prev, formData.images[index]]);
    setFormData((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.name || !formData.city || !formData.address || !formData.description || !formData.amenities) {
      toast.error("All fields are required");
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("amenities", formData.amenities);
  
      imagesToDelete.forEach((image) => {
        formDataToSend.append("removeImages", image);
      });
  
      for (let i = 0; i < selectedImages.length; i++) {
        formDataToSend.append("images", selectedImages[i]);
      }
  
      await updateHotel({ id, formData: formDataToSend }).unwrap();
      refetch();
      toast.success("Hotel updated successfully");
      navigate("/hotelier/registered-hotels");
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Error updating hotel");
    }
  };
  

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    toast.error("Error fetching hotel details");
    return <div>Error</div>;
  }

  return (
    <HotelierLayout>
      <Container className="px-4 w-75" style={{ maxHeight: "100vh", overflowY: "auto" }}>
        <h1 className="my-3">Edit Hotel</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="city" className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="amenities" className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <Form.Control type="text" name="amenities" value={formData.amenities} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="images" className="mb-3">
            <Form.Label>Images</Form.Label>
            <Row>
              {formData.images.map((image, index) => (
                <Col key={index} md={3} className="mb-3 position-relative">
                  <Card style={{ width: "100%", height: "100%" }}>
                    {typeof image === 'string' && (
                      <Card.Img
                        variant="top"
                        src={`http://localhost:5000/${image.replace("backend\\public\\", "")}`}
                        alt={`Hotel Image ${index}`}
                        style={{ height: "150px", objectFit: "cover" }}
                      />
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
            <Form.Control type="file" name="images" onChange={handleImageChange} multiple />
          </Form.Group>
          <Button type="submit" className="mb-3">Update Hotel</Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default EditHotelScreen;
