import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, fetchPocById, fetchAllUsers, fetchAllModules, updatePoc } from '../axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import ModuleIcon from '@mui/icons-material/Book';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import Admin_Dashboard from '../components/AdminDash';
import { useTheme } from '@mui/material/styles';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { useNavigate } from 'react-router-dom';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
    left: 'calc(-50% + 28px)',
    right: 'calc(50% + 28px)',
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
    height: 4,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 2,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 48,
  height: 48,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active || ownerState.completed
    ? {
        background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
        boxShadow: '0 4px 12px rgba(12, 131, 200, 0.3)',
      }
    : {}),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <ModuleIcon />,
    2: <PersonIcon />,
    3: <GroupIcon />,
    4: <CheckCircleIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select Module', 'Select POC', 'Select Users', 'Update POC'];

const Update_Poc = () => {
  const [pocs, setPocs] = useState([]);
  const [modules, setIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    pocs: true,
    modules: true,
    users: true,
    pocDetails: false,
  });
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [pocDetailsFetched, setPocDetailsFetched] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const pocIds = JSON.parse(localStorage.getItem('selectedPocIds')) || [];
      const moduleIds = JSON.parse(localStorage.getItem('selectedModuleIds')) || [];
      const userIds = JSON.parse(localStorage.getItem('selectedUserIds')) || [];

      setSelectedPocIds(Array.isArray(pocIds) ? pocIds : []);
      setSelectedModuleIds(Array.isArray(moduleIds) ? moduleIds : []);
      setSelectedUserIds(Array.isArray(userIds) ? userIds : []);
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
    }
  }, []);

  // Fetch POC details if selectedPocIds exists after pocs are loaded
  useEffect(() => {
    if (loading.pocs || pocDetailsFetched || selectedPocIds.length !== 1) return;

    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc?.mod_poc_id) {
      console.error('Selected POC has no valid POC ID');
      setSelectedPocIds([]);
      localStorage.removeItem('selectedPocIds');
      return;
    }

    const fetchInitialPocDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, pocDetails: true }));
        const pocData = await fetchPocById(selectedPoc.mod_poc_id);
        const moduleIds = selectedModuleIds.length > 0 ? selectedModuleIds : pocData.mod_id ? [pocData.mod_id] : [];
        const userIds = Array.isArray(pocData.mod_users) ? pocData.mod_users : [];

        setSelectedModuleIds(moduleIds);
        setSelectedUserIds(userIds);

        localStorage.setItem('selectedModuleIds', JSON.stringify(moduleIds));
        localStorage.setItem('selectedUserIds', JSON.stringify(userIds));

        setPocDetailsFetched(true);
      } catch (error) {
        console.error('Error fetching initial POC details:', error);
        setSnackbarMessage(`Error fetching POC details: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSelectedPocIds([]);
        localStorage.removeItem('selectedPocIds');
      } finally {
        setLoading(prev => ({ ...prev, pocDetails: false }));
      }
    };

    fetchInitialPocDetails();
  }, [loading.pocs, selectedPocIds, pocs, pocDetailsFetched, selectedModuleIds]);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
    };
  }, []);

  // Fetch POCs
  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        setPocs(response.data || []);
        setLoading(prev => ({ ...prev, pocs: false }));
      } catch (error) {
        console.error('Error fetching POCs:', error);
        setSnackbarMessage(`Error fetching POCs: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
  }, []);

  // Fetch Modules
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        setIds(response.data || []);
        setLoading(prev => ({ ...prev, modules: false }));
      } catch (error) {
        console.error('Error fetching modules:', error);
        setSnackbarMessage(`Error fetching modules: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, modules: false }));
      }
    };
    getModules();
  }, []);

  // Fetch Users
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAllUsers();
        setUsers(response.data || []);
        setLoading(prev => ({ ...prev, users: false }));
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbarMessage(`Error fetching users: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    getUsers();
  }, []);

  // Fetch POC details when clicking Next
  const fetchPocDetails = async (pocId) => {
    try {
      setLoading(prev => ({ ...prev, pocDetails: true }));
      const pocData = await fetchPocById(pocId);
      const moduleIds = selectedModuleIds.length > 0 ? selectedModuleIds : pocData.mod_id ? [pocData.mod_id] : [];
      const userIds = Array.isArray(pocData.mod_users) ? pocData.mod_users : [];

      setSelectedModuleIds(moduleIds);
      setSelectedUserIds(userIds);

      localStorage.setItem('selectedModuleIds', JSON.stringify(moduleIds));
      localStorage.setItem('selectedUserIds', JSON.stringify(userIds));

      setPocDetailsFetched(true);
      setLoading(prev => ({ ...prev, pocDetails: false }));
      return true;
    } catch (error) {
      console.error('Error fetching POC details:', error);
      setSnackbarMessage(`Error fetching POC details: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(prev => ({ ...prev, pocDetails: false }));
      return false;
    }
  };

  const getModuleSelectionModel = () => {
    return modules
      .filter(module => selectedModuleIds.includes(module.mod_id))
      .map(module => module._id);
  };

  const getUserSelectionModel = () => {
    return users
      .filter(user => selectedUserIds.includes(user.user_id))
      .map(user => user._id);
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (selectedModuleIds.length !== 1) {
        setSnackbarMessage('Please select exactly one Module');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }
    if (activeStep === 1) {
      if (selectedPocIds.length !== 1) {
        setSnackbarMessage('Please select exactly one POC');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
      if (!selectedPoc?.mod_poc_id) {
        setSnackbarMessage('Selected POC has no valid POC ID');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (!pocDetailsFetched) {
        const success = await fetchPocDetails(selectedPoc.mod_poc_id);
        if (!success) return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleViewDetails = (title, items) => {
    setDetailsDialogTitle(title);
    setDetailsDialogContent(Array.isArray(items) ? items : []);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  const handleOpenPreviewDialog = () => {
    if (selectedPocIds.length !== 1) {
      setSnackbarMessage('Please select exactly one POC to update');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleUpdatePoc = async () => {
    const selectedPoc = pocs.find(poc => poc._id === selectedPocIds[0]);
    if (!selectedPoc) {
      setSnackbarMessage('Selected POC not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetchAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error refreshing users:', error);
      setSnackbarMessage('Error refreshing user data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const validUserIds = users.map(user => user.user_id);
    const invalidUserIds = selectedUserIds.filter(id => !validUserIds.includes(id) || !id);
    if (invalidUserIds.length > 0) {
      console.error('Invalid user_ids:', invalidUserIds);
      setSnackbarMessage(`Invalid user selections: ${invalidUserIds.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updateData = {
      mod_poc_id: selectedPoc.mod_poc_id,
    };

    if (selectedModuleIds.length > 0) {
      const selectedModule = modules.find(m => m.mod_id === selectedModuleIds[0]);
      if (selectedModule?.mod_id) {
        updateData.mod_id = selectedModule.mod_id;
        console.log('Updating POC with mod_id:', selectedModule.mod_id);
      }
    }

    updateData.mod_users = selectedUserIds;
    console.log('Sending update POC payload:', updateData);

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      await updatePoc(updateData);
      setSnackbarMessage('POC updated successfully');
      setSnackbarSeverity('success');

      const updatedPocsResponse = await fetchAllPocs();
      setPocs(updatedPocsResponse.data || []);

      setSelectedPocIds([]);
      setSelectedModuleIds([]);
      setSelectedUserIds([]);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      localStorage.removeItem('selectedUserIds');
      setPocDetailsFetched(false);

      setActiveStep(0);
    } catch (error) {
      console.error('Error updating POC:', error);
      setSnackbarMessage(`Error updating POC: ${error.response?.data?.message || error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const columnsForPocs = [
    { field: 'mod_poc_name', headerName: 'Name', width: 150 },
    { field: 'mod_poc_role', headerName: 'Role', width: 100 },
    { field: 'mod_poc_email', headerName: 'Email', width: 200 },
    { field: 'mod_poc_mobile', headerName: 'Mobile', width: 150 },
  ];

  const columnsForModules = [
    { field: 'mod_name', headerName: 'Module Name', width: 200 },
    { field: 'mod_tech', headerName: 'Technology', width: 150 },
    { field: 'mod_duration', headerName: 'Duration', width: 200 },
  ];

  const columnsForUsers = [
    { field: 'full_name', headerName: 'Full Name', width: 150 },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'college', headerName: 'College', width: 100 },
    { field: 'rollno', headerName: 'Roll No', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
  ];

  const dataGridSx = {
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#0c83c8',
      fontWeight: '600',
      fontSize: '14px',
      textTransform: 'uppercase',
      borderBottom: '2px solid #0c83c8',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: '600',
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f8fafc',
      },
      '&:hover': {
        backgroundColor: '#e3f2fd',
        transition: 'background-color 0.2s ease',
      },
    },
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid #e5e7eb',
      padding: '8px',
    },
    boxShadow: '0 2px 8px rgba(12, 131, 200, 0.05)',
    borderRadius: '12px',
    border: 'none',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
        minWidth: '100px !important',
      },
    },
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
            mb: { xs: 3, sm: 4 },
            backgroundColor: '#ffffff',
          }}
        >
          <Paper
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3 },
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: '#ffffff',
              borderRadius: '16px',
              textAlign: 'center',
              opacity: 0,
              animation: 'fadeIn 0.5s forwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: '700',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              }}
            >
              Update POC
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ mt: 0.5, fontSize: { xs: '12px', sm: '14px' } }}
            >
              Manage POC assignments
            </Typography>
          </Paper>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
            sx={{
              padding: { xs: '12px 0', sm: '16px 0' },
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.85rem', sm: '1rem' },
                fontWeight: '500',
                color: activeStep >= steps.indexOf(steps[0]) ? '#0c83c8' : '#6b7280',
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
            p: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
            backgroundColor: '#ffffff',
          }}
        >
          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Module
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add_module')}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  }}
                >
                  Add Module
                </Button>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                <DataGrid
                  rows={modules}
                  columns={columnsForModules}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.modules}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={getModuleSelectionModel()}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection
                      .map(id => modules.find(m => m._id === id)?.mod_id)
                      .filter(Boolean);
                    setSelectedModuleIds(updatedSelection.length > 0 ? [updatedSelection[updatedSelection.length - 1]] : []);
                    localStorage.setItem('selectedModuleIds', JSON.stringify(updatedSelection));
                    console.log('Module selection updated:', updatedSelection);
                  }}
                  sx={dataGridSx}
                  aria-label="Modules DataGrid"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedModuleIds.length !== 1}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    '&:disabled': {
                      backgroundColor: '#b0bec5',
                      color: '#ffffff',
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select POC
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add_poc')}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  }}
                >
                  Add POC
                </Button>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                <DataGrid
                  rows={pocs}
                  columns={columnsForPocs}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.pocs}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedPocIds}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedPocIds(updatedSelection);
                    localStorage.setItem('selectedPocIds', JSON.stringify(updatedSelection));
                    setSelectedUserIds([]);
                    localStorage.removeItem('selectedUserIds');
                    setPocDetailsFetched(false);
                  }}
                  sx={dataGridSx}
                  aria-label="POCs DataGrid"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#fc7a46',
                      color: '#fc7a46',
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedPocIds.length !== 1 || loading.pocDetails}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    '&:disabled': {
                      backgroundColor: '#b0bec5',
                      color: '#ffffff',
                    },
                  }}
                >
                  {loading.pocDetails ? <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} /> : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add_user')}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  }}
                >
                  Add User
                </Button>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                <DataGrid
                  rows={users}
                  columns={columnsForUsers}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.users}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={getUserSelectionModel()}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection
                      .map(id => users.find(u => u._id === id)?.user_id)
                      .filter(id => id && typeof id === 'string');
                    console.log('User selection updated:', updatedSelection);
                    setSelectedUserIds(updatedSelection);
                    localStorage.setItem('selectedUserIds', JSON.stringify(updatedSelection));
                  }}
                  sx={dataGridSx}
                  aria-label="Users DataGrid"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#fc7a46',
                      color: '#fc7a46',
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    color: '#ffffff',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 3 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '600',
                  fontSize: { xs: '1.2rem', sm: '1.4rem' },
                }}
              >
                Review and Confirm
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  color: '#4b5563',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                Please review your selections below before confirming the update.
              </Typography>
              <Box
                sx={{
                  mb: 3,
                  p: { xs: 1.5, sm: 2 },
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: '600',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  Selected Module
                </Typography>
                {selectedModuleIds.length === 1 ? (
                  (() => {
                    const module = modules.find(mod => mod.mod_id === selectedModuleIds[0]);
                    return module ? (
                      <Box sx={{ '& > p': { mb: 0.5, fontSize: { xs: '0.9rem', sm: '0.95rem' } } }}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {module.mod_name || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Technology:</strong> {module.mod_tech || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {module.mod_duration || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Module ID:</strong> {module.mod_id || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#dc2626', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                        No Module found
                      </Typography>
                    );
                  })()
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: '#6b7280', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                  >
                    No Module selected
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  mb: 3,
                  p: { xs: 1.5, sm: 2 },
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: '600',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  Selected POC
                </Typography>
                {selectedPocIds.length === 1 ? (
                  (() => {
                    const poc = pocs.find(poc => poc._id === selectedPocIds[0]);
                    return poc ? (
                      <Box sx={{ '& > p': { mb: 0.5, fontSize: { xs: '0.9rem', sm: '0.95rem' } } }}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {poc.mod_poc_name || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Role:</strong> {poc.mod_poc_role || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {poc.mod_poc_email || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Mobile:</strong> {poc.mod_poc_mobile || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>POC ID:</strong> {poc.mod_poc_id || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#dc2626', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                        No POC found
                      </Typography>
                    );
                  })()
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: '#6b7280', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                  >
                    No POC selected
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  mb: 3,
                  p: { xs: 1.5, sm: 2 },
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: '600',
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  Selected Users
                </Typography>
                {selectedUserIds.length > 0 ? (
                  <TableContainer sx={{ borderRadius: '8px', overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                            '& th': {
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              padding: '10px 8px',
                            },
                          }}
                        >
                          <TableCell>Full Name</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>College</TableCell>
                          <TableCell>Roll No</TableCell>
                          <TableCell>Email</TableCell>
                          {/* <TableCell>User ID</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users
                          .filter(user => selectedUserIds.includes(user.user_id))
                          .map(user => (
                            <TableRow
                              key={user._id}
                              sx={{
                                '&:hover': { backgroundColor: '#e3f2fd' },
                                '& td': {
                                  padding: '8px',
                                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                  borderBottom: '1px solid #e5e7eb',
                                },
                              }}
                            >
                              <TableCell>{user.full_name || 'N/A'}</TableCell>
                              <TableCell>{user.department || 'N/A'}</TableCell>
                              <TableCell>{user.college || 'N/A'}</TableCell>
                              <TableCell>{user.rollno || 'N/A'}</TableCell>
                              <TableCell>{user.email || 'N/A'}</TableCell>
                              {/* <TableCell>{user.user_id || 'N/A'}</TableCell> */}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: '#6b7280', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                  >
                    No Users selected
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#0c83c8',
                    borderColor: '#0c83c8',
                    fontWeight: '500',
                    px: 3,
                    py: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#fc7a46',
                      color: '#fc7a46',
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  Previous
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        {activeStep === 3 && (
          <Fab
            variant="extended"
            onClick={handleOpenPreviewDialog}
            disabled={updateLoading || selectedPocIds.length !== 1}
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 20 },
              right: { xs: 16, sm: 20 },
              zIndex: 1000,
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: '#ffffff',
              fontWeight: '500',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(12, 131, 200, 0.15)',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
              '&:disabled': {
                backgroundColor: '#b0bec5',
                color: '#ffffff',
                boxShadow: 'none',
              },
            }}
            aria-label="Update POC"
          >
            {updateLoading ? <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
            Update POC
          </Fab>
        )}
        <Dialog
          open={previewDialogOpen}
          onClose={handleClosePreviewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 131, 200, 0.1)',
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              py: 1.5,
            }}
          >
            Confirm POC Update
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 },
              backgroundColor: '#ffffff',
            }}
          >
            <DialogContentText
              sx={{
                color: '#4b5563',
                fontSize: { xs: '0.95rem', sm: '1rem' },
                mb: 2,
              }}
            >
              Review the changes below for the selected POC:
            </DialogContentText>
            {selectedPocIds.length === 1 && (
              <Typography
                variant="body2"
                sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '0.95rem' }, color: '#1f2937' }}
              >
                <strong>POC:</strong> {pocs.find(poc => poc._id === selectedPocIds[0])?.mod_poc_name || 'Unknown'}
              </Typography>
            )}
            {selectedModuleIds.length === 1 && (
              <Typography
                variant="body2"
                sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '0.95rem' }, color: '#1f2937' }}
              >
                <strong>Module:</strong> {modules.find(mod => mod.mod_id === selectedModuleIds[0])?.mod_name || 'Unknown'}
              </Typography>
            )}
            {selectedUserIds.length > 0 && (
              <Typography
                variant="body2"
                sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '0.95rem' }, color: '#1f2937' }}
              >
                <strong>Users:</strong> {selectedUserIds.length} selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              backgroundColor: '#f5f7fa',
            }}
          >
            <Button
              onClick={handleClosePreviewDialog}
              sx={{
                color: '#6b7280',
                fontWeight: '500',
                textTransform: 'none',
                '&:hover': { color: '#0c83c8', backgroundColor: '#e3f2fd' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePoc}
              variant="contained"
              disabled={updateLoading}
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                color: '#ffffff',
                fontWeight: '500',
                px: 3,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                '&:disabled': {
                  backgroundColor: '#b0bec5',
                  color: '#ffffff',
                },
              }}
            >
              {updateLoading ? <CircularProgress size={20} sx={{ color: '#ffffff', mr: 1 }} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 131, 200, 0.1)',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              py: 1.5,
            }}
          >
            {detailsDialogTitle}
            <IconButton
              onClick={handleCloseDetailsDialog}
              sx={{
                color: '#0c83c8',
                '&:hover': { color: '#fc7a46' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 },
              backgroundColor: '#ffffff',
            }}
          >
            <Box
              sx={{
                maxHeight: '300px',
                overflow: 'auto',
                fontFamily: '"Roboto Mono", monospace',
                backgroundColor: '#f9fafb',
                p: 2,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              {detailsDialogContent.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #e5e7eb' : 'none',
                    '&:hover': { backgroundColor: '#e3f2fd' },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      color: '#1f2937',
                    }}
                  >
                    {item}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(item)}
                    sx={{
                      color: '#0c83c8',
                      '&:hover': { color: '#fc7a46' },
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              backgroundColor: '#f5f7fa',
            }}
          >
            <Button
              onClick={() => handleCopyToClipboard(detailsDialogContent.join('\n'))}
              startIcon={<ContentCopyIcon />}
              sx={{
                color: '#0c83c8',
                fontWeight: '500',
                textTransform: 'none',
                '&:hover': { color: '#fc7a46', backgroundColor: '#e3f2fd' },
              }}
            >
              Copy All
            </Button>
            <Button
              onClick={handleCloseDetailsDialog}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                color: '#ffffff',
                fontWeight: '500',
                px: 3,
                py: 1,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: { xs: 6, sm: 2 }, mr: 2 }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: '100%',
              background: snackbarSeverity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
              color: '#ffffff',
              fontSize: '0.9rem',
              '& .MuiAlert-icon': {
                color: '#ffffff',
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

export default Update_Poc;