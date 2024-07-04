import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from './components/adminComponents/AdminHeader';
import Header from './components/userComponents/Header';
import HotelierHeader from './components/hotelierComponents/HotelierHeader';

const App = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHotelierPage = location.pathname.startsWith('/hotelier');
  const isSignInPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/register';

  if (isSignInPage || isSignUpPage) {
    return (
      <>
        <ToastContainer />
        <Outlet />
      </>
    );
  }

  return (
    <>
      {isAdminPage ? (
        <AdminHeader />
      ) : isHotelierPage ? (
        <HotelierHeader />
      ) : (
        <Header />
      )}
      <ToastContainer />
      <Outlet />
    </>
  );
};

export default App;
