import React, { useState } from "react";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useUploadHotelCertificateMutation, useGetHotelierProfileQuery } from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import bgImage from "../../assets/images/bgimage.jpg";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";

const HotelVerificationScreen = () => {
  const [certificate, setCertificate] = useState(null);
  const navigate = useNavigate();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const { hotelId } = useParams();
  const { data: profile, isLoading: profileLoading } = useGetHotelierProfileQuery();
  const [uploadHotelCertificate, { isLoading }] = useUploadHotelCertificateMutation();

  const handleCertificateChange = (e) => {
    if (e.target.files.length > 0) {
      setCertificate(e.target.files[0]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!certificate) {
      toast.error("Please upload a certificate");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificate", certificate);

      const response = await uploadHotelCertificate({ hotelId, formData }).unwrap();

      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success("Verification details submitted successfully");
        navigate("/hotelier");
      }
    } catch (error) {
      console.error("Error in API call:", error);
      toast.error("An error occurred while submitting verification details");
    }
  };

  const renderVerificationUI = () => {
    if (profileLoading) {
      return <Loader />;
    }

    return (
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="certificates" className="my-3">
          <Form.Label>Upload Certificate</Form.Label>
          <Form.Control type="file" onChange={handleCertificateChange} />
        </Form.Group>

        {isLoading && <Loader />}

        <Button type="submit" style={{ backgroundColor: "#082b43" }}>
          Submit
        </Button>
      </Form>
    );
  };

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Hotel Verification</h1>
        </div>
      </div>
      <HotelierLayout>
        <Container className="profile-container">
          <Row>
            <Col md={8}>
              <Card className="profile-card">
                <Card.Header className="profile-card-header">
                  Verification Details
                </Card.Header>
                <Card.Body>{renderVerificationUI()}</Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </HotelierLayout>
    </div>
  );
};

export default HotelVerificationScreen;
