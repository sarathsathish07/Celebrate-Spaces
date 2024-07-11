import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useAddHotelMutation } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import FormContainer from "../../components/userComponents/FormContainer";

const AddHotelScreen = () => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [addHotel] = useAddHotelMutation();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setSelectedImages(e.target.files);
  };

  const validateNameAndCity = (value) => {
    const regex = /^[A-Za-z\s'-]+$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !city ||
      !address ||
      !selectedImages.length ||
      !description ||
      !amenities
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!validateNameAndCity(name)) {
      toast.error("Name cannot contain numbers or special characters");
      return;
    }

    if (!validateNameAndCity(city)) {
      toast.error("City cannot contain numbers or special characters");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("address", address);
      formData.append("description", description);
      formData.append("amenities", amenities);
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append("images", selectedImages[i]);
      }

      await addHotel(formData);
      toast.success("Hotel added successfully");
      navigate("/hotelier/registered-hotels");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <HotelierLayout>
      <FormContainer
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h1 className="my-3">Add Hotel</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter hotel name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="images">
            <Form.Label>Images</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleImageChange}
            />
            <div className="mt-3">
              {selectedImages &&
                Array.from(selectedImages).map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="img-thumbnail"
                    style={{ width: "150px", marginRight: "10px" }}
                  />
                ))}
            </div>
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="amenities">
            <Form.Label>Amenities</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter amenities separated by commas"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="my-3"
            style={{ backgroundColor: "#082b43" }}
          >
            Add Hotel
          </Button>
        </Form>
      </FormContainer>
    </HotelierLayout>
  );
};

export default AddHotelScreen;
