import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Verified as VerifiedIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";

const LawyerManagement = () => {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lawyerToDelete, setLawyerToDelete] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          "https://lawyerbackend-qrqa.onrender.com/lawapi/common/lwayerlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLawyers(response.data.data);
        setFilteredLawyers(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch lawyers");
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  useEffect(() => {
    const results = lawyers.filter(
      (lawyer) =>
        lawyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.specialization
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lawyer.lawyerId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLawyers(results);
    setPage(0); // Reset to first page when search changes
  }, [searchTerm, lawyers]);

const verifyLawyer = async (lawyer) => {
  try {
    setVerifyingId(lawyer._id);
    const token = sessionStorage.getItem('token');

    const response = await axios.post(
      `https://lawyerbackend-qrqa.onrender.com/lawapi/auth/verify-lawyer/${lawyer.lawyerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    toast.success('Lawyer verified successfully');

    setLawyers((prev) =>
      prev.map((item) =>
        item._id === lawyer._id ? { ...item, isverified: true } : item
      )
    );
  } catch (error) {
    console.error('Verification error:', error);
    toast.error(error.response?.data?.message || 'Failed to verify lawyer');
  } finally {
    setVerifyingId(null);
  }
};



  const handleDeleteClick = (lawyer) => {
    setLawyerToDelete(lawyer);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteLawyer = async () => {
    if (!lawyerToDelete) return;

    try {
      setDeletingId(lawyerToDelete._id);
      const token = sessionStorage.getItem("token");

      // Preferred URL format
      const url = `https://lawyerbackend-qrqa.onrender.com/lawapi/common/dellawyer/${lawyerToDelete.lawyerId}`;

      // Try POST instead of DELETE
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data?.is_deleted) {
        toast.success("Lawyer deleted successfully");
        setLawyers((prev) => prev.filter((l) => l._id !== lawyerToDelete._id));
        setDeleteDialogOpen(false);
        setLawyerToDelete(null);
      } else {
        toast.warning("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error deleting lawyer: ", error);
      toast.error(
        "Delete failed. Status: " + (error.response?.status || "Network Error")
      );
    } finally {
      setDeletingId(null);
    }
  };

  const viewLawyerDetails = (lawyer) => {
    setSelectedLawyer(lawyer);
    setOpenModal(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <GavelIcon fontSize="large" /> Lawyer Management
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search lawyers by name, email, or specialization"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.light" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    #
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    Lawyer ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    Specialization
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "common.white" }}>
                    Status
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "common.white" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLawyers.length > 0 ? (
                  filteredLawyers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((lawyer, index) => (
                      <TableRow key={lawyer._id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{lawyer.name}</TableCell>
                        <TableCell>{lawyer.email}</TableCell>
                        <TableCell>{lawyer.lawyerId}</TableCell>
                        <TableCell>{lawyer.specialization}</TableCell>
                        <TableCell>
                          {lawyer.isverified ? (
                            <Chip
                              icon={<VerifiedIcon />}
                              label="Verified"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={<CancelIcon />}
                              label="Pending Verification"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 200 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="primary"
                              onClick={() => viewLawyerDetails(lawyer)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {!lawyer.isverified && (
                            <Tooltip title="Verify Lawyer">
                             <IconButton
  color="success"
  onClick={() => verifyLawyer(lawyer)} // Pass full object so you get both _id and lawyerId
  disabled={verifyingId === lawyer._id}
>
  {verifyingId === lawyer._id ? (
    <CircularProgress size={24} />
  ) : (
    <CheckCircleIcon />
  )}
</IconButton>

                            </Tooltip>
                          )}
                          <Tooltip title="Delete Lawyer">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(lawyer)}
                              disabled={deletingId === lawyer._id}
                            >
                              {deletingId === lawyer._id ? (
                                <CircularProgress size={24} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No lawyers found matching your search criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredLawyers.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredLawyers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2 }}
            />
          )}
        </>
      )}

      {/* Lawyer Details Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginLeft: 8,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GavelIcon /> Lawyer Profile
          </Box>
          <IconButton aria-label="close" onClick={() => setOpenModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLawyer && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3,
                p: 2,
              }}
            >
              <DetailItem
                label="Full Name"
                value={selectedLawyer.name}
                icon="person"
              />
              <DetailItem
                label="Email Address"
                value={selectedLawyer.email}
                icon="email"
              />
              <DetailItem
                label="Contact Number"
                value={selectedLawyer.phone || "Not provided"}
                icon="phone"
              />
              <DetailItem
                label="Specialization"
                value={selectedLawyer.specialization}
                icon="work"
              />
              <DetailItem
                label="Lawyer ID"
                value={selectedLawyer.lawyerId}
                icon="work"
              />
              <DetailItem
                label="Years of Experience"
                value={selectedLawyer.experience}
                icon="schedule"
              />
              <DetailItem
                label="License Number"
                value={selectedLawyer.licenseNumber}
                icon="badge"
              />
              <DetailItem
                label="Office Address"
                value={
                  `${selectedLawyer.addressline || ""}, ${
                    selectedLawyer.city || ""
                  }`.trim() || "Not provided"
                }
                icon="location_on"
              />
              <DetailItem
                label="Verification Status"
                value={
                  <Chip
                    icon={
                      selectedLawyer.isverified ? (
                        <VerifiedIcon />
                      ) : (
                        <CancelIcon />
                      )
                    }
                    label={
                      selectedLawyer.isverified
                        ? "Verified Professional"
                        : "Pending Verification"
                    }
                    color={selectedLawyer.isverified ? "success" : "warning"}
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                }
                icon="verified"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenModal(false)}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon color="error" /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to permanently delete {lawyerToDelete?.name}'s
            account?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteLawyer}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={deletingId === lawyerToDelete?._id}
          >
            {deletingId === lawyerToDelete?._id
              ? "Deleting..."
              : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <Box sx={{ display: "flex", flexDirection: "column" }}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {typeof value === "string" || typeof value === "number" ? value : value}
    </Typography>
  </Box>
);

export default LawyerManagement;
