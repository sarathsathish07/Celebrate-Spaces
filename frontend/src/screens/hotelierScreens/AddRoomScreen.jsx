import React, { useState } from "react";
import { Button, Form, Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAddRoomMutation } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";

const AddRoomScreen = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [addRoom] = useAddRoomMutation();
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    price: "",
    area: "",
    occupancy: "",
    noOfRooms: "",
    description: "",
    amenities: "",
  });

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
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.price ||
      !formData.area ||
      !formData.occupancy ||
      !formData.noOfRooms ||
      !selectedImages.length ||
      !formData.description ||
      !formData.amenities
    ) {
      toast.error("All fields are required");
      return;
    }

    
    try {
      const formDataObj = new FormData();
      formDataObj.append("type", formData.type);
      formDataObj.append("price", formData.price);
      formDataObj.append("area", formData.area);
      formDataObj.append("occupancy", formData.occupancy);
      formDataObj.append("noOfRooms", formData.noOfRooms);
      formDataObj.append("description", formData.description);
      formDataObj.append("amenities", formData.amenities);
      for (let i = 0; i < selectedImages.length; i++) {
        formDataObj.append("images", selectedImages[i]);
      }

      await addRoom({ hotelId, formData: formDataObj }).unwrap();
      toast.success("Room added successfully");
      navigate(`/hotelier/registered-hotels`);
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Error adding room");
    }
  };

  return (
    <HotelierLayout>
      <Container className="px-4 w-75">
        <h1 className="my-3">Add Room</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="type" className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control type="text" name="type" value={formData.type} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="price" className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="area" className="mb-3">
            <Form.Label>Area</Form.Label>
            <Form.Control type="number" name="area" value={formData.area} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="occupancy" className="mb-3">
            <Form.Label>Occupancy</Form.Label>
            <Form.Control type="number" name="occupancy" value={formData.occupancy} onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="noOfRooms" className="mb-3">
            <Form.Label>Number of Rooms</Form.Label>
            <Form.Control type="number" name="noOfRooms" value={formData.noOfRooms} onChange={handleChange} required />
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
            <Form.Control type="file" name="images" onChange={handleImageChange} multiple />
            <div className="mt-3">
              {selectedImages &&
                Array.from(selectedImages).map((image, index) => (
                  <div key={index} style={{ position: "relative", display: "inline-block", marginRight: "10px" }}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Selected ${index}`}
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
            </div>
          </Form.Group>
          <Button type="submit" variant="primary">
            Add Room
          </Button>
        </Form>
      </Container>
    </HotelierLayout>
  );
};

export default AddRoomScreen;
