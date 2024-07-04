import React, { useState, useEffect } from "react";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import { Button, Form as BootstrapForm } from "react-bootstrap";
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
    <>
      <div className="containerS">
        <div>
          <BootstrapForm>
            <BootstrapForm.Group className="mt-3" controlId="exampleForm.ControlInput1">
              <BootstrapForm.Label>Search users:</BootstrapForm.Label>
              <BootstrapForm.Control
                style={{ width: "500px" }}
                value={searchQuery}
                type="text"
                placeholder="Enter Name or email........"
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
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {filteredUsers.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="ms-3">
                    <p className="fw-bold mb-1">{item.name}</p>
                  </div>
                </div>
              </td>
              <td>
                <p className="fw-normal mb-1">{item.email}</p>
              </td>
              <td>
                <p className="fw-normal mb-1">{item.isBlocked ? "Blocked" : "Active"}</p>
              </td>
              <td>
                <Button
                  variant="transparent"
                  size="sm"
                  onClick={() => (item.isBlocked ? handleUnblock(item) : handleBlock(item))}
                >
                  {item.isBlocked ? <AiFillUnlock /> : <AiFillLock />}
                </Button>
              </td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
    </>
  );
};
