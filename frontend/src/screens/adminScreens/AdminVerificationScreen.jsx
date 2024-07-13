import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Form } from "react-bootstrap";
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
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAccept = async (hotelId) => {
    try {
      await acceptVerification(hotelId);
      refetch();
      toast.success("Verification request accepted successfully");
    } catch (error) {
      console.error("Error accepting verification:", error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectVerification({ adminId: selectedHotelId, reason: rejectionReason });
      refetch();
      toast.success("Verification request rejected");
      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting verification:", error);
    }
  };
  

  const openCertificateModal = (certificate) => {
    const adjustedCertificatePath = certificate.replace("backend\\public\\", "");
    setSelectedCertificate(adjustedCertificatePath);
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setSelectedCertificate("");
    setShowCertificateModal(false);
  };

  const openRejectModal = (hotelId) => {
    setSelectedHotelId(hotelId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setSelectedHotelId("");
    setRejectionReason("");
    setShowRejectModal(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AdminLayout>
      <div>
        <h2 className="my-3">Verification Requests</h2>
        {verifications.map((hotel) => (
          <Card key={hotel._id} className="my-3 p-3 rounded">
            <Card.Body>
              <h3>{hotel.name}</h3>
              <p>Status: {hotel.verificationStatus}</p>
              <Button variant="primary" onClick={() => openCertificateModal(hotel.certificate)}>
                View Certificate
              </Button>{" "}
              <Button variant="success" onClick={() => handleAccept(hotel._id)}>
                Accept
              </Button>{" "}
              <Button variant="danger" onClick={() => openRejectModal(hotel._id)}>
                Reject
              </Button>
            </Card.Body>
          </Card>
        ))}

        <Modal show={showCertificateModal} onHide={closeCertificateModal} size="xl">
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
            <Button variant="secondary" onClick={closeCertificateModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showRejectModal} onHide={closeRejectModal}>
          <Modal.Header closeButton>
            <Modal.Title>Reject Verification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="rejectionReason">
                <Form.Label>Reason for Rejection</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeRejectModal}>
              Close
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminVerificationScreen;
