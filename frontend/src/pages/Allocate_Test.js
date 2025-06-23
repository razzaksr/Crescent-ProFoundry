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
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, fetchAllTests, fetchPocById, updateTestPoc } from '../axios';
import SaveIcon from '@mui/icons-material/Save';
import ModuleIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Admin_Dashboard from '../components/AdminDash';
import { Stepper, Step, StepLabel, StepConnector, styled } from '@mui/material';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

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
    2: <AssignmentIcon />,
    3: <CheckCircleIcon />,
  };
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select POC', 'Select Tests', 'Review'];

const Allocate_Test = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pocs, setPocs] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState({
    pocs: true,
    tests: true,
    pocDetails: false,
  });
  const [selectedPocIds, setSelectedPocIds] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [testDates, setTestDates] = useState({});
  const [originalTestDates, setOriginalTestDates] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [pocDetailsFetched, setPocDetailsFetched] = useState(false);

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const pocIds = JSON.parse(localStorage.getItem('selectedPocIds')) || [];
      const testIds = JSON.parse(localStorage.getItem('selectedTestIds')) || [];
      const storedTestDates = JSON.parse(localStorage.getItem('testDates')) || {};

      const parsedTestDates = Object.keys(storedTestDates).reduce((acc, testId) => {
        const date = dayjs(storedTestDates[testId]);
        if (date.isValid()) {
          acc[testId] = date;
        }
        return acc;
      }, {});

      setSelectedPocIds(Array.isArray(pocIds) ? pocIds : []);
      setSelectedTestIds(Array.isArray(testIds) ? testIds : []);
      setTestDates(parsedTestDates);
    } catch (error) {
      setSnackbarMessage('Failed to load saved selections.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
    }
  }, []);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
    };
  }, []);

  // Fetch POCs
  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        const formattedPocs = (response.data || []).map((poc, index) => ({
          id: poc._id || `temp-id-${index}`,
          mod_poc_id: poc.mod_poc_id || 'N/A',
          mod_poc_name: poc.mod_poc_name || 'N/A',
          mod_poc_role: poc.mod_poc_role || 'N/A',
          mod_poc_email: poc.mod_poc_email || 'N/A',
          mod_poc_mobile: poc.mod_poc_mobile || 'N/A',
          testCount: Array.isArray(poc.mod_tests) ? poc.mod_tests.length : 0,
          tags: Array.isArray(poc.mod_poc_tags) ? poc.mod_poc_tags : [],
        }));
        setPocs(formattedPocs);
      } catch (error) {
        setSnackbarMessage(`Error fetching POCs: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(prev => ({ ...prev, pocs: false }));
      }
    };
    getPocs();
  }, []);

  // Fetch Tests
  useEffect(() => {
    const getTests = async () => {
      try {
        const response = await fetchAllTests();
        const formattedTests = (response.data || []).map((test, index) => ({
          id: test._id || `temp-id-${index}`,
          test_id: test.test_id || 'N/A',
          test_name: test.test_name || 'N/A',
          test_tech: test.test_tech || 'N/A',
          test_duration: test.test_duration || 'N/A',
          tags: Array.isArray(test.test_tags) ? test.test_tags : [],
        }));
        setTests(formattedTests);
      } catch (error) {
        setSnackbarMessage(`Error fetching tests: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(prev => ({ ...prev, tests: false }));
      }
    };
    getTests();
  }, []);

  // Fetch POC Details
  useEffect(() => {
    if (loading.pocs || selectedPocIds.length !== 1 || pocDetailsFetched) return;

    const selectedPoc = pocs.find(poc => poc.id === selectedPocIds[0]);
    if (!selectedPoc?.mod_poc_id) {
      setSnackbarMessage('Selected POC has no valid POC ID');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSelectedPocIds([]);
      localStorage.removeItem('selectedPocIds');
      return;
    }

    const fetchPocDetails = async () => {
      try {
        setLoading(prev => ({ ...prev, pocDetails: true }));
        const pocData = await fetchPocById(selectedPoc.mod_poc_id);
        if (pocData && Array.isArray(pocData.mod_tests)) {
          const validTestIds = pocData.mod_tests
            .map(test => test.test_id)
            .filter(id => id && tests.some(t => t.test_id === id));
          const dates = pocData.mod_tests.reduce((acc, test) => {
            if (test.test_id && test.assigned_date) {
              const parsedDate = dayjs(test.assigned_date, 'DD/MM/YYYY');
              if (parsedDate.isValid()) {
                acc[test.test_id] = parsedDate;
              }
            }
            return acc;
          }, {});

          setSelectedTestIds(validTestIds);
          setTestDates(dates);
          setOriginalTestDates(dates);

          const serializableDates = Object.keys(dates).reduce((acc, testId) => {
            acc[testId] = dates[testId].toISOString();
            return acc;
          }, {});
          localStorage.setItem('selectedTestIds', JSON.stringify(validTestIds));
          localStorage.setItem('testDates', JSON.stringify(serializableDates));
        }
        setPocDetailsFetched(true);
      } catch (error) {
        setSnackbarMessage(`Error fetching POC details: ${error.message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSelectedPocIds([]);
        localStorage.removeItem('selectedPocIds');
      } finally {
        setLoading(prev => ({ ...prev, pocDetails: false }));
      }
    };

    fetchPocDetails();
  }, [loading.pocs, selectedPocIds, pocs, pocDetailsFetched, tests]);

  const getTestSelectionModel = () => {
    return tests
      .filter(test => selectedTestIds.includes(test.test_id))
      .map(test => test.id)
      .filter(id => id);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (selectedPocIds.length !== 1) {
        setSnackbarMessage('Please select exactly one POC');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (!pocDetailsFetched) {
        setSnackbarMessage('Please wait for POC details to load');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    } else if (activeStep === 1) {
      if (selectedTestIds.length === 0) {
        setSnackbarMessage('Please select at least one test');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      for (const testId of selectedTestIds) {
        if (!testDates[testId] || !dayjs(testDates[testId]).isValid()) {
          setSnackbarMessage(`Please select a valid date for test: ${testId}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
    if (activeStep === 1) {
      setPocDetailsFetched(false);
    }
  };

  const handleOpenPreviewDialog = () => {
    if (selectedPocIds.length !== 1) {
      setSnackbarMessage('Please select exactly one POC');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (selectedTestIds.length === 0) {
      setSnackbarMessage('Please select at least one test');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    for (const testId of selectedTestIds) {
      if (!testDates[testId] || !dayjs(testDates[testId]).isValid()) {
        setSnackbarMessage(`Please select a valid date for test: ${testId}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleUpdateTest = async () => {
    const selectedPoc = pocs.find(poc => poc.id === selectedPocIds[0]);
    if (!selectedPoc) {
      setSnackbarMessage('Selected POC not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const uniqueTestIds = [...new Set(selectedTestIds)];
    const invalidTestIds = uniqueTestIds.filter(
      testId => !tests.some(test => test.test_id === testId)
    );
    if (invalidTestIds.length > 0) {
      setSnackbarMessage(`Invalid test IDs: ${invalidTestIds.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const invalidTests = uniqueTestIds.filter(
      testId => !testDates[testId] || !dayjs(testDates[testId]).isValid()
    );
    if (invalidTests.length > 0) {
      setSnackbarMessage(`Invalid or missing dates for tests: ${invalidTests.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const data = {
      mod_poc_id: selectedPoc.mod_poc_id,
      test_id: uniqueTestIds.map(testId => ({
        test_id: testId,
        assigned_date: dayjs(testDates[testId]).format('DD/MM/YYYY'),
      })),
    };

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      const response = await updateTestPoc(data);
      setSnackbarMessage(response.message || 'Tests allocated successfully');
      setSnackbarSeverity('success');

      const updatedPocsResponse = await fetchAllPocs();
      const formattedPocs = (updatedPocsResponse.data || []).map((poc, index) => ({
        id: poc._id || `temp-id-${index}`,
        mod_poc_id: poc.mod_poc_id || 'N/A',
        mod_poc_name: poc.mod_poc_name || 'N/A',
        mod_poc_role: poc.mod_poc_role || 'N/A',
        mod_poc_email: poc.mod_poc_email || 'N/A',
        mod_poc_mobile: poc.mod_poc_mobile || 'N/A',
        testCount: Array.isArray(poc.mod_tests) ? poc.mod_tests.length : 0,
        tags: Array.isArray(poc.mod_poc_tags) ? poc.mod_poc_tags : [],
      }));
      setPocs(formattedPocs);

      setSelectedPocIds([]);
      setSelectedTestIds([]);
      setTestDates({});
      setOriginalTestDates({});
      localStorage.removeItem('selectedPocIds');
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('testDates');
      setPocDetailsFetched(false);
      setActiveStep(0);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to allocate tests';
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const renderTagChips = (tags) => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>No tags</Typography>;
    }
    return tags.map((tag, index) => (
      <Chip
        key={index}
        label={tag.trim()}
        size="small"
        sx={{
          m: 0.5,
          backgroundColor: '#e3f2fd',
          color: '#0c83c8',
          fontSize: { xs: '10px', sm: '12px' },
          fontWeight: 500,
          '&:hover': { backgroundColor: '#d1e9ff' },
        }}
      />
    ));
  };

  const columnsForPocs = [
    {
      field: 'mod_poc_name',
      headerName: 'Name',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Name</Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_role',
      headerName: 'Role',
      minWidth: 100,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Role</Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_email',
      headerName: 'Email',
      minWidth: 200,
      flex: 1.2,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Email</Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_mobile',
      headerName: 'Mobile',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Mobile</Typography>
        </Box>
      ),
    },
    {
      field: 'testCount',
      headerName: 'No of Tests',
      minWidth: 120,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">No of Tests</Typography>
        </Box>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Tags</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {renderTagChips(params.value)}
        </Box>
      ),
    },
  ];

  const columnsForTests = [
    {
      field: 'test_name',
      headerName: 'Test Name',
      minWidth: 200,
      flex: 1.2,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Test Name</Typography>
        </Box>
      ),
    },
    {
      field: 'test_tech',
      headerName: 'Technology',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Technology</Typography>
        </Box>
      ),
    },
    {
      field: 'test_duration',
      headerName: 'Duration',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Duration</Typography>
        </Box>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Tags</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {renderTagChips(params.value)}
        </Box>
      ),
    },
    {
      field: 'assigned_date',
      headerName: 'Assigned Date',
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Assigned Date</Typography>
        </Box>
      ),
      renderCell: (params) => {
        const testId = params.row.test_id;
        return (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ width: '100%', '& .MuiFormControl-root': { width: '100%' } }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={testDates[testId] || null}
                onChange={(newValue) => {
                  if (newValue && dayjs(newValue).isValid()) {
                    const updatedDates = { ...testDates, [testId]: newValue };
                    setTestDates(updatedDates);
                    const serializableDates = Object.keys(updatedDates).reduce((acc, id) => {
                      acc[id] = updatedDates[id].toISOString();
                      return acc;
                    }, {});
                    localStorage.setItem('testDates', JSON.stringify(serializableDates));
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&:hover fieldset': { borderColor: '#fc7a46' },
                        '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#0c83c8',
                        '&.Mui-focused': { color: '#fc7a46' },
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      },
    },
  ];

  const dataGridSx = {
    borderRadius: '12px',
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#0c83c8',
      fontWeight: '600',
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
    '& .MuiCheckbox-root': {
      color: '#0c83c8',
      '&.Mui-checked': { color: '#fc7a46' },
    },
    boxShadow: '0 2px 8px rgba(12, 131, 200, 0.05)',
    border: 'none',
  };

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
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
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: '700', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}
              >
                Allocate Tests to POC
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ mt: 0.5, fontSize: { xs: '12px', sm: '14px' } }}
              >
                Seamlessly assign tests to points of contact
              </Typography>
            </Paper>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
              sx={{
                mt: 2,
                padding: { xs: '12px 0', sm: '16px 0' },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  fontWeight: '500',
                  color: activeStep >= 0 ? '#0c83c8' : '#6b7280',
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
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select POC
                </Typography>
                <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                  {loading.pocs || loading.pocDetails ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress sx={{ color: '#0c83c8' }} />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={pocs}
                      columns={columnsForPocs}
                      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                      pageSizeOptions={[10, 20, 50]}
                      getRowId={(row) => row.id}
                      checkboxSelection
                      rowSelectionModel={selectedPocIds}
                      onRowSelectionModelChange={(newSelection) => {
                        const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                        setSelectedPocIds(updatedSelection);
                        setSelectedTestIds([]);
                        setTestDates({});
                        setOriginalTestDates({});
                        localStorage.setItem('selectedPocIds', JSON.stringify(updatedSelection));
                        localStorage.removeItem('selectedTestIds');
                        localStorage.removeItem('testDates');
                        setPocDetailsFetched(false);
                      }}
                      sx={dataGridSx}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading.pocDetails || selectedPocIds.length !== 1}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                    }}
                  >
                    {loading.pocDetails ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Next'}
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
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Tests
                </Typography>
                <Box sx={{ height: { xs: 350, sm: 500 }, width: '100%' }}>
                  {loading.tests ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress sx={{ color: '#0c83c8' }} />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={tests}
                      columns={columnsForTests}
                      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                      pageSizeOptions={[10, 25]}
                      getRowId={(row) => row.id}
                      checkboxSelection
                      rowSelectionModel={getTestSelectionModel()}
                      onRowSelectionModelChange={(newSelection) => {
                        const updatedSelection = [...new Set(newSelection
                          .map(id => {
                            const test = tests.find(t => t.id === id);
                            return test?.test_id;
                          })
                          .filter(id => id))];

                        const updatedDates = updatedSelection.reduce((acc, testId) => {
                          acc[testId] = testDates[testId] || originalTestDates[testId] || dayjs();
                          return acc;
                        }, {});

                        setSelectedTestIds(updatedSelection);
                        setTestDates(updatedDates);
                        const serializableDates = Object.keys(updatedDates).reduce((acc, id) => {
                          acc[id] = updatedDates[id].toISOString();
                          return acc;
                        }, {});
                        localStorage.setItem('selectedTestIds', JSON.stringify(updatedSelection));
                        localStorage.setItem('testDates', JSON.stringify(serializableDates));
                      }}
                      sx={dataGridSx}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    sx={{
                      color: '#0c83c8',
                      borderColor: '#0c83c8',
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading.tests}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
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
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Review Test Allocations
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, fontSize: { xs: '14px', sm: '16px' } }}
                >
                  Please review your selections below before confirming the allocation.
                </Typography>
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    bgcolor: '#fafafa',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 'bold', fontSize: { xs: '14px', sm: '16px' } }}
                  >
                    Selected POC
                  </Typography>
                  {selectedPocIds.length === 1 ? (
                    (() => {
                      const poc = pocs.find(poc => poc.id === selectedPocIds[0]);
                      return poc ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>Name:</strong> {poc.mod_poc_name || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>Role:</strong> {poc.mod_poc_role || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>Email:</strong> {poc.mod_poc_email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>Mobile:</strong> {poc.mod_poc_mobile || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>No of Tests:</strong> {poc.testCount || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                            <strong>Tags:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {renderTagChips(poc.tags)}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="error" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                          No POC found
                        </Typography>
                      );
                    })()
                  ) : (
                    <Typography variant="body2" color="error" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      No POC selected
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    bgcolor: '#fafafa',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 'bold', fontSize: { xs: '14px', sm: '16px' } }}
                  >
                    Selected Tests
                  </Typography>
                  {selectedTestIds.length > 0 ? (
                    <TableContainer sx={{ borderRadius: '8px' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: 'linear-gradient(90deg, #0c83c8, #fc7a46)' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                              Test Name
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                              Technology
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                              Duration
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                              Tags
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                              Assigned Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTestIds.map(testId => {
                            const test = tests.find(t => t.test_id === testId);
                            return (
                              <TableRow key={testId}>
                                <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{test?.test_name || 'N/A'}</TableCell>
                                <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{test?.test_tech || 'N/A'}</TableCell>
                                <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{test?.test_duration || 'N/A'}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {renderTagChips(test?.tags || [])}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                                  {testDates[testId] ? dayjs(testDates[testId]).format('DD/MM/YYYY') : 'N/A'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="error" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      No Tests selected
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
                      fontSize: { xs: '12px', sm: '14px' },
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
              variant="extended"
              onClick={handleOpenPreviewDialog}
              disabled={updateLoading || selectedPocIds.length !== 1 || selectedTestIds.length === 0}
              sx={{
                position: 'fixed',
                bottom: { xs: 16, sm: 20 },
                right: { xs: 16, sm: 20 },
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                fontSize: { xs: '12px', sm: '14px' },
                borderRadius: '12px',
                px: { xs: 2, sm: 3 },
              }}
            >
              <SaveIcon sx={{ mr: 1 }} />
              Confirm Allocation
            </Fab>
          )}
          <Dialog
            open={previewDialogOpen}
            onClose={handleClosePreviewDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '12px' } }}
          >
            <DialogTitle
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                color: 'white',
                fontSize: { xs: '16px', sm: '18px' },
              }}
            >
              Confirm Test Allocation
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                Confirm the test allocations below:
              </DialogContentText>
              {selectedPocIds.length === 1 && (
                <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                  <strong>POC:</strong> {pocs.find(poc => poc.id === selectedPocIds[0])?.mod_poc_name || 'N/A'}
                </Typography>
              )}
              {selectedTestIds.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                    <strong>Tests:</strong>
                  </Typography>
                  {selectedTestIds.map(testId => {
                    const test = tests.find(t => t.test_id === testId);
                    return (
                      <Typography
                        key={testId}
                        variant="body2"
                        sx={{ ml: 2, fontSize: { xs: '12px', sm: '14px' } }}
                      >
                        - {test?.test_name || 'N/A'} (Date: {testDates[testId] ? dayjs(testDates[testId]).format('DD/MM/YYYY') : 'Not set'})
                      </Typography>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                  No tests selected.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleClosePreviewDialog}
                sx={{ color: '#0c83c8', fontSize: { xs: '12px', sm: '14px' }, borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateTest}
                disabled={updateLoading}
                startIcon={updateLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  fontSize: { xs: '12px', sm: '14px' },
                  borderRadius: '8px',
                }}
              >
                Confirm
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
                background: snackbarSeverity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default Allocate_Test;