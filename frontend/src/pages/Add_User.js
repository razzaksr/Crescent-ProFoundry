import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
  Grid,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  User,
  Briefcase,
  School,
  Hash,
  Mail,
  Phone,
  Lock,
  Users,
  Upload,
  Plus,
  Download,
} from 'lucide-react';
import Papa from 'papaparse';
import { addUser, bulkAddUsers } from '../axios';

const Add_User = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    college: '',
    rollno: '',
    email: '',
    password: '',
    mobile_no: '',
    admin: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Generate CSV and trigger download
  const generateAndDownloadCsv = (data, filename = 'Credential_details.csv') => {
    const headers = ['full_name,email,password,department,college,rollno'];
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        [
          `"${row.full_name.replace(/"/g, '""')}"`,
          row.email,
          `"${(row.plain_password || '').replace(/"/g, '""')}"`,
          `"${row.department.replace(/"/g, '""')}"`,
          `"${row.college.replace(/"/g, '""')}"`,
          row.rollno || '',
        ].join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle download button click
  const handleDownloadCsv = () => {
    const downloadData = csvData.map((row) => ({
      full_name: row.full_name,
      email: row.email,
      plain_password: '',
      department: row.department,
      college: row.college,
      rollno: row.rollno,
    }));
    generateAndDownloadCsv(downloadData, 'Credential_details.csv');
    setSnackbar({
      open: true,
      message: 'CSV downloaded successfully!',
      severity: 'success',
    });
  };

  // Form handling for single user
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    switch (name) {
      case 'full_name':
        return value.trim() ? '' : 'Full name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        return emailRegex.test(value) ? '' : 'Invalid email format';
      case 'mobile_no':
        return value && !mobileRegex.test(value) ? 'Mobile number must be 10 digits' : '';
      case 'department':
        return formData.admin || value.trim() ? '' : 'Department is required';
      case 'college':
        return formData.admin || value.trim() ? '' : 'College is required';
      case 'rollno':
        return ''; // Roll number is now optional for non-admin users
      case 'password':
        if (formData.admin && !value) return 'Password is required for admin users';
        if (value && value.length < 4) return 'Password must be at least 4 characters';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'admin') {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    if (!formData.admin && !formData.password && !formData.mobile_no.trim()) {
      newErrors.mobile_no = 'Mobile number is required when password is empty';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: Object.values(errors).find((err) => err) || 'Please fix the errors',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await addUser(formData);
      setSnackbar({
        open: true,
        message: `User created successfully! Password: ${response.data.plain_password}`,
        severity: 'success',
      });
      setFormData({
        full_name: '',
        department: '',
        college: '',
        rollno: '',
        email: '',
        password: '',
        mobile_no: '',
        admin: false,
      });
      setErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Failed to create user: Server error';
      setSnackbar({
        open: true,
        message: errorMsg.includes('already exists') ? 'User already exists' : errorMsg,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV handling
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (result) => {
        const expectedHeaders = [
          'full_name',
          'department',
          'college',
          'email',
          'mobile_no',
          'admin',
        ];
        const headers = Object.keys(result.data[0] || {}).map((h) => h.trim().toLowerCase());
        const isValid = expectedHeaders.every((h) =>
          h === 'admin' || h === 'rollno' ? true : headers.includes(h)
        );

        if (!isValid) {
          setSnackbar({
            open: true,
            message: `Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}, rollno (optional), admin (optional)`,
            severity: 'error',
          });
          setCsvLoading(false);
          return;
        }

        const formattedData = result.data.map((row, index) => ({
          id: index,
          full_name: row.full_name || '',
          department: row.department || '',
          college: row.college || '',
          rollno: row.rollno || '',
          email: row.email || '',
          mobile_no: row.mobile_no || '',
          admin: row.admin === 'true' || row.admin === true || false,
        }));

        setCsvData(formattedData);
        setSelectedRows([]);
        setSnackbar({
          open: true,
          message: 'CSV loaded successfully!',
          severity: 'success',
        });
        setCsvLoading(false);
      },
      error: (error) => {
        setSnackbar({
          open: true,
          message: 'Failed to parse CSV file',
          severity: 'error',
        });
        setCsvLoading(false);
      },
    });
  };

  const handleBulkCreate = async (selectedOnly = false) => {
    if (csvData.length === 0) {
      setSnackbar({
        open: true,
        message: 'No CSV data to process',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const usersToCreate = selectedOnly
        ? csvData.filter((row) => selectedRows.includes(row.id))
        : csvData;

      if (usersToCreate.length === 0) {
        setSnackbar({
          open: true,
          message: 'No users selected',
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      const response = await bulkAddUsers(usersToCreate);
      const { successes, failures } = response.data;

      if (successes.length > 0) {
        generateAndDownloadCsv(successes, 'Credential_details.csv');
      }

      let message = `Bulk creation completed: ${successes.length} succeeded, ${failures.length} failed.`;
      if (successes.length > 0) {
        message += `\nPasswords: ${successes.map((s) => `${s.email}: ${s.plain_password}`).join('; ')}`;
      }
      if (failures.length > 0) {
        message += `\nFailures: ${failures.map((f) => `${f.email}: ${f.msg}`).join('; ')}`;
      }

      setSnackbar({
        open: true,
        message,
        severity: failures.length > 0 ? 'warning' : 'success',
      });

      if (successes.length > 0) {
        setCsvData([]);
        setSelectedRows([]);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.msg || 'Failed to create users: Server error',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns with Lucide icons
  const columns = [
    {
      field: 'full_name',
      headerName: 'Full Name',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Full Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: isMobile ? 80 : 120,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Department
          </Typography>
        </Box>
      ),
    },
    {
      field: 'college',
      headerName: 'College',
      width: isMobile ? 120 : 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <School size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            College
          </Typography>
        </Box>
      ),
    },
    {
      field: 'rollno',
      headerName: 'Roll Number',
      width: isMobile ? 80 : 120,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hash size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Roll Number
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: isMobile ? 120 : 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Email
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mobile_no',
      headerName: 'Mobile Number',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Mobile Number
          </Typography>
        </Box>
      ),
    },
    {
      field: 'admin',
      headerName: 'Admin',
      width: isMobile ? 70 : 100,
      type: 'boolean',
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Admin
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Single User Form */}
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: isMobile ? '100%' : 600,
          mx: 'auto',
          borderRadius: '16px',
          mb: isMobile ? 2 : 4,
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          align="center"
          sx={{
            mb: isMobile ? 2 : 3,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Add User
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.full_name}
                helperText={errors.full_name || 'Enter full name'}
                required
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.email}
                helperText={errors.email || 'Enter email address'}
                required
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.department}
                helperText={errors.department || (formData.admin ? 'Disabled for admins' : 'Enter department')}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Briefcase size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="College"
                name="college"
                value={formData.college}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.college}
                helperText={errors.college || (formData.admin ? 'Disabled for admins' : 'Enter college')}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll Number"
                name="rollno"
                value={formData.rollno}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.rollno}
                helperText={errors.rollno || (formData.admin ? 'Disabled for admins' : 'Optional roll number')}
                disabled={formData.admin}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Hash size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.mobile_no}
                helperText={errors.mobile_no || 'Enter 10-digit mobile number'}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password || (formData.admin ? 'Required for admins' : 'Optional for non-admins')}
                required={formData.admin}
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={16} color="#0c83c8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#0c83c8' },
                    '&:hover fieldset': { borderColor: '#fc7a46' },
                    '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="admin"
                    checked={formData.admin}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Admin User"
                sx={{ ml: 1 }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                sx={{
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 0.5 : 0.75,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                }}
              >
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* CSV Upload and Bulk Creation */}
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 4,
          maxWidth: isMobile ? '100%' : 900,
          mx: 'auto',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          align="center"
          sx={{
            mb: isMobile ? 2 : 3,
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Bulk Add Non-Admin Users via CSV
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={csvLoading}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={csvLoading}
                startIcon={csvLoading ? <CircularProgress size={16} /> : <Upload size={16} />}
                sx={{
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 0.5 : 0.75,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  borderColor: '#0c83c8',
                  color: '#0c83c8',
                  '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                }}
              >
                {csvLoading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </label>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}
            >
              Upload a CSV with headers: full_name, department, college, email, mobile_no, rollno (optional), admin (optional)
            </Typography>
          </Grid>
        </Grid>
        {csvData.length > 0 && (
          <>
            <Box
              sx={{
                height: isMobile ? 250 : 350,
                width: '100%',
                mb: isMobile ? 2 : 3,
                overflowX: 'auto',
              }}
            >
              <DataGrid
                rows={csvData}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                rowSelectionModel={selectedRows}
                loading={csvLoading}
                sx={{
                  borderRadius: '8px',
                  '& .MuiDataGrid-columnHeaders': {
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                  '& .MuiDataGrid-row': {
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '&:hover': { backgroundColor: '#e3f2fd' },
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                  },
                }}
              />
            </Box>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => handleBulkCreate(false)}
                  disabled={loading || csvData.length === 0}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                  sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  }}
                >
                  {loading ? 'Creating...' : 'Create All'}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => handleBulkCreate(true)}
                  disabled={loading || selectedRows.length === 0}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                  sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#6c757d',
                    '&:hover': { backgroundColor: '#5a6268' },
                  }}
                >
                  {loading ? 'Creating...' : `Create Selected (${selectedRows.length})`}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleDownloadCsv}
                  disabled={csvData.length === 0}
                  startIcon={<Download size={16} />}
                  sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    borderRadius: '8px',
                    borderColor: '#0c83c8',
                    color: '#0c83c8',
                    '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                  }}
                >
                  Download CSV
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Add_User;