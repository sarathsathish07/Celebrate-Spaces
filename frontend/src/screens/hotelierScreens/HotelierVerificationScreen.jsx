import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useUploadVerificationDetailsMutation } from '../../slices/hotelierApiSlice';
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout';
import { toast } from 'react-toastify';

const HotelierVerificationScreen = () => {
  const [certificates, setCertificates] = useState(null);
  const navigate = useNavigate();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const [uploadVerificationDetails, { isLoading }] = useUploadVerificationDetailsMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (certificates) {
      const formData = new FormData();
      formData.append('certificates', certificates);
      try {
        const response = await uploadVerificationDetails(formData).unwrap();
        if (response.error) {
          toast.error(response.error.message);
        } else {
          toast.success('Verification details submitted successfully');
          navigate('/hotelier');
        }
      } catch (error) {
        console.error('Error in API call:', error);
        toast.error('An error occurred while submitting verification details');
      }
    } else {
      alert('Please upload a certificate');
    }
  };
  

  return (
    <HotelierLayout>
 <Row className="justify-content-md-center">
      <Col xs={12} md={6}>
        <h1 className='my-3'>Upload Certificates</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='certificates' className="my-3">
            <Form.Label>Upload Certificates</Form.Label>
            <Form.Control
              type='file'
              onChange={(e) => setCertificates(e.target.files[0])}
            />
          </Form.Group>

          {isLoading && <div>Loading...</div>}

          <Button type='submit' style={{backgroundColor:'#082b43' }}>
            Submit
          </Button>
        </Form>
      </Col>
    </Row>
    </HotelierLayout>
   
  );
};

export default HotelierVerificationScreen;
