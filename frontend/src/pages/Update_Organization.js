import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  Fab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllOrganizations, fetchAllModules, updateOrganization } from '../axios';
import { Save, X, User, Mail, Phone, MapPin, Copy, List, Building, Search, CheckCircle } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';
import { stepConnectorClasses } from '@mui/material/StepConnector';

// Custom Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#e0e0e0',
  zIndex: 1,
  color: '#fff',
  width: theme.breakpoints.down('sm') ? 36 : 40,
  height: theme.breakpoints.down('sm') ? 36 : 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active || ownerState.completed
    ? {
        background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
      }
    : {}),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Building size={20} />,
    2: <List size={20} />,
    3: <CheckCircle size={20} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select Organization', 'Select Modules', 'Review and Update'];

const Update_Organization = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    organizations: true,
    modules: true,
  });
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);

  // Safe stringification for search filtering
  const safeStringify = (value) => {
    if (Array.isArray(value)) return value.map(v => String(v)).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(safeStringify).join(' ');
    return String(value || '');
  };

  // Fetch Organizations data
  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const response = await fetchAllOrganizations();
        const orgData = response.data || [];
        setOrganizations(orgData);
        setFilteredOrganizations(orgData);
        setLoading((prev) => ({ ...prev, organizations: false }));
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setSnackbarMessage(`Error fetching organizations: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading((prev) => ({ ...prev, organizations: false }));
      }
    };
    getOrganizations();
  }, []);

  // Fetch Modules data
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        const moduleData = response.data || [];
        setModules(moduleData);
        setFilteredModules(moduleData);
        setLoading((prev) => ({ ...prev, modules: false }));
      } catch (error) {
        console.error('Error fetching modules:', error);
        setSnackbarMessage(`Error fetching modules: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading((prev) => ({ ...prev, modules: false }));
      }
    };
    getModules();
  }, []);

  // Filter organizations based on search query
  useEffect(() => {
    const filtered = organizations.filter(org =>
      safeStringify(org).toLowerCase().includes(orgSearchQuery.toLowerCase())
    );
    setFilteredOrganizations(filtered);
  }, [orgSearchQuery, organizations]);

  // Filter modules based on search query
  useEffect(() => {
    const filtered = modules.filter(mod =>
      safeStringify(mod).toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
    setFilteredModules(filtered);
  }, [moduleSearchQuery, modules]);

  // Update selectedModuleIds when an organization is selected
  useEffect(() => {
    if (selectedOrganizationIds.length === 1) {
      const selectedOrg = organizations.find((org) => org._id === selectedOrganizationIds[0]);
      if (selectedOrg && selectedOrg.mod_id) {
        const preSelectedModuleIds = modules
          .filter((mod) => selectedOrg.mod_id.includes(mod.mod_id))
          .map((mod) => mod._id);
        setSelectedModuleIds(preSelectedModuleIds);
        localStorage.setItem('selectedModuleIds', JSON.stringify(preSelectedModuleIds));
        setDataGridKey(prev => prev + 1);
      } else {
        setSelectedModuleIds([]);
        localStorage.setItem('selectedModuleIds', JSON.stringify([]));
        setDataGridKey(prev => prev + 1);
      }
    } else {
      setSelectedModuleIds([]);
      localStorage.setItem('selectedModuleIds', JSON.stringify([]));
      setDataGridKey(prev => prev + 1);
    }
  }, [selectedOrganizationIds, organizations, modules]);

  // Handle stepper navigation
  const handleNext = () => {
    if (activeStep === 0 && selectedOrganizationIds.length !== 1) {
      setSnackbarMessage('Please select exactly one organization to proceed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevious = () => {
    if (activeStep === 1) {
      setSelectedModuleIds([]);
      localStorage.removeItem('selectedModuleIds');
      setDataGridKey(prev => prev + 1);
    }
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle opening preview dialog
  const handleOpenPreviewDialog = () => {
    if (selectedOrganizationIds.length !== 1) {
      setSnackbarMessage('Please select exactly one organization to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  // Handle closing preview dialog
  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  // Handle updating organization after confirmation
  const handleUpdateOrganization = async () => {
    const selectedOrg = organizations.find((org) => org._id === selectedOrganizationIds[0]);
    if (!selectedOrg) {
      setSnackbarMessage('Selected organization not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updateData = {
      org_id: selectedOrg.org_id,
    };

    if (selectedModuleIds.length > 0) {
      updateData.mod_id = modules
        .filter((mod) => selectedModuleIds.includes(mod._id))
        .map((mod) => mod.mod_id);
    }

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      await updateOrganization(updateData);
      setSnackbarMessage('Organization updated successfully');
      setSnackbarSeverity('success');

      const updatedOrgsResponse = await fetchAllOrganizations();
      const orgData = updatedOrgsResponse.data || [];
      setOrganizations(orgData);
      setFilteredOrganizations(orgData);

      setSelectedOrganizationIds([]);
      setSelectedModuleIds([]);
      localStorage.removeItem('selectedOrganizationIds');
      localStorage.removeItem('selectedModuleIds');
      setActiveStep(0);
      setDataGridKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating organization:', error);
      setSnackbarMessage(`Error updating organization: ${error.response?.data?.error || error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Handle copy to clipboard
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

  // Organization DataGrid columns
  const columnsForOrganizations = [
    {
      field: 'org_name',
      headerName: 'Name',
      minWidth: isMobile ? 120 : 300,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Name
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <User size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'org_email',
      headerName: 'Email',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Email
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Mail size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'org_contact',
      headerName: 'Contact',
      minWidth: isMobile ? 120 : 150,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Contact
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Phone size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'org_address',
      headerName: 'Address',
      minWidth: isMobile ? 150 : 300,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Address
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            py: 0.1,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          <MapPin size={20} color="#0c83c8" style={{ marginTop: 4 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#333',
              fontSize: isMobile ? '12px' : '14px',
              lineHeight: 1.4,
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];

  // Module DataGrid columns
  const columnsForModules = [
    {
      field: 'mod_name',
      headerName: 'Module Name',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Module Name
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <List size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_duration',
      headerName: 'Duration',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Duration
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <List size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_tech',
      headerName: 'Technology',
      minWidth: isMobile ? 120 : 150,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Technology
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <List size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: isMobile ? '12px' : '14px' }}>
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
  ];

  const dataGridSx = {
    borderRadius: '8px',
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#0c83c8',
      fontWeight: 'bold',
      fontSize: isMobile ? '14px' : '15px',
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f9f9f9',
      },
      '&:hover': {
        backgroundColor: '#e3f2fd',
      },
    },
    '& .MuiDataGrid-cell': {
      fontSize: isMobile ? '12px' : '14px',
      padding: '12px',
      borderBottom: '1px solid #e0e0e0',
    },
    '& .MuiDataGrid-footerContainer': {
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e0e0e0',
      color: '#0c83c8',
      fontWeight: 600,
    },
    '& .MuiDataGrid-overlay': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    border: 'none',
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          py: 6,
          px: { xs: 2, sm: 6 },
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            mb: 4,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              mb: 4,
              p: 3,
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: 'white',
              borderRadius: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building size={24} />
              <Typography variant="h5" fontWeight={600}>
                <span style={{ color: '#fff' }}>Update </span>
                <span style={{ padding: '4px 8px', borderRadius: '6px' }}>Organization</span>
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Manage organization configurations
            </Typography>
          </Paper>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 'bold',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          }}
        >
          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                }}
              >
                Select Organization
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search organizations..."
                  value={orgSearchQuery}
                  onChange={(e) => setOrgSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color="#0c83c8" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#0c83c8' },
                      '&:hover fieldset': { borderColor: '#fc7a46' },
                      '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                    },
                  }}
                />
              </Box>
              <Box sx={{ height: isMobile ? 300 : 450, width: '100%' }}>
                <DataGrid
                  key={`org-grid-${dataGridKey}`}
                  rows={filteredOrganizations}
                  columns={columnsForOrganizations}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.organizations}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedOrganizationIds}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedOrganizationIds(updatedSelection);
                    localStorage.setItem('selectedOrganizationIds', JSON.stringify(updatedSelection));
                    setDataGridKey(prev => prev + 1);
                  }}
                  sx={dataGridSx}
                  aria-label="Organizations Data Grid"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedOrganizationIds.length !== 1}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                }}
              >
                Select Modules
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search modules..."
                  value={moduleSearchQuery}
                  onChange={(e) => setModuleSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color="#0c83c8" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#0c83c8' },
                      '&:hover fieldset': { borderColor: '#fc7a46' },
                      '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                    },
                  }}
                />
              </Box>
              <Box sx={{ height: isMobile ? 300 : 450, width: '100%' }}>
                <DataGrid
                  key={`module-grid-${dataGridKey}`}
                  rows={filteredModules}
                  columns={columnsForModules}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.modules}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedModuleIds}
                  onRowSelectionModelChange={(newSelection) => {
                    setSelectedModuleIds(newSelection);
                    localStorage.setItem('selectedModuleIds', JSON.stringify(newSelection));
                    setDataGridKey(prev => prev + 1);
                  }}
                  sx={dataGridSx}
                  aria-label="Modules Data Grid"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                    '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                }}
              >
                Review and Update
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                Please review your selections below before confirming the update.
              </Typography>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Selected Organization
                </Typography>
                {selectedOrganizationIds.length === 1 ? (
                  (() => {
                    const org = organizations.find(org => org._id === selectedOrganizationIds[0]);
                    return org ? (
                      <Box sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                        <Typography variant="body2"><strong>Name:</strong> {org.org_name || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Email:</strong> {org.org_email || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Contact:</strong> {org.org_contact || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Address:</strong> {org.org_address || 'N/A'}</Typography>
                        {/* <Typography variant="body2"><strong>Organization ID:</strong> {org.org_id || 'N/A'}</Typography> */}
                      </Box>
                    ) : (
                      <Alert severity="warning" sx={{ borderRadius: '12px', fontSize: isMobile ? '12px' : '14px' }}>
                        No organization found
                      </Alert>
                    );
                  })()
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: '12px', fontSize: isMobile ? '12px' : '14px' }}>
                    No organization selected
                  </Alert>
                )}
              </Box>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Selected Modules ({selectedModuleIds.length})
                </Typography>
                {selectedModuleIds.length > 0 ? (
                  modules
                    .filter(mod => selectedModuleIds.includes(mod._id))
                    .map(mod => (
                      <Box key={mod._id} sx={{ mb: 1, fontSize: isMobile ? '12px' : '14px' }}>
                        <Typography variant="body2"><strong>Name:</strong> {mod.mod_name || 'N/A'}</Typography>
                        {/* <Typography variant="body2"><strong>Module ID:</strong> {mod.mod_id || 'N/A'}</Typography> */}
                      </Box>
                    ))
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '12px', fontSize: isMobile ? '12px' : '14px' }}>
                    No modules selected
                  </Alert>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                    '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                  }}
                >
                  Previous
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        {activeStep === 2 && (
          <Fab
            onClick={handleOpenPreviewDialog}
            disabled={updateLoading || selectedOrganizationIds.length !== 1}
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 20 },
              right: { xs: 16, sm: 20 },
              zIndex: 1000,
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: 'white',
              '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
            }}
            aria-label="Update Organization"
          >
            {updateLoading ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
          </Fab>
        )}
        <Dialog
          open={previewDialogOpen}
          onClose={handleClosePreviewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' },
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: 'white',
              fontSize: isMobile ? '16px' : '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Confirm Organization Update
            <IconButton
              onClick={handleClosePreviewDialog}
              sx={{ color: '#ffffff' }}
              aria-label="Close preview dialog"
            >
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <DialogContentText sx={{ fontSize: isMobile ? '14px' : '16px', color: '#333' }}>
              Review the changes below:
            </DialogContentText>
            {selectedOrganizationIds.length === 1 && (
              (() => {
                const org = organizations.find(org => org._id === selectedOrganizationIds[0]);
                return org ? (
                  <Box sx={{ mt: 2, fontSize: isMobile ? '12px' : '14px' }}>
                    <Typography variant="body2"><strong>Organization:</strong> {org.org_name || 'Unknown'}</Typography>
                    <Typography variant="body2"><strong>Organization ID:</strong> {org.org_id || 'Unknown'}</Typography>
                  </Box>
                ) : null;
              })()
            )}
            {selectedModuleIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>Modules:</strong> {selectedModuleIds.length} selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleClosePreviewDialog}
              sx={{
                color: '#0c83c8',
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateOrganization}
              disabled={updateLoading}
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
              }}
            >
              {updateLoading ? <CircularProgress size={16} color="inherit" /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: '100%',
              background: snackbarSeverity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Update_Organization;