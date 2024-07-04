import React from "react";
import HotelierHero from "../../components/hotelierComponents/HotelierHero";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";

function HotelierHomeScreen() {
  return (
    <HotelierLayout hotelierName="Hotelier Name">
      <HotelierHero />
    </HotelierLayout>
  );
}

export default HotelierHomeScreen;
