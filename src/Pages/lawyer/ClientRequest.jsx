import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Badge, Button, Modal } from "react-bootstrap";

const ClientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const lawyerData = JSON.parse(localStorage.getItem("lawyerData"));
        const lawyerId = lawyerData?.lawyerId || lawyerData?._id;

        const res = await axios.get(
          `https://lawyerbackend-qrqa.onrender.com/lawapi/common/lawyerrequest/${lawyerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success && Array.isArray(res.data.requests)) {
          const normalized = res.data.requests.map((r) => ({
            ...r,
            status: r.status === "send" ? "pending" : r.status,
          }));
          setRequests(normalized);
        } else {
          toast.error("Invalid response from server");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching client requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter
  );

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://lawyerbackend-qrqa.onrender.com/lawapi/common/lawyerrequest/${requestId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: newStatus } : r))
      );
      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "accepted":
        return <Badge bg="success">Accepted</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const isPending = (status) => status === "pending";

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" />
      <h1 className="mb-4">Client Requests</h1>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          {["all", "pending", "accepted", "rejected"].map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? "primary" : "outline-primary"}
              onClick={() => setStatusFilter(filter)}
              className="me-2"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
        <div>
          <span className="me-2">Total Requests:</span>
          <Badge bg="info">{filteredRequests.length}</Badge>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr key={req._id}>
                <td>{req.userName || "N/A"}</td>
                <td>{req.userEmail || "N/A"}</td>
                <td>{getStatusBadge(req.status)}</td>
                <td>
                  {req.message.length > 50
                    ? `${req.message.substring(0, 50)}...`
                    : req.message}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleViewDetails(req)}
                    className="me-2"
                  >
                    View
                  </Button>
                  {isPending(req.status) && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(req._id, "accepted")}
                        className="me-2"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusUpdate(req._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="alert alert-info">No client requests found matching your criteria.</div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p><strong>Name:</strong> {selectedRequest.userName}</p>
              <p><strong>Email:</strong> {selectedRequest.userEmail}</p>
              <p><strong>User ID:</strong> {selectedRequest.userId}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</p>
              <hr />
              <h5>Message</h5>
              <p>{selectedRequest.message}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedRequest && isPending(selectedRequest.status) && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  handleStatusUpdate(selectedRequest._id, "accepted");
                  setShowModal(false);
                }}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleStatusUpdate(selectedRequest._id, "rejected");
                  setShowModal(false);
                }}
              >
                Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientRequests;
