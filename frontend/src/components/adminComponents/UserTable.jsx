import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Card, Button, Form as BootstrapForm } from "react-bootstrap";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import { useAdminBlockUserMutation, useAdminUnblockUserMutation } from "../../slices/adminApiSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./userTable.css";

export const UsersTable = ({ users, refetchData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { adminInfo } = useSelector((state) => state.adminAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/get-user");
    } else {
      navigate("/admin");
    }
  }, [adminInfo, navigate]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [blockUser] = useAdminBlockUserMutation();
  const [unblockUser] = useAdminUnblockUserMutation();

  const handleBlock = async (user) => {
    try {
      await blockUser({ userId: user._id }).unwrap();
      toast.success("User blocked successfully");
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  const handleUnblock = async (user) => {
    try {
      await unblockUser({ userId: user._id }).unwrap();
      toast.success("User unblocked successfully");
      refetchData();
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="mt-3">
            <Card.Header>Users</Card.Header>
            <Card.Body>
              <div className="containerS">
                <BootstrapForm>
                  <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
                    <BootstrapForm.Label>Search users:</BootstrapForm.Label>
                    <BootstrapForm.Control
                      style={{ width: "500px" }}
                      value={searchQuery}
                      type="text"
                      placeholder="Enter Name or Email..."
                      onChange={handleSearch}
                    />
                  </BootstrapForm.Group>
                </BootstrapForm>
              </div>
              <br />
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>

              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.isBlocked ? "Blocked" : "Active"}</td>
                      <td>
                        <Button
                          variant="transparent"
                          size="sm"
                          onClick={() => (user.isBlocked ? handleUnblock(user) : handleBlock(user))}
                        >
                          {user.isBlocked ? <AiFillUnlock /> : <AiFillLock />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
