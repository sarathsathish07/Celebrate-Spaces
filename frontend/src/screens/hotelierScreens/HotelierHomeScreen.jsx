import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import { FaHotel, FaMoneyBill } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useGetHotelierDashboardStatsQuery } from '../../slices/hotelierApiSlice.js'; 
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout.jsx';

ChartJS.register(...registerables);

const HotelierDashboard = () => {
  const { data: stats, isLoading, refetch } = useGetHotelierDashboardStatsQuery();

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

  const formatMonthlyLabel = (month) => {
    const [year, monthIndex] = month.split('-');
    return `${year}-${String(monthIndex).padStart(2, '0')}`;
  };

  const monthlyBookingsData = {
    labels: stats.monthlyBookings.map((data) => formatMonthlyLabel(data.month)),
    datasets: [
      {
        label: 'Monthly Bookings',
        data: stats.monthlyBookings.map((data) => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const yearlyBookingsData = {
    labels: stats.yearlyBookings.map((data) => data.year.toString()),
    datasets: [
      {
        label: 'Yearly Bookings',
        data: stats.yearlyBookings.map((data) => data.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <HotelierLayout>
<Container>
      <Row className="my-4 mx-3">
        <Col md={4}>
          <Card className="bg-info text-white text-center">
            <Card.Body>
              <FaHotel size={40} />
              <h4>Total Hotels</h4>
              <h2>{stats.totalHotels}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-success text-white text-center">
            <Card.Body>
              <FaMoneyBill size={40} />
              <h4>Total Revenue</h4>
              <h2>Rs {stats.totalRevenue}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-warning text-white text-center">
            <Card.Body>
              <FaHotel size={40} />
              <h4>Total Bookings</h4>
              <h2>{stats.totalBookings}</h2>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      <Row className="my-4 mx-3">
        <Col md={6}>
          <Card style={{backgroundColor:"white"}}>
            <Card.Body>
              <Bar ref={monthlyChartRef} data={monthlyBookingsData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card style={{backgroundColor:"white"}}>
            <Card.Body>
              <Line ref={yearlyChartRef} data={yearlyBookingsData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </HotelierLayout>
    
  );
};

export default HotelierDashboard;
