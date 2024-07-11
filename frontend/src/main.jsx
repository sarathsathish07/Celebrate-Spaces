import React from "react";
import ReactDOM from "react-dom";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import PrivateRoute from "./components/userComponents/PrivateRoute.jsx";
import AdminPrivateRoute from "./components/adminComponents/AdminPrivateRoute.jsx";
import HotelierPrivateRoute from "./components/hotelierComponents/HotelierPrivateRoute.jsx";
import HomeScreen from "./screens/userScreens/HomeScreen.jsx";
import LoginScreen from "./screens/userScreens/LoginScreen.jsx";
import RegisterScreen from "./screens/userScreens/RegisterScreen.jsx";
import ProfileScreen from "./screens/userScreens/ProfileScreen.jsx";
import AdminHomeScreen from "./screens/adminScreens/AdminHomeScreen.jsx";
import AdminLoginScreen from "./screens/adminScreens/AdminLoginScreen.jsx";
import OtpVerificationScreen from "./screens/userScreens/OtpVerificationScreen.jsx";
import { UserManagementScreen } from "./screens/adminScreens/UserManagementScreen.jsx";
import HotelierHomeScreen from "./screens/hotelierScreens/HotelierHomeScreen.jsx";
import HotelierLoginScreen from "./screens/hotelierScreens/HotelierLoginScreen.jsx";
import HotelierProfileScreen from "./screens/hotelierScreens/HotelierProfileScreen.jsx";
import HotelierRegisterScreen from "./screens/hotelierScreens/HotelierRegisterScreen.jsx";
import HotelierOtpVerificationScreen from "./screens/hotelierScreens/HotelierOtpVerificationScreen.jsx";
import HotelierVerificationScreen from "./screens/hotelierScreens/HotelierVerificationScreen.jsx";
import AdminVerificationScreen from "./screens/adminScreens/AdminVerificationScreen.jsx";
import RegisteredHotelsScreen from "./screens/hotelierScreens/RegisteredHotelsScreen.jsx";
import HotelsScreen from "./screens/userScreens/HotelsScreen.jsx";
import AddHotelScreen from "./screens/hotelierScreens/AddHotelScreen.jsx";
import HotelsManagementScreen from "./screens/adminScreens/HotelsManagementScreen.jsx";
import EditHotelScreen from "./screens/hotelierScreens/EditHotelScreen.jsx";
import AddRoomScreen from "./screens/hotelierScreens/AddRoomScreen.jsx";
import HotelDetailsScreen from "./screens/userScreens/HotelDetailsScreen.jsx";
import CheckoutScreen from "./screens/userScreens/CheckoutScreen.jsx";
import BookingsScreen from "./screens/userScreens/BookingsScreen.jsx";
import store from "./store.js";
import { Provider } from "react-redux";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* User Routes */}
      <Route index path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/verify-otp" element={<OtpVerificationScreen />} />
      <Route path="/hotels" element={<HotelsScreen />} />

      <Route path="" element={<PrivateRoute />}>
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="/hotels/:id" element={<HotelDetailsScreen />} />
        <Route path="/booking" element={<CheckoutScreen/>} />
        <Route path="/bookings" element={<BookingsScreen/>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPrivateRoute />}>
        <Route index element={<AdminHomeScreen />} />
        <Route path="get-user" element={<UserManagementScreen />} />
        <Route path="verification" element={<AdminVerificationScreen />} />
        <Route path="get-hotels" element={<HotelsManagementScreen />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginScreen />} />

      {/* Hotelier Routes */}
      <Route path="/hotelier" element={<HotelierPrivateRoute />}>
        <Route index element={<HotelierHomeScreen />} />
        <Route path="profile" element={<HotelierProfileScreen />} />
        <Route path="verification" element={<HotelierVerificationScreen />} />
        <Route path="registered-hotels" element={<RegisteredHotelsScreen />} />
        <Route path="add-hotel" element={<AddHotelScreen />} />
        <Route path="/hotelier/edit-hotel/:id" element={<EditHotelScreen />} />
        <Route path="/hotelier/add-room/:hotelId" element={<AddRoomScreen />} />
      </Route>
      <Route path="/hotelier/login" element={<HotelierLoginScreen />} />
      <Route path="/hotelier/register" element={<HotelierRegisterScreen />} />
      <Route
        path="/hotelier/verify-otp"
        element={<HotelierOtpVerificationScreen />}
      />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
