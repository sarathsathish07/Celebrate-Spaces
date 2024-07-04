import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import {
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
} from '../../slices/adminApiSlice';
import AdminLayout from '../../components/adminComponents/AdminLayout';
import { toast } from "react-toastify";

const AdminVerificationScreen = () => {
  const { data: verifications, error, isLoading } = useGetVerificationDataQuery();
  const [acceptVerification] = useAdminAcceptVerificationMutation();
  const [rejectVerification] = useAdminRejectVerificationMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState('');

  const handleAccept = async (adminId) => {
    try {
      await acceptVerification(adminId);
      toast.success('Verification request accepted successfully');
      refetch(); 
    } catch (error) {
      console.error('Error accepting verification:', error);
    }
  };

  const handleReject = async (adminId) => {
    try {
      await rejectVerification(adminId);
      toast.success('Verification request rejected');
      refetch(); 
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  const openModal = (certificatePath) => {
    setSelectedCertificate(certificatePath);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <AdminLayout>
      <div>
        <h2 className='my-3'>Verification Requests</h2>
        {verifications.map((admin) => (
          <Card key={admin._id} className="my-3 p-3 rounded">
            <Card.Body>
              <h3>{admin.name}</h3>
              <p>Status: {admin.verificationStatus}</p>
              <Button variant="primary" onClick={() => openModal(admin.certificates)}>
                View Certificate
              </Button>{' '}
              <Button variant="success" onClick={() => handleAccept(admin._id)}>
                Accept
              </Button>{' '}
              <Button variant="danger" onClick={() => handleReject(admin._id)}>
                Reject
              </Button>
            </Card.Body>
          </Card>
        ))}

        {/* Modal to display certificate */}
        <Modal show={showModal} onHide={closeModal} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>View Certificate</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <iframe
              title="Certificate Preview"
              src={`http://localhost:5000/CertificateUploads/${selectedCertificate}`}
              style={{ width: '100%', height: '80vh', border: 'none' }}
            ></iframe>
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
