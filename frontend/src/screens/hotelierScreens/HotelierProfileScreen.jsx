import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../../components/userComponents/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/userComponents/Loader";
import { setCredentials } from "../../slices/hotelierAuthSlice";
import { useNavigate } from "react-router-dom";
import { useHotelierUpdateUserMutation } from "../../slices/hotelierApiSlice";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
const PROFILE_IMAGE_DIR_PATH = 'http://localhost:5000/UserProfileImages/'


const HotelierProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImageName, setProfileImageName] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  const [updateProfile, { isLoading }] = useHotelierUpdateUserMutation()
  useEffect(() => {
    setName(hotelierInfo.name);
    setEmail(hotelierInfo.email);
    setProfileImageName(hotelierInfo.profileImageName);
  }, [hotelierInfo.setName, hotelierInfo.setEmail,hotelierInfo.profileImageName]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const nameRegex = /^[A-Za-z\s'-]+$/
    if(!nameRegex.test(name)){
      toast.error('Name is not valid')
      return
    }
    if(!emailRegex.test(email)){
      toast.error("Email Not Valid")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords donot match");
    } else {
     try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('profileImageName', profileImageName);
    const responseFromApiCall = await updateProfile(formData).unwrap();
    dispatch(setCredentials({...responseFromApiCall}))
    toast.success('Profile Updated Succesfully')
     } catch (error) {
        console.log(error.data.message);
        toast.error("An error occured")
     }
    }
  };

  return (
    <HotelierLayout>
 <FormContainer style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '20px', borderRadius: '10px' }}>
       {hotelierInfo.profileImageName && (
        <img
          src={PROFILE_IMAGE_DIR_PATH + hotelierInfo.profileImageName}
          alt={hotelierInfo.name}
          style={{
            width: "150px",
            justifyContent:"center",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            marginTop: "5px",
            marginLeft: "115px",
            marginBottom: "10px",
          }}
        />
      )}
      <h1>Update Profile</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="my-2" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group className="my-2" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="my-2" controlId="profileImage">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setProfileImageName(e.target.files[0])}
              ></Form.Control>
            </Form.Group>

        {isLoading && <Loader/>}

        <Button type="submit" className="mt-3"  style={{backgroundColor:'#082b43' }}>
          Update
        </Button>
      </Form>
    </FormContainer>
    </HotelierLayout>
    
  );
};

export default HotelierProfileScreen;