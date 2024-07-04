import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { useHotelierLoginMutation } from "../../slices/hotelierApiSlice.js";
import { setCredentials } from "../../slices/hotelierAuthSlice.js";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";

const HotelierLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useHotelierLoginMutation();

  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);

  useEffect(() => {
    if (hotelierInfo) {
      navigate('/hotelier');
    }
  }, [navigate, hotelierInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/hotelier');
    } catch (error) {
      if (error?.data?.message === 'Please verify your OTP before logging in') {
        navigate('/hotelier/verify-otp', { state: { email } });
      } else {
        toast.error(error?.data?.message || error.error);
      }
    }
  };

  return (
    <div className="login-containerH">
      <Form onSubmit={submitHandler} className="login-formH">
        <h1>Hotelier Sign In</h1>
        <Form.Group className="my-2" controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Enter Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}>
          </Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Enter Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}>
          </Form.Control>
        </Form.Group>

        {isLoading && <Loader />}

        <Button type="submit" variant="primary" className="mt-3">
          Sign In
        </Button>

        <Row className="py-3">
          <Col className="text-center">
            New Customer? <Link to='/hotelier/register'>Register</Link>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default HotelierLoginScreen;
