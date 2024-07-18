import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import { FaUsers, FaHotel, FaMoneyBill } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useGetAdminStatsQuery } from '../../slices/adminApiSlice'; 
import AdminLayout from '../../components/adminComponents/AdminLayout';
ChartJS.register(...registerables);

const AdminDashboard = () => {
  const { data: stats, isLoading, refetch } = useGetAdminStatsQuery();

  const monthlyChartRef = useRef(null);
  const yearlyChartRef = useRef(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    return () => {
      if (monthlyChartRef.current?.chartInstance) {
        monthlyChartRef.current.chartInstance.destroy();
      }
      if (yearlyChartRef.current?.chartInstance) {
        yearlyChartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;

  const monthlyBookingsData = {
    labels: stats.monthlyBookings.map((data) => data.month),
    datasets: [
      {
        label: 'Monthly Bookings',
        data: stats.monthlyBookings.map((data) => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const yearlyBookingsData = {
    labels: stats.yearlyBookings.map((data) => data.year),
    datasets: [
      {
        label: 'Yearly Bookings',
        data: stats.yearlyBookings.map((data) => data.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <AdminLayout>
<Container>
      <Row className="my-4 mx-3">
        <Col md={3}>
          <Card className="bg-secondary text-white text-center">
            <Card.Body>
              <FaUsers size={40} />
              <h4>Total Users</h4>
              <h2>{stats.totalUsers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white text-center">
            <Card.Body>
              <FaHotel size={40} />
              <h4>Total Hoteliers</h4>
              <h2>{stats.totalHoteliers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white text-center">
            <Card.Body>
              <FaHotel size={40} />
              <h4>Total Hotels</h4>
              <h2>{stats.totalHotels}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-secondary text-white text-center">
            <Card.Body>
              <FaMoneyBill size={40} />
              <h4>Total Revenue</h4>
              <h2>Rs {stats.totalRevenue}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="my-5 mx-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Bar ref={monthlyChartRef} data={monthlyBookingsData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Line ref={yearlyChartRef} data={yearlyBookingsData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </AdminLayout>
    
  );
};

export default AdminDashboard;
