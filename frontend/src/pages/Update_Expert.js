import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Collapse,
  ListItemButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { Slide } from '@mui/material';
import { User, Users, Book, Save, Search, Copy, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAllExperts, fetchAllPocs, fetchAllModules, updateExpert } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

// Custom Stepper Connector
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#0c83c8',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#fc7a46',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.grey[300],
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Custom Step Icon
const CustomStepIcon = styled('div')(({ theme, ownerState }) => ({
  display: 'flex',
  height: 36,
  width: 36,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: ownerState.active || ownerState.completed
    ? 'linear-gradient(90deg, #0c83c8, #fc7a46)'
    : theme.palette.grey[300],
  color: 'white',
  fontWeight: 'bold',
  border: ownerState.active ? '2px solid #0c83c8' : 'none',
  boxShadow: ownerState.active ? '0 0 8px rgba(12, 131, 200, 0.5)' : 'none',
  '& svg': {
    fontSize: 20,
  },
}));

const Update_Expert = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for stepper
  const [activeStep, setActiveStep] = useState(0);

  // State for data
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [pocs, setPocs] = useState([]);
  const [filteredPocs, setFilteredPocs] = useState([]);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);

  // State for search queries
  const [expertSearchQuery, setExpertSearchQuery] = useState('');
  const [pocSearchQuery, setPocSearchQuery] = useState('');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  // State for loading
  const [loading, setLoading] = useState({
    experts: true,
    pocs: true,
    modules: true,
  });

  // State for selections
  const [selectedExpertIds, setSelectedExpertIds] = useState([]);
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  // State for update operation
  const [updateLoading, setUpdateLoading] = useState(false);

  // State for collapsible sections in review
  const [expertSectionOpen, setExpertSectionOpen] = useState(true);
  const [pocSectionOpen, setPocSectionOpen] = useState(true);
  const [moduleSectionOpen, setModuleSectionOpen] = useState(true);

  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for DataGrid re-rendering
  const [dataGridKey, setDataGridKey] = useState(0);

  // Stepper steps
  const steps = [
    { label: 'Select Expert', icon: User },
    { label: 'Select POCs', icon: Users },
    { label: 'Select Modules', icon: Book },
    { label: 'Review & Submit', icon: Save },
  ];

  // Safe stringification for search filtering
  const safeStringify = (value) => {
    if (Array.isArray(value)) return value.map(v => String(v)).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(safeStringify).join(' ');
    return String(value || '');
  };

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const expertIds = JSON.parse(localStorage.getItem('selectedExpertIds')) || [];
      const pocIds = JSON.parse(localStorage.getItem('selectedPocIds')) || [];
      const moduleIds = JSON.parse(localStorage.getItem('selectedModuleIds')) || [];

      setSelectedExpertIds(Array.isArray(expertIds) ? expertIds : []);
      setSelectedPocIds(Array.isArray(pocIds) ? pocIds : []);
      setSelectedModuleIds(Array.isArray(moduleIds) ? moduleIds : []);
    } catch (err) {
      setSnackbarMessage('Failed to load saved selections. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      localStorage.removeItem('selectedExpertIds');
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
    }
  }, []);

  // Clear localStorage on page leave
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedExpertIds');
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
    };
  }, []);

  // Fetch Experts data
  useEffect(() => {
    const getExperts = async () => {
      try {
        const response = await fetchAllExperts();
        const expertData = response.data || [];
        setExperts(expertData);
        setFilteredExperts(expertData);
        setLoading(prev => ({ ...prev, experts: false }));
      } catch (error) {
        setSnackbarMessage('Unable to fetch experts. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, experts: false }));
      }
    };
    getExperts();
  }, []);

  // Fetch POCs data
  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        const pocData = response.data || [];
        setPocs(pocData);
        setFilteredPocs(pocData);
        setLoading(prev => ({ ...prev, pocs: false }));
      } catch (error) {
        setSnackbarMessage('Unable to fetch POCs. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
  }, []);

  // Fetch Modules data
  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetchAllModules();
        const moduleData = response.data || [];
        setModules(moduleData);
        setFilteredModules(moduleData);
        setLoading(prev => ({ ...prev, modules: false }));
      } catch (error) {
        setSnackbarMessage('Unable to fetch modules. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(prev => ({ ...prev, modules: false }));
      }
    };
    getModules();
  }, []);

  // Filter data based on search queries
  useEffect(() => {
    const filtered = experts.filter(expert =>
      safeStringify(expert).toLowerCase().includes(expertSearchQuery.toLowerCase())
    );
    setFilteredExperts(filtered);
  }, [expertSearchQuery, experts]);

  useEffect(() => {
    const filtered = pocs.filter(poc =>
      safeStringify(poc).toLowerCase().includes(pocSearchQuery.toLowerCase())
    );
    setFilteredPocs(filtered);
  }, [pocSearchQuery, pocs]);

  useEffect(() => {
    const filtered = modules.filter(module =>
      safeStringify(module).toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
    setFilteredModules(filtered);
  }, [moduleSearchQuery, modules]);

  // Handle stepper navigation
  const handleNext = () => {
    if (activeStep === 0 && selectedExpertIds.length !== 1) {
      setSnackbarMessage('Please select exactly one expert to proceed.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (activeStep === steps.length - 1) {
      handleUpdateExpert();
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle updating expert
  const handleUpdateExpert = async () => {
    const selectedExpert = experts.find(expert => expert._id === selectedExpertIds[0]);
    if (!selectedExpert?.mod_expert_id) {
      setSnackbarMessage('Selected expert not found or invalid.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Prepare update data
    const updateData = {
      mod_expert_id: selectedExpert.mod_expert_id,
    };

    // Validate and add poc_id (array of mod_poc_id) if POCs are selected
    if (selectedPocIds.length > 0) {
      const validPocIds = pocs
        .filter(poc => selectedPocIds.includes(poc._id) && poc.mod_poc_id)
        .map(poc => poc.mod_poc_id);
      if (validPocIds.length !== selectedPocIds.length) {
        setSnackbarMessage('One or more selected POCs are invalid.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      updateData.poc_id = validPocIds;
    } else {
      updateData.poc_id = [];
    }

    // Validate and add mod_id (array of mod_id) if modules are selected
    if (selectedModuleIds.length > 0) {
      const validModuleIds = modules
        .filter(mod => selectedModuleIds.includes(mod._id) && mod.mod_id)
        .map(mod => mod.mod_id);
      if (validModuleIds.length !== selectedModuleIds.length) {
        setSnackbarMessage('One or more selected modules are invalid.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      updateData.mod_id = validModuleIds;
    } else {
      updateData.mod_id = [];
    }

    setUpdateLoading(true);

    try {
      await updateExpert(updateData);
      setSnackbarMessage('Expert updated successfully!');
      setSnackbarSeverity('success');

      // Refresh experts data
      const updatedExpertsResponse = await fetchAllExperts();
      const expertData = updatedExpertsResponse.data || [];
      setExperts(expertData);
      setFilteredExperts(expertData);

      // Clear selections and reset stepper
      setSelectedExpertIds([]);
      setSelectedPocIds([]);
      setSelectedModuleIds([]);
      localStorage.removeItem('selectedExpertIds');
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedModuleIds');
      setDataGridKey(prev => prev + 1);
      setActiveStep(0);
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || 'Unable to update expert. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Failed to copy to clipboard.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  // Expert DataGrid columns
  const columnsForExperts = [
    {
      field: 'mod_expert_name',
      headerName: 'Name',
      minWidth: isMobile ? 120 : 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_expert_role',
      headerName: 'Role',
      minWidth: isMobile ? 100 : 120,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Role
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_expert_mobile',
      headerName: 'Mobile',
      minWidth: isMobile ? 120 : 150,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Mobile
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: 'mod_expert_id',
    //   headerName: 'Expert ID',
    //   minWidth: isMobile ? 150 : 200,
    //   flex: 1,
    //   renderHeader: () => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Users size={16} color="white" />
    //       <Typography variant="inherit" fontWeight="bold">
    //         Expert ID
    //       </Typography>
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //       <Typography
    //         variant="body2"
    //         sx={{
    //           overflow: 'hidden',
    //           textOverflow: 'ellipsis',
    //           whiteSpace: 'nowrap',
    //           maxWidth: 'calc(100% - 30px)',
    //           fontSize: isMobile ? '12px' : '14px',
    //         }}
    //       >
    //         {params.value}
    //       </Typography>
    //       <IconButton
    //         size="small"
    //         onClick={() => handleCopyToClipboard(params.value)}
    //         sx={{ ml: 'auto' }}
    //       >
    //         <Copy size={16} color="#0c83c8" />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
    {
      field: 'poc_id',
      headerName: 'POC IDs',
      minWidth: isMobile ? 150 : 250,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            POC IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box>
          {params.value && params.value.length > 0 ? (
            params.value.map((id, index) => (
              <Typography key={index} variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                {id}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
              No POCs
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'mod_id',
      headerName: 'Module IDs',
      minWidth: isMobile ? 150 : 250,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Book size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Module IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box>
          {params.value && params.value.length > 0 ? (
            params.value.map((id, index) => (
              <Typography key={index} variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                {id}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
              No modules
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  // POC DataGrid columns
  const columnsForPocs = [
    {
      field: 'mod_poc_name',
      headerName: 'POC Name',
      minWidth: isMobile ? 120 : 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            POC Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_role',
      headerName: 'Role',
      minWidth: isMobile ? 100 : 120,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Role
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_email',
      headerName: 'Email',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Email
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_mobile',
      headerName: 'Mobile',
      minWidth: isMobile ? 120 : 150,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Mobile
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_id',
      headerName: 'POC ID',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            POC ID
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 30px)',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyToClipboard(params.value)}
            sx={{ ml: 'auto' }}
          >
            <Copy size={16} color="#0c83c8" />
          </IconButton>
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
          <Book size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Module Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_id',
      headerName: 'Module ID',
      minWidth: isMobile ? 150 : 250,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Book size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Module ID
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 30px)',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyToClipboard(params.value)}
            sx={{ ml: 'auto' }}
          >
            <Copy size={16} color="#0c83c8" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Common DataGrid styling
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
    },
  };

  // Snackbar Transition
  const TransitionSlide = (props) => <Slide {...props} direction="down" />;

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 6 },
        }}
      >
       

        {/* Stepper */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          }}
        >
           {/* Gradient Header */}
        <Paper
          elevation={5}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            color: 'white',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <User size={isMobile ? 20 : 24} />
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={600}
              sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
            >
              Update Expert
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ mt: 0.5, fontSize: isMobile ? '12px' : '14px' }}
          >
            Manage expert assignments
          </Typography>
        </Paper>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<CustomConnector />}
            sx={{ mb: 4 }}
          >
            {steps.map(({ label, icon: Icon }, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <CustomStepIcon ownerState={props}>
                      <Icon size={20} />
                    </CustomStepIcon>
                  )}
                >
                  <Typography
                    sx={{
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: activeStep === index ? 600 : 400,
                      color: activeStep === index ? '#0c83c8' : 'text.secondary',
                    }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          {activeStep === 0 && (
            <Box>
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
                Expert Management
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search experts..."
                  value={expertSearchQuery}
                  onChange={(e) => setExpertSearchQuery(e.target.value)}
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
              <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
                <DataGrid
                  key={`expert-grid-${dataGridKey}`}
                  rows={filteredExperts}
                  columns={columnsForExperts}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.experts}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedExpertIds}
                  onRowSelectionModelChange={(newId) => {
                    const updatedSelection = newId.length > 0 ? [newId[newId.length - 1]] : [];
                    setSelectedExpertIds(updatedSelection);
                    localStorage.setItem('selectedExpertIds', JSON.stringify(updatedSelection));
                    setDataGridKey(prev => prev + 1);
                  }}
                  sx={dataGridSx}
                />
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
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
                POC Selection
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search POCs..."
                  value={pocSearchQuery}
                  onChange={(e) => setPocSearchQuery(e.target.value)}
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
              <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
                <DataGrid
                  key={`poc-grid-${dataGridKey}`}
                  rows={filteredPocs}
                  columns={columnsForPocs}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.pocs}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedPocIds}
                  onRowSelectionModelChange={(newSelection) => {
                    setSelectedPocIds(newSelection);
                    localStorage.setItem('selectedPocIds', JSON.stringify(newSelection));
                    setDataGridKey(prev => prev + 1);
                  }}
                  sx={dataGridSx}
                />
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
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
                Module Selection
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
              <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
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
                />
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <Box sx={{ py: 2 }}>
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
                Review and Submit
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, fontSize: isMobile ? '14px' : '16px', color: 'text.secondary' }}
              >
                Please review the following selections before submitting the update:
              </Typography>

              {/* Selected Expert */}
              <ListItemButton
                onClick={() => setExpertSectionOpen(!expertSectionOpen)}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: 'white',
                  mb: 1,
                  borderRadius: '8px',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ flexGrow: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}
                >
                  Selected Expert
                </Typography>
                {expertSectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </ListItemButton>
              <Collapse in={expertSectionOpen}>
                {selectedExpertIds.length === 1 ? (
                  <List dense>
                    {experts
                      .filter(expert => expert._id === selectedExpertIds[0])
                      .map(expert => (
                        <ListItem
                          key={expert._id}
                          sx={{
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            borderRadius: '4px',
                          }}
                        >
                          <ListItemText
                            primary={expert.mod_expert_name || 'N/A'}
                            secondary={`ID: ${expert.mod_expert_id || 'N/A'} | Role: ${expert.mod_expert_role || 'N/A'} | Mobile: ${expert.mod_expert_mobile || 'N/A'}`}
                            primaryTypographyProps={{ fontSize: isMobile ? '14px' : '16px' }}
                            secondaryTypographyProps={{ fontSize: isMobile ? '12px' : '14px' }}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="warning" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No expert selected
                  </Alert>
                )}
              </Collapse>

              <Divider sx={{ my: 2 }} />

              {/* Selected POCs */}
              <ListItemButton
                onClick={() => setPocSectionOpen(!pocSectionOpen)}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: 'white',
                  mb: 1,
                  borderRadius: '8px',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ flexGrow: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}
                >
                  Selected POCs ({selectedPocIds.length})
                </Typography>
                {pocSectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </ListItemButton>
              <Collapse in={pocSectionOpen}>
                {selectedPocIds.length > 0 ? (
                  <List dense>
                    {pocs
                      .filter(poc => selectedPocIds.includes(poc._id))
                      .map(poc => (
                        <ListItem
                          key={poc._id}
                          sx={{
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            borderRadius: '4px',
                          }}
                        >
                          <ListItemText
                            primary={poc.mod_poc_name || 'N/A'}
                            secondary={`ID: ${poc.mod_poc_id || 'N/A'} | Role: ${poc.mod_poc_role || 'N/A'} | Email: ${poc.mod_poc_email || 'N/A'} | Mobile: ${poc.mod_poc_mobile || 'N/A'}`}
                            primaryTypographyProps={{ fontSize: isMobile ? '14px' : '16px' }}
                            secondaryTypographyProps={{ fontSize: isMobile ? '12px' : '14px' }}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="info" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No POCs selected
                  </Alert>
                )}
              </Collapse>

              <Divider sx={{ my: 2 }} />

              {/* Selected Modules */}
              <ListItemButton
                onClick={() => setModuleSectionOpen(!moduleSectionOpen)}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: 'white',
                  mb: 1,
                  borderRadius: '8px',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ flexGrow: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}
                >
                  Selected Modules ({selectedModuleIds.length})
                </Typography>
                {moduleSectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </ListItemButton>
              <Collapse in={moduleSectionOpen}>
                {selectedModuleIds.length > 0 ? (
                  <List dense>
                    {modules
                      .filter(mod => selectedModuleIds.includes(mod._id))
                      .map(mod => (
                        <ListItem
                          key={mod._id}
                          sx={{
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            borderRadius: '4px',
                          }}
                        >
                          <ListItemText
                            primary={mod.mod_name || 'N/A'}
                            secondary={`ID: ${mod.mod_id || 'N/A'}`}
                            primaryTypographyProps={{ fontSize: isMobile ? '14px' : '16px' }}
                            secondaryTypographyProps={{ fontSize: isMobile ? '12px' : '14px' }}
                          />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  <Alert severity="info" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No modules selected
                  </Alert>
                )}
              </Collapse>
            </Box>
          )}

          {/* Stepper Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || updateLoading}
              onClick={handleBack}
              startIcon={<ArrowLeft size={16} />}
              sx={{
                color: '#0c83c8',
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
                '&:hover': { color: '#fc7a46' },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={updateLoading || (activeStep === 0 && selectedExpertIds.length !== 1)}
              endIcon={activeStep === steps.length - 1 ? <Save size={16} /> : <ArrowRight size={16} />}
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
              }}
            >
              {activeStep === steps.length - 1 ? (updateLoading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Submit') : 'Next'}
            </Button>
          </Box>
        </Paper>

        {/* Snackbar notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionComponent={TransitionSlide}
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

export default Update_Expert;