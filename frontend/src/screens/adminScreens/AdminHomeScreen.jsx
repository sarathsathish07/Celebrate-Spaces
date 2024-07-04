import React, { Fragment } from "react";
import AdminHero from "../../components/adminComponents/AdminHero";
import AdminLayout from "../../components/adminComponents/AdminLayout";

function AdminHomeScreen() {
  return (
    <AdminLayout hotelierName="Hotelier Name">
      <AdminHero />
    </AdminLayout>
  );
}

export default AdminHomeScreen;