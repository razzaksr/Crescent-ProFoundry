import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllModules, deleteModule } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { Book, Code, Clock, Copy, Delete } from 'lucide-react';

// Custom styles
const styles = {
  root: {
    padding: { xs: 2, sm: 4, md: 6 },
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
  headerPaper: {
    mb: 4,
    p: { xs: 2, sm: 3 },
    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    color: '#ffffff',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
  },
  title: {
    fontWeight: 800,
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
    color: '#ffffff',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: { xs: '0.9rem', sm: '1rem' },
    color: '#ffffff',
    mt: 1,
    opacity: 0.9,
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
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
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

const ModulePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            setModules(response.data);
          } else {
            setSnackbarMessage('Invalid data format received from server');
            setSnackbarOpen(true);
            setModules([]);
          }
        } else {
          setSnackbarMessage('No data received from server');
          setSnackbarOpen(true);
          setModules([]);
        }
        setLoading(false);
      } catch (error) {
        setSnackbarMessage(`Failed to fetch modules: ${error.message || 'Unknown error'}`);
        setSnackbarOpen(true);
        setModules([]);
        setLoading(false);
      }
    };
    getModules();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleDelete = async (mod_id) => {
    try {
      await deleteModule(mod_id);
      setModules(modules.filter((module) => module._id !== mod_id));
      setSnackbarMessage('Module deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`Failed to delete module: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const columns = [
    {
      field: 'mod_name',
      headerName: 'Module Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Book size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_tech',
      headerName: 'Technology',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Code size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_duration',
      headerName: 'Duration',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Clock size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Delete
            size={20}
            color="#d32f2f"
            onClick={() => handleDelete(params.row._id)}
            style={{ cursor: 'pointer' }}
            aria-label={`Delete ${params.row.mod_name}`}
          />
        </Box>
      ),
    },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box sx={styles.root}>
        <Paper sx={styles.headerPaper}>
          <Typography variant="h5" sx={styles.title}>
            Module Management
          </Typography>
          <Typography variant="subtitle2" sx={styles.subtitle}>
            View all available training modules
          </Typography>
        </Paper>

        <Paper sx={styles.dataGridPaper}>
          <Box sx={{ width: '100%', height: { xs: 450, sm: 500, md: 600 } }}>
            <DataGrid
              rows={modules}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id}
              autoHeight
              sx={styles.dataGrid}
              aria-label="Modules Data Grid"
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
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              backgroundColor: snackbarSeverity === 'success' ? '#2e7d32' : '#d32f2f',
              '&:hover': {
                backgroundColor: snackbarSeverity === 'success' ? '#388e3c' : '#ef5350',
              },
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default ModulePage;