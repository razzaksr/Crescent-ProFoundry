import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllOrganizations } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { User, MapPin, Mail, Phone, Calendar, Copy } from 'lucide-react';

// Custom styles
const styles = {
  root: {
    padding: { xs: 2, sm: 4, md: 5 },
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    animation: 'fadeIn 0.5s ease-in',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  title: {
    fontWeight: 800,
    color: '#0c83c8',
    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
    letterSpacing: '0.5px',
    textAlign: 'center',
    mb: 3,
  },
  dataGridPaper: {
    p: { xs: 1, sm: 2 },
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  dataGrid: {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#0c83c8',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: '1rem',
      borderBottom: '2px solid #0c83c8',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 800,
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f8fafc',
      },
      '&:hover': {
        backgroundColor: '#fff3e0',
        '& *': { color: '#fc7a46' },
        '& svg': { color: '#fc7a46' },
      },
      transition: 'all 0.2s ease',
    },
    '& .MuiDataGrid-cell': {
      padding: '12px',
      fontSize: '0.9rem',
      borderBottom: '1px solid #e0e0e0',
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e0e0e0',
    },
    border: 'none',
    borderRadius: '16px',
    '& .MuiDataGrid-overlay': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
  },
};

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const response = await fetchAllOrganizations();
        setOrganizations(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setSnackbarMessage(`Error fetching organizations: ${error.message}`);
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    getOrganizations();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarOpen(true);
      });
  };

  const columns = [
    {
      field: 'org_name',
      headerName: 'Organization Name',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <User size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
   {
  field: 'org_address',
  headerName: 'Address',
  width: 300, // ⬅️ Make the column itself wider
  renderCell: (params) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        py: 0.1,
        whiteSpace: 'normal', // ⬅️ Allow line breaks
        wordBreak: 'break-word', // ⬅️ Prevent overflow
      }}
    >
      <MapPin size={20} color="#0c83c8" style={{ marginTop: 4 }} /> {/* ⬅️ Icon slightly aligned top */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: '#333',
          fontSize: '0.85rem',
          lineHeight: 1.4,
        }}
      >
        {params.value}
      </Typography>
    </Box>
  ),
}
,
    {
      field: 'org_email',
      headerName: 'Email',
      width: 270,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Mail size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'org_contact',
      headerName: 'Contact',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Phone size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'org_associated_date',
      headerName: 'Associated Date',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Calendar size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: 'org_id',
    //   headerName: 'Organization ID',
    //   width: 250,
    //   renderCell: (params) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
    //       <Copy size={20} color="#0c83c8" onClick={() => handleCopyToClipboard(params.value)} style={{ cursor: 'pointer' }} />
    //       <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
    //         {params.value}
    //       </Typography>
    //     </Box>
    //   ),
    // },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box sx={styles.root}>
        <Typography variant="h4" sx={styles.title}>
          Organization Management
        </Typography>
        <Paper sx={styles.dataGridPaper}>
          <Box sx={{ height: { xs: 450, sm: 500, md: 600 }, width: '100%' }}>
            <DataGrid
              rows={organizations}
              columns={columns}
              pageSize={10}
              
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id}
              sx={{
                ...styles.dataGrid, // 👈 spreads your existing styles
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#0c83c8',
                  color: '#0c83c8',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                },
                '& .MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '& .MuiCheckbox-root': {
                  color: '#fff',
                },
              }}
              aria-label="Organizations Data Grid"
            />
          </Box>
        </Paper>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
            variant="filled"
            sx={{
              backgroundColor: snackbarMessage.includes('Error') ? '#d32f2f' : '#2e7d32',
              '&:hover': { backgroundColor: snackbarMessage.includes('Error') ? '#ef5350' : '#388e3c' },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default OrganizationPage;