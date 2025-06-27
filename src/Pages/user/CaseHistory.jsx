import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Avatar,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import { CalendarToday, Schedule, Payment, Person, Info } from '@mui/icons-material';

const apiUrl = 'https://lawyerbackend-qrqa.onrender.com/lawapi/common/lawyerbooking';

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'completed' ? theme.palette.success.light :
    status === 'pending' ? theme.palette.warning.light :
    status === 'cancelled' ? theme.palette.error.light :
    theme.palette.info.light,
  color: theme.palette.getContrastText(
    status === 'completed' ? theme.palette.success.light :
    status === 'pending' ? theme.palette.warning.light :
    status === 'cancelled' ? theme.palette.error.light :
    theme.palette.info.light
  ),
  fontWeight: 'bold'
}));

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // In a real app, you would include authentication headers
        const response = await axios.get(apiUrl);
        setCases(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cases. Please try again later.');
        setLoading(false);
        console.error('Error fetching cases:', err);
      }
    };

    fetchCases();
  }, []);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 4 }}>
        My Legal Cases
      </Typography>

      {cases.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            You don't have any active cases yet.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Lawyer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Case Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Consultation</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={caseItem.lawyer?.profileImage} 
                        alt={caseItem.lawyer?.name}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body1">{caseItem.lawyer?.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{caseItem.caseType || 'General Consultation'}</TableCell>
                  <TableCell>
                    <Chip
                      label={caseItem.modeOfConsultation || 'Video'}
                      color={caseItem.modeOfConsultation === 'Video' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(caseItem.bookingDate)} at {formatTime(caseItem.bookingTime)}
                  </TableCell>
                  <TableCell>
                    <StatusChip 
                      label={caseItem.status || 'pending'} 
                      status={caseItem.status?.toLowerCase() || 'pending'} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<Info />}
                      onClick={() => handleCaseClick(caseItem)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Case Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedCase && (
          <>
            <DialogTitle sx={{ backgroundColor: '#2c3e50', color: 'white' }}>
              Case Details: {selectedCase.caseType || 'General Consultation'}
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: '#2c3e50' }} /> Lawyer Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={selectedCase.lawyer?.profileImage} 
                    alt={selectedCase.lawyer?.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{selectedCase.lawyer?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedCase.lawyer?.specialization || 'General Practice'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedCase.lawyer?.yearsOfExperience || '5'} years of experience
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, color: '#2c3e50' }} /> Appointment Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                    <Typography>{formatDate(selectedCase.bookingDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Time</Typography>
                    <Typography>{formatTime(selectedCase.bookingTime)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                    <Typography>{selectedCase.duration || '30'} minutes</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Consultation Mode</Typography>
                    <Chip
                      label={selectedCase.modeOfConsultation || 'Video'}
                      color={selectedCase.modeOfConsultation === 'Video' ? 'primary' : 'secondary'}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Payment sx={{ mr: 1, color: '#2c3e50' }} /> Payment Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                    <Typography>${selectedCase.transaction?.amount || '150'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Payment Status</Typography>
                    <StatusChip 
                      label={selectedCase.transaction?.status || 'completed'} 
                      status={selectedCase.transaction?.status?.toLowerCase() || 'completed'} 
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Payment Method</Typography>
                    <Typography>{selectedCase.transaction?.method || 'Credit Card'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
                    <Typography>{selectedCase.transaction?.id || 'TRX-123456'}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: '#2c3e50' }} /> Case Notes
                </Typography>
                {selectedCase.notes ? (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography>{selectedCase.notes}</Typography>
                  </Paper>
                ) : (
                  <Typography color="textSecondary">No additional notes provided.</Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={handleCloseDialog} 
                color="primary" 
                variant="contained"
                sx={{ backgroundColor: '#2c3e50', '&:hover': { backgroundColor: '#1a252f' } }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MyCases;