import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Container, Form, Button, Table } from 'react-bootstrap';
import { FaUsers, FaHotel, FaMoneyBill } from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useGetAdminStatsQuery, useGetSalesReportQuery } from '../../slices/adminApiSlice.js';
import AdminLayout from '../../components/adminComponents/AdminLayout';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../components/userComponents/Loader.jsx';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
ChartJS.register(...registerables);

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const { data: stats, isLoading, refetch } = useGetAdminStatsQuery();
  const { data: salesReport, refetch: fetchSalesReport } = useGetSalesReportQuery({
    from: dateRange.from,
    to: dateRange.to
  });

  const monthlyChartRef = useRef(null);
  const yearlyChartRef = useRef(null);

  const [reportPreview, setReportPreview] = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard";
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
    if (!dateRange.from || !dateRange.to) {
      toast.error('Both From and To dates are required.');
      return;
    }

    if (new Date(dateRange.to) < new Date(dateRange.from)) {
      toast.error('To date must be after From date.');
      return;
    }

    await fetchSalesReport({ from: dateRange.from, to: dateRange.to });
    setReportPreview(salesReport);
  };

  const handleDownloadReport = () => {
    if (reportPreview) {
      const docDefinition = {
        content: [
          { text: 'Sales Report', style: 'header' },
          { text: `From: ${new Date(dateRange.from).toLocaleDateString()} To: ${new Date(dateRange.to).toLocaleDateString()}`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: [50, 50, '*', '*', '*', 50, 50, 50, 50],
              body: [
                [
                  { text: 'Date', style: 'tableHeader' },
                  { text: 'Amount', style: 'tableHeader' },
                  { text: 'Guest', style: 'tableHeader' },
                  { text: 'Hotel', style: 'tableHeader' },
                  { text: 'Room', style: 'tableHeader' },
                  { text: 'Check-In', style: 'tableHeader' },
                  { text: 'Check-Out', style: 'tableHeader' },
                  { text: 'Pay Method', style: 'tableHeader' },
                  { text: 'Booking Status', style: 'tableHeader' }
                ],
                ...reportPreview.map(item => [
                  item?._id,
                  `Rs ${item?.totalSales}`,
                  item?.userName,
                  item?.hotelName,
                  item?.roomName,
                  new Date(item?.checkInDate).toLocaleDateString(),
                  new Date(item?.checkOutDate).toLocaleDateString(),
                  item?.paymentMethod,
                  item?.bookingStatus,
                ])
              ]
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 15,
            bold: true,
            margin: [0, 10, 0, 10]
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
          },
          tableExample: {
            margin: [0, 5, 0, 15]
          },

          defaultStyle: {
            fontSize: 9
          }
        }
      };
      pdfMake.createPdf(docDefinition).download('sales-report.pdf');
    }
  };

  if (isLoading) return <Loader />;

  const monthlyBookingsData = {
    labels: stats.monthlyBookings?.map((data) => data.month),
    datasets: [
      {
        label: 'Monthly Bookings',
        data: stats.monthlyBookings?.map((data) => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const yearlyBookingsData = {
    labels: stats.yearlyBookings?.map((data) => data.year),
    datasets: [
      {
        label: 'Yearly Bookings',
        data: stats.yearlyBookings?.map((data) => data.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <AdminLayout>
      <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
        <Container>
          <Row className="my-4 mx-3">
            <Col md={3}>
              <Card className="bg-secondary text-white text-center">
                <Card.Body>
                  <FaUsers size={40} />
                  <h4>Total Users</h4>
                  <h2>{stats?.totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-secondary text-white text-center">
                <Card.Body>
                  <FaHotel size={40} />
                  <h4>Total Hoteliers</h4>
                  <h2>{stats?.totalHoteliers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-secondary text-white text-center">
                <Card.Body>
                  <FaHotel size={40} />
                  <h4>Total Hotels</h4>
                  <h2>{stats?.totalHotels}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-secondary text-white text-center">
                <Card.Body>
                  <FaMoneyBill size={40} />
                  <h4>Total Revenue</h4>
                  <h2>Rs {stats?.totalRevenue}</h2>
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
                            value={dateRange?.to}
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
                          {reportPreview?.map((item, index) => (
                            <tr key={index}>
                              <td>{item?._id}</td>
                              <td>Rs {item?.totalSales}</td>
                              <td>{item?.userName}</td>
                              <td>{item?.hotelName}</td>
                              <td>{item?.roomName}</td>
                              <td>{new Date(item?.checkInDate).toLocaleDateString()}</td>
                              <td>{new Date(item?.checkOutDate).toLocaleDateString()}</td>
                              <td>{item?.paymentMethod}</td>
                              <td>{item?.bookingStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <Button onClick={handleDownloadReport}>Download Report</Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        <ToastContainer />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
