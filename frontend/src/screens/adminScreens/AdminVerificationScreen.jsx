import React, { useState, useEffect } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import {
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
} from "../../slices/adminApiSlice";
import AdminLayout from "../../components/adminComponents/AdminLayout";
import { toast } from "react-toastify";

const AdminVerificationScreen = () => {
  const {
    data: verifications,
    error,
    isLoading,
    refetch,
  } = useGetVerificationDataQuery();
  const [acceptVerification] = useAdminAcceptVerificationMutation();
  const [rejectVerification] = useAdminRejectVerificationMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAccept = async (adminId) => {
    try {
      await acceptVerification(adminId);
      refetch();
      toast.success("Verification request accepted successfully");
    } catch (error) {
      console.error("Error accepting verification:", error);
    }
  };

  const handleReject = async (adminId) => {
    try {
      await rejectVerification(adminId);
      refetch();
      toast.success("Verification request rejected");
    } catch (error) {
      console.error("Error rejecting verification:", error);
    }
  };

  const openModal = (certificate) => {
    const adjustedCertificatePath = certificate.replace(
      "backend\\public\\",
      ""
    );
    setSelectedCertificate(adjustedCertificatePath);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCertificate("");
    setShowModal(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AdminLayout>
      <div>
        <h2 className="my-3">Verification Requests</h2>
        {verifications.map((admin) => (
          <Card key={admin._id} className="my-3 p-3 rounded">
            <Card.Body>
              <h3>{admin.name}</h3>
              <p>Status: {admin.verificationStatus}</p>
              <Button
                variant="primary"
                onClick={() => openModal(admin.certificates)}
              >
                View Certificate
              </Button>{" "}
              <Button variant="success" onClick={() => handleAccept(admin._id)}>
                Accept
              </Button>{" "}
              <Button variant="danger" onClick={() => handleReject(admin._id)}>
                Reject
              </Button>
            </Card.Body>
          </Card>
        ))}

        <Modal show={showModal} onHide={closeModal} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>View Certificate</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCertificate && (
              <img
                src={`http://localhost:5000/${selectedCertificate}`}
                alt="Certificate Preview"
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminVerificationScreen;
