import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import dayjs from 'dayjs';
import Admin_Dashboard from '../components/AdminDash';
import { addModule } from '../axios';
import { Book, Code, Calendar, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

// Custom styles
const styles = {
  root: {
    padding: { xs: 2, sm: 4, md: 6 },
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.5s ease-in',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  paper: {
    width: { xs: '100%', sm: '480px', md: '560px' },
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  header: {
    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    p: { xs: 2, sm: 3 },
    color: '#ffffff',
  },
  title: {
    fontWeight: 800,
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
    color: '#ffffff',
  },
  subtitle: {
    fontSize: { xs: '0.9rem', sm: '1rem' },
    opacity: 0.9,
    mt: 1,
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
    transition: 'all 0.2s ease',
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
    transition: 'all 0.2s ease',
  },
};

const Add_Module = () => {
  const [modName, setModName] = useState('');
  const [modTech, setModTech] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const validate = () => {
    const newErrors = {};
    if (!modName.trim()) newErrors.modName = 'Module Name is required';
    if (!modTech.trim()) newErrors.modTech = 'Technologies are required';
    if (!startDate) newErrors.startDate = 'Start Date is required';
    if (!endDate) newErrors.endDate = 'End Date is required';
    else if (dayjs(endDate).isBefore(dayjs(startDate))) {
      newErrors.endDate = 'End Date must be after Start Date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setSnackbarMessage('Please correct the errors in the form');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formattedStartDate = dayjs(startDate).format('DD/MM/YYYY');
    const formattedEndDate = dayjs(endDate).format('DD/MM/YYYY');
    const mod_duration = `${formattedStartDate} - ${formattedEndDate}`;

    const payload = {
      mod_name: modName.trim(),
      mod_tech: modTech.trim(),
      mod_duration,
    };

    try {
      await addModule(payload);
      setSnackbarMessage('Module successfully created!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClear();
    } catch (error) {
      console.error('Error adding module:', error);
      setSnackbarMessage(`Error adding module: ${error.response?.data?.error || error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleClear = () => {
    setModName('');
    setModTech('');
    setStartDate('');
    setEndDate('');
    setErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Box sx={styles.root}>
        <Paper sx={styles.paper}>
          <Box sx={styles.header}>
            <Typography variant="h5" sx={styles.title}>
              Create New Module
            </Typography>
            <Typography variant="subtitle2" sx={styles.subtitle}>
              Add a new module with duration and technology
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
              <TextField
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ ...styles.textField, width: '50%' }}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calendar size={20} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                aria-label="Start Date"
              />
              <TextField
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calendar size={20} color="#0c83c8" />
                    </InputAdornment>
                  ),
                  inputProps: { min: startDate },
                }}
                sx={{ ...styles.textField, width: '50%' }}
                error={!!errors.endDate}
                helperText={errors.endDate}
                aria-label="End Date"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={styles.clearButton}
                aria-label="Clear Form"
              >
                <X size={20} />
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={styles.button}
                aria-label="Submit Module"
              >
                <Save size={20} />
                Submit
              </Button>
            </Box>
          </Box>
        </Paper>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity={snackbarSeverity}
            icon={snackbarSeverity === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            onClose={handleCloseSnackbar}
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

export default Add_Module;