import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Container, Form, Button, Table } from 'react-bootstrap';
import { FaHotel, FaMoneyBill } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useGetHotelierDashboardStatsQuery, useGetHotelierSalesReportMutation } from '../../slices/hotelierApiSlice.js';
import HotelierLayout from '../../components/hotelierComponents/HotelierLayout.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/userComponents/Loader.jsx';

ChartJS.register(...registerables);

const HotelierDashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const { data: stats, isLoading, refetch } = useGetHotelierDashboardStatsQuery();
  const [getSalesReport] = useGetHotelierSalesReportMutation();
  const [reportPreview, setReportPreview] = useState(null);

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

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async () => {
    const { from, to } = dateRange;
    if (!from || !to) {
      toast.error('Both from and to dates are required.');
      return;
    }
    if (new Date(from) >= new Date(to)) {
      toast.error('To date must be after from date.');
      return;
    }
    const response = await getSalesReport({ from, to });
    if (response.data) {
      setReportPreview(response.data);
    }
  };

  const handleDownloadReport = async () => {
    if (reportPreview) {
      const doc = new jsPDF();
      const table = document.querySelector('#reportTable');

      const canvas = await html2canvas(table);
      const imgData = canvas.toDataURL('image/png');

      doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
      doc.save('sales-report.pdf');
    }
  };

  const formatMonthlyLabel = (month) => {
    const [year, monthIndex] = month.split('-');
    return `${year}-${String(monthIndex).padStart(2, '0')}`;
  };

  const monthlyBookingsData = {
    labels: stats?.monthlyBookings.map((data) => formatMonthlyLabel(data.month)) || [],
    datasets: [
      {
        label: 'Monthly Bookings',
        data: stats?.monthlyBookings.map((data) => data.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const yearlyBookingsData = {
    labels: stats?.yearlyBookings.map((data) => data.year.toString()) || [],
    datasets: [
      {
        label: 'Yearly Bookings',
        data: stats?.yearlyBookings.map((data) => data.count) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  if (isLoading) return <Loader />;

  return (
    <HotelierLayout>
      <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
        <Container>
          <Row className="my-4 mx-3">
            <Col md={4}>
              <Card className="bg-info text-white text-center">
                <Card.Body>
                  <FaHotel size={40} />
                  <h4>Total Hotels</h4>
                  <h2>{stats?.totalHotels}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-success text-white text-center">
                <Card.Body>
                  <FaMoneyBill size={40} />
                  <h4>Total Revenue</h4>
                  <h2>Rs {stats?.totalRevenue}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="bg-warning text-white text-center">
                <Card.Body>
                  <FaHotel size={40} />
                  <h4>Total Bookings</h4>
                  <h2>{stats?.totalBookings}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="my-4 mx-3">
            <Col md={6}>
              <Card style={{ backgroundColor: 'white' }}>
                <Card.Body>
                  <Bar ref={monthlyChartRef} data={monthlyBookingsData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card style={{ backgroundColor: 'white' }}>
                <Card.Body>
                  <Line ref={yearlyChartRef} data={yearlyBookingsData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="my-5 mx-3">
            <Col md={12}>
              <Card>
                <Card.Body>
                  <h3>Sales Report</h3>
                  <Form>
                    <Row>
                      <Col md={5}>
                        <Form.Group controlId="from">
                          <Form.Label>From</Form.Label>
                          <Form.Control
                            type="date"
                            name="from"
                            value={dateRange.from}
                            onChange={handleDateRangeChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group controlId="to">
                          <Form.Label>To</Form.Label>
                          <Form.Control
                            type="date"
                            name="to"
                            value={dateRange.to}
                            onChange={handleDateRangeChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-flex align-items-end">
                        <Button onClick={handleGenerateReport} className="w-100">
                          Generate Report
                        </Button>
                      </Col>
                    </Row>
                  </Form>

                  {reportPreview && (
                    <div className="mt-4">
                      <h4>Report Preview</h4>
                      <Table id="reportTable" striped bordered hover>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Guest</th>
                            <th>Hotel</th>
                            <th>Room</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Pay Method</th>
                            <th>Booking Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportPreview.map((item, index) => (
                            <tr key={index}>
                              <td>{item._id}</td>
                              <td>Rs {item.totalSales}</td>
                              <td>{item.userName}</td>
                              <td>{item.hotelName}</td>
                              <td>{item.roomName}</td>
                              <td>{new Date(item.checkInDate).toLocaleDateString()}</td>
                              <td>{new Date(item.checkOutDate).toLocaleDateString()}</td>
                              <td>{item.paymentMethod}</td>
                              <td>{item.bookingStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <Button onClick={handleDownloadReport} className="mt-3">
                        Download Report as PDF
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </HotelierLayout>
  );
};

export default HotelierDashboard;
