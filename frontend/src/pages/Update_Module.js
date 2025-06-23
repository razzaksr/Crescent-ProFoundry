import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Modal,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Edit, Book, Code, Save, X, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';
import { fetchAllModules, updateModule } from '../axios';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Modal styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '480px', md: '560px' },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
  overflow: 'hidden',
  border: '1px solid #e0e0e0',
};

// Component styles
const styles = {
  root: {
    p: { xs: 2, sm: 3, md: 4 },
    bgcolor: '#f5f7fa',
    minHeight: '100vh',
  },
  paper: {
    p: { xs: 1.5, sm: 2, md: 3 },
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
    bgcolor: '#ffffff',
  },
  header: {
    mb: 4,
    p: { xs: 2, sm: 3 },
    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    color: '#ffffff',
    borderRadius: '16px',
    textAlign: 'center',
  },
  title: {
    fontWeight: 700,
    fontSize: { xs: '1.8rem', sm: '2.2rem' },
    color: '#ffffff',
  },
  subtitle: {
    mt: 0.5,
    fontSize: { xs: '12px', sm: '14px' },
    color: '#ffffff',
  },
  form: {
    p: { xs: 2, sm: 3 },
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: '#e0e0e0' },
      '&:hover fieldset': { borderColor: '#0c83c8' },
      '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
    },
    '& .MuiInputLabel-root': {
      color: '#555',
      '&.Mui-focused': { color: '#0c83c8' },
    },
  },
  button: {
    backgroundColor: '#0c83c8',
    '&:hover': { backgroundColor: '#fc7a46' },
    fontWeight: 600,
    px: 4,
    py: 1,
    borderRadius: '12px',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  clearButton: {
    color: '#0c83c8',
    borderColor: '#0c83c8',
    '&:hover': { borderColor: '#fc7a46', backgroundColor: '#fff3e0' },
    fontWeight: 600,
    px: 4,
    py: 1,
    borderRadius: '12px',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  dataGrid: {
    borderRadius: '12px',
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#0c83c8',
      fontWeight: 600,
      fontSize: { xs: '14px', sm: '15px' },
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': { backgroundColor: '#f8fafc' },
      '&:hover': { backgroundColor: '#e3f2fd' },
    },
    '& .MuiDataGrid-cell': {
      fontSize: { xs: '12px', sm: '14px' },
      borderBottom: '1px solid #e5e7eb',
    },
    boxShadow: '0 2px 8px rgba(12, 131, 200, 0.05)',
    border: 'none',
  },
};

const UpdateModule = () => {
  const [modules, setModules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modName, setModName] = useState('');
  const [modTech, setModTech] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(true);

  // Fetch all modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetchAllModules();
        const formattedModules = response.data.map((module) => {
          const [start, end] = module.mod_duration.split(' - ');
          return {
            ...module,
            startDate: dayjs(start, 'DD/MM/YYYY'),
            endDate: dayjs(end, 'DD/MM/YYYY'),
          };
        });
        setModules(formattedModules);
      } catch (error) {
        setSnackbarMessage(
          `Failed to fetch modules: ${error.response?.data?.error || error.message || 'Unknown error'}`
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Handle edit button click (open dialog)
  const handleEditDialog = (module) => {
    setSelectedModule(module);
    setOpenDialog(true);
  };

  // Confirm edit
  const handleConfirmEdit = () => {
    setModName(selectedModule.mod_name);
    setModTech(selectedModule.mod_tech);
    setStartDate(selectedModule.startDate);
    setEndDate(selectedModule.endDate);
    setOpenDialog(false);
    setOpenModal(true);
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!modName.trim()) newErrors.modName = 'Module Name is required';
    if (!modTech.trim()) newErrors.modTech = 'Technologies are required';
    if (!startDate || !startDate.isValid()) newErrors.startDate = 'Start Date is required';
    if (!endDate || !endDate.isValid()) newErrors.endDate = 'End Date is required';
    else if (endDate.isBefore(startDate)) {
      newErrors.endDate = 'End Date must be after Start Date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) {
      setSnackbarMessage('Please correct the errors in the form');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formattedStartDate = startDate.format('DD/MM/YYYY');
    const formattedEndDate = endDate.format('DD/MM/YYYY');
    const mod_duration = `${formattedStartDate} - ${formattedEndDate}`;

    const payload = {
      mod_id: selectedModule.mod_id,
      mod_name: modName.trim(),
      mod_tech: modTech.trim(),
      mod_duration,
    };

    try {
      const response = await updateModule(payload);
      setModules(
        modules.map((mod) =>
          mod.mod_id === selectedModule.mod_id
            ? {
                ...response.data,
                startDate: dayjs(formattedStartDate, 'DD/MM/YYYY'),
                endDate: dayjs(formattedEndDate, 'DD/MM/YYYY'),
              }
            : mod
        )
      );
      setSnackbarMessage('Module updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      setSnackbarMessage(`Error updating module: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedModule(null);
    setModName('');
    setModTech('');
    setStartDate(null);
    setEndDate(null);
    setErrors({});
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedModule(null);
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // DataGrid columns
  const columns = [
    {
      field: 'mod_name',
      headerName: 'Module Name',
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Module Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_tech',
      headerName: 'Technologies',
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Technologies
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_duration',
      headerName: 'Duration',
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Duration
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Actions
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Button
          onClick={() => handleEditDialog(params.row)}
          sx={{ minWidth: 'auto', p: 1, color: '#0c83c8' }}
          aria-label={`Edit ${params.row.mod_name}`}
        >
          <Edit size={20} />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Admin_Dashboard />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={styles.root}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
              mb: { xs: 3, sm: 4 },
              bgcolor: '#ffffff',
            }}
          >
            <Paper sx={styles.header}>
              <Typography variant="h4" sx={styles.title}>
                Module Management
              </Typography>
              <Typography variant="subtitle2" sx={styles.subtitle}>
                View and manage all modules
              </Typography>
            </Paper>
            <Paper sx={styles.paper}>
              <Box sx={{ height: { xs: 400, sm: 600 }, width: '100%' }}>
                {loading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : (
                  <DataGrid
                    rows={modules}
                    columns={columns}
                    getRowId={(row) => row.mod_id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20]}
                    sx={styles.dataGrid}
                  />
                )}
              </Box>
            </Paper>
          </Paper>

          {/* Edit Confirmation Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to edit the module "{selectedModule?.mod_name}"?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmEdit} color="primary" autoFocus>
                Edit
              </Button>
            </DialogActions>
          </Dialog>

          {/* Update Module Modal */}
          <Modal open={openModal} onClose={handleCloseModal}>
            <Paper sx={modalStyle}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: '#ffffff',
                  borderRadius: '16px 16px 0 0',
                }}
              >
                <Typography variant="h5" sx={styles.title}>
                  Update Module
                </Typography>
                <Typography variant="subtitle2" sx={styles.subtitle}>
                  Modify module details
                </Typography>
              </Box>
              <Box sx={styles.form}>
                <TextField
                  label="Module Name"
                  fullWidth
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  sx={styles.textField}
                  error={!!errors.modName}
                  helperText={errors.modName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Book size={20} color="#0c83c8" />
                      </InputAdornment>
                    ),
                  }}
                  aria-label="Module Name"
                />
                <TextField
                  label="Module Technologies"
                  fullWidth
                  value={modTech}
                  onChange={(e) => setModTech(e.target.value)}
                  placeholder="e.g., MERN, React, Node.js"
                  sx={styles.textField}
                  error={!!errors.modTech}
                  helperText={errors.modTech}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code size={20} color="#0c83c8" />
                      </InputAdornment>
                    ),
                  }}
                  aria-label="Module Technologies"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="From Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    format="DD/MM/YYYY"
                    sx={{ ...styles.textField, width: '50%' }}
                    slotProps={{
                      textField: {
                        error: !!errors.startDate,
                        helperText: errors.startDate,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Calendar size={20} color="#0c83c8" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                  <DatePicker
                    label="To Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    format="DD/MM/YYYY"
                    minDate={startDate}
                    sx={{ ...styles.textField, width: '50%' }}
                    slotProps={{
                      textField: {
                        error: !!errors.endDate,
                        helperText: errors.endDate,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Calendar size={20} color="#0c83c8" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                    sx={styles.clearButton}
                    aria-label="Cancel Update"
                  >
                    <X size={20} />
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={styles.button}
                    aria-label="Update Module"
                  >
                    <Save size={20} />
                    Update
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Modal>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
              variant="filled"
              sx={{
                background:
                  snackbarSeverity === 'success'
                    ? 'linear-gradient(90deg, #0c83c8, #fc7a46)'
                    : undefined,
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </>
  );
};

export default UpdateModule;