import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Image,
  Nav,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useUploadVerificationDetailsMutation,
  useGetHotelierProfileQuery,
} from "../../slices/hotelierApiSlice";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import { FaCheckCircle, FaTimesCircle, FaHourglass } from "react-icons/fa";
import bgImage from "../../assets/images/bgimage.jpg";
import defaultProfileImage from "../../assets/images/5856.jpg";
import { LinkContainer } from "react-router-bootstrap";

const HotelierVerificationScreen = () => {
  const [certificate, setCertificate] = useState(null);
  const navigate = useNavigate();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const {
    data: profile,
    isLoading: profileLoading,
    refetch,
  } = useGetHotelierProfileQuery();
  const [uploadVerificationDetails, { isLoading }] =
    useUploadVerificationDetailsMutation();

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
      formData.append("hotelierId", hotelierInfo._id);

      const response = await uploadVerificationDetails(formData).unwrap();

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

  const getImageUrl = (imageName) => {
    if (!imageName) return defaultProfileImage;
    return `http://localhost:5000/UserProfileImages/${imageName.replace(
      "backend\\public\\",
      ""
    )}`;
  };

  const renderVerificationUI = () => {
    if (profileLoading) {
      return <Loader />;
    }

    if (!profile || profile.verificationStatus === null) {
      return (
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="certificates" className="my-3">
            <Form.Label>Upload Certificates</Form.Label>
            <Form.Control type="file" onChange={handleCertificateChange} />
          </Form.Group>

          {isLoading && <Loader />}

          <Button type="submit" style={{ backgroundColor: "#082b43" }}>
            Submit
          </Button>
        </Form>
      );
    } else {
      let statusText, statusIcon;
      switch (profile.verificationStatus) {
        case "pending":
          statusText = "Verification Status: Pending";
          statusIcon = (
            <FaHourglass style={{ color: "#ffc107", marginRight: "5px" }} />
          );
          break;
        case "rejected":
          statusText = "Verification Status: Rejected";
          statusIcon = (
            <FaTimesCircle style={{ color: "#dc3545", marginRight: "5px" }} />
          );
          break;
        case "accepted":
          statusText = "Verification Status: Successful";
          statusIcon = (
            <FaCheckCircle style={{ color: "#28a745", marginRight: "5px" }} />
          );
          break;
        default:
          statusText = "Verification Status: Unknown";
          statusIcon = null;
          break;
      }

      return (
        <>
          <h1 className="my-3">Verification</h1>
          <p>
            {statusIcon}
            {statusText}
          </p>
        </>
      );
    }
  };

  return (
    <div>
      <div className="position-relative">
        <img src={bgImage} alt="background" className="background-image" />
        <div className="overlay-text">
          <h1>Verification</h1>
        </div>
      </div>
      <Container className="profile-container">
        <Row>
          <Col md={3} className="sidebar-container">
            <div className="sidebarprofile">
              <Image
                src={
                  profile?.profileImageName
                    ? typeof profile.profileImageName === "string"
                      ? getImageUrl(profile.profileImageName)
                      : URL.createObjectURL(profile.profileImageName)
                    : defaultProfileImage
                }
                className="sidebar-image"
                alt={profile?.name}
              />
              <Nav className="flex-column">
                <LinkContainer to="/hotelier/profile">
                  <Nav.Link>My Profile</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/hotelier/verification">
                  <Nav.Link>Verification</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/wallet">
                  <Nav.Link>Wallet</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/messages">
                  <Nav.Link>Messages</Nav.Link>
                </LinkContainer>
              </Nav>
            </div>
          </Col>
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
    </div>
  );
};

export default HotelierVerificationScreen;
