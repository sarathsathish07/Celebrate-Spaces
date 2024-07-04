import React from 'react';
import { Form, Button, Col } from 'react-bootstrap';

const HotelsSidebar = () => {
  return (
    <div className="sidebar">
      <h4 className='mt-3'>Filter & Sort</h4>
      <hr />
      <Form>
        <Form.Group>
          <Form.Label>Sort by</Form.Label>
          <Form.Control as="select">
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating: High to Low</option>
            <option>Rating: Low to High</option>
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>City</Form.Label>
          <Form.Control type="text" placeholder="Enter city" />
        </Form.Group>

        <Form.Group>
          <Form.Label>Amenities</Form.Label>
          <Form.Check type="checkbox" label="Free WiFi" />
          <Form.Check type="checkbox" label="Pool" />
          <Form.Check type="checkbox" label="Parking" />
          <Form.Check type="checkbox" label="Gym" />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Apply Filters
        </Button>
      </Form>
    </div>
  );
};

export default HotelsSidebar;
