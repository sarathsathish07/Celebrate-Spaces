import React, { useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { Button, Form as BootstrapForm } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { useAdminListHotelMutation, useAdminUnlistHotelMutation } from '../../slices/adminApiSlice';
import './userTable.css';

export const HotelsTable = ({ hotels, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [listHotel] = useAdminListHotelMutation();
  const [unlistHotel] = useAdminUnlistHotelMutation();

  const handleList = async (hotel) => {
    try {
      await listHotel({ hotelId: hotel._id }).unwrap();
      toast.success('Hotel listed successfully');
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const handleUnlist = async (hotel) => {
    try {
      await unlistHotel({ hotelId: hotel._id }).unwrap();
      toast.success('Hotel unlisted successfully');
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  return (
    <>
      <div className="containerS">
        <div>
          <BootstrapForm>
            <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
              <BootstrapForm.Label>Search hotels:</BootstrapForm.Label>
              <BootstrapForm.Control
                style={{ width: '500px' }}
                value={searchQuery}
                type="text"
                placeholder="Enter Name or City..."
                onChange={handleSearch}
              />
            </BootstrapForm.Group>
          </BootstrapForm>
        </div>
      </div>
      <br />

      <MDBTable align="middle">
        <MDBTableHead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">City</th>
            <th scope="col">Address</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {filteredHotels.map((hotel) => (
            <tr key={hotel._id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="ms-3">
                    <p className="fw-bold mb-1">{hotel.name}</p>
                  </div>
                </div>
              </td>
              <td>
                <p className="fw-normal mb-1">{hotel.city}</p>
              </td>
              <td>
                <p className="fw-normal mb-1">{hotel.address}</p>
              </td>
              <td>
                <p className="fw-normal mb-1">{hotel.isListed ? 'Listed' : 'Unlisted'}</p>
              </td>
              <td>
                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => (hotel.isListed ? handleUnlist(hotel) : handleList(hotel))}
                >
                  {hotel.isListed ? <AiFillCloseCircle /> : <AiFillCheckCircle />}
                </Button>
              </td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
    </>
  );
};
