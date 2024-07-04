import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import { useVerifyOtpMutation } from "../../slices/usersApiSlice";

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const email = location.state.email; // Get the email from the state

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifyOtp] = useVerifyOtpMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      toast.success('OTP verified successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Form onSubmit={submitHandler} className="login-form">
        <h1>OTP Verification</h1>
        <Form.Group className="my-2" controlId='otp'>
          <Form.Label>Enter OTP</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="form-control"
          />
        </Form.Group>

        {isLoading && <Loader />}

        <Button type="submit" variant="primary" className="mt-3">
          Verify
        </Button>
      </Form>
    </div>
  );
};

export default OtpVerificationScreen;
