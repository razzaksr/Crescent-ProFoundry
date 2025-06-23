import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  FileText,
  Code,
  HelpCircle,
  CheckCircle,
  Plus,
  Save,
  X,
  Copy,
  Tag,
  Check,
  Calendar,
  List,
  Search,
  Users,
} from 'lucide-react';
import { fetchAllCodes, fetchAllMcqs, createTest } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { stepConnectorClasses } from '@mui/material/StepConnector';

// Custom Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
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

// Custom Stepper Icon
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#e0e0e0',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  ...(ownerState.active || ownerState.completed
    ? {
        background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
      }
    : {}),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <FileText size={24} />,
    2: <Code size={24} />,
    3: <HelpCircle size={24} />,
    4: <CheckCircle size={24} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Enter Test Details', 'Select Coding Problems', 'Select MCQs', 'Review and Confirm'];

// Styled FAB
const StyledFab = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
  '&:hover': {
    background: 'linear-gradient(90deg, #fc7a46, #0c83c8)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
  width: 56,
  height: 56,
}));

const AddTestModule = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [testDetails, setTestDetails] = useState({
    test_name: '',
    test_language: '',
    status: 'active',
  });
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [filteredMcqs, setFilteredMcqs] = useState([]);
  const [loading, setLoading] = useState({
    codes: true,
    mcqs: true,
  });
  const [codeSearchQuery, setCodeSearchQuery] = useState('');
  const [mcqSearchQuery, setMcqSearchQuery] = useState('');
  const [selectedCodeIds, setSelectedCodeIds] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const codeResponse = await fetchAllCodes();
        const codesArray = codeResponse.codes || [];
        if (!Array.isArray(codesArray)) {
          setCodes([]);
        } else {
          const formattedRows = codesArray.map((item, index) => ({
            id: item._id || `temp-id-${index}`,
            code_id: item.code_id || 'N/A',
            problem: item.code_problem_statement || 'N/A',
            testCasesCount:
              (Array.isArray(item.code_test_cases_id)
                ? item.code_test_cases_id.length
                : Array.isArray(item.code_test_cases)
                ? item.code_test_cases.length
                : 0) || 0,
            tags: (Array.isArray(item.code_tags) ? item.code_tags : []).join(', ') || 'None',
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A',
          }));
          setCodes(formattedRows);
          setFilteredCodes(formattedRows);
          setDataGridKey((prev) => prev + 1);
        }
        setLoading((prev) => ({ ...prev, codes: false }));
      } catch (error) {
        setCodes([]);
        setFilteredCodes([]);
        setLoading((prev) => ({ ...prev, codes: false }));
        setSnackbarMessage('Failed to fetch codes: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchCodes();
  }, []);

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const mcqResponse = await fetchAllMcqs();
        const mcqData = mcqResponse.data?.mcqs || mcqResponse.data || [];
        if (!Array.isArray(mcqData)) {
          setMcqs([]);
        } else {
          setMcqs(mcqData);
          setFilteredMcqs(mcqData);
        }
        setLoading((prev) => ({ ...prev, mcqs: false }));
      } catch (error) {
        setMcqs([]);
        setFilteredMcqs([]);
        setLoading((prev) => ({ ...prev, mcqs: false }));
        setSnackbarMessage('Failed to fetch MCQs: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchMcqs();
  }, []);

  useEffect(() => {
    const filtered = codes.filter((code) =>
      Object.values(code)
        .join(' ')
        .toLowerCase()
        .includes(codeSearchQuery.toLowerCase())
    );
    setFilteredCodes(filtered);
  }, [codeSearchQuery, codes]);

  useEffect(() => {
    const filtered = mcqs.filter((mcq) =>
      Object.values(mcq)
        .join(' ')
        .toLowerCase()
        .includes(mcqSearchQuery.toLowerCase())
    );
    setFilteredMcqs(filtered);
  }, [mcqSearchQuery, mcqs]);

  const validateForm = () => {
    const errors = {};
    if (!testDetails.test_name.trim()) {
      errors.test_name = 'Test name is required';
    }
    if (!testDetails.test_language.trim()) {
      errors.test_language = 'Test language is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStatusToggle = () => {
    setTestDetails((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'disabled' : 'active',
    }));
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((err) => {
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
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep((prev) => prev - 1);
  };

  const calculateTotalScore = () => {
    const mcqCount = selectedMcqIds.length;
    const codeCount = selectedCodeIds.length;
    return mcqCount * 1 + codeCount * 10;
  };

  const handleCreateTest = async () => {
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const newMcqIds = mcqs
        .filter((mcq) => selectedMcqIds.includes(mcq._id))
        .map((mcq) => mcq.mcq_id);

      const newCodeIds = codes
        .filter((code) => selectedCodeIds.includes(code.id))
        .map((code) => code.code_id);

      const testData = {
        test_name: testDetails.test_name,
        test_language: testDetails.test_language,
        test_mcq_id: newMcqIds,
        test_coding_id: newCodeIds,
        test_total_score: calculateTotalScore(),
        status: testDetails.status,
      };

      setCreateLoading(true);
      setPreviewDialogOpen(false);

      await createTest(testData);
      setSnackbarMessage('Test created successfully!');
      setSnackbarSeverity('success');

      setTestDetails({
        test_name: '',
        test_language: '',
        status: 'active',
      });
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setActiveStep(0);
      setDataGridKey((prev) => prev + 1);
    } catch (error) {
      setSnackbarMessage(`Failed to create test: ${error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setCreateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleAddMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleAddMenuClose();
  };

  const codeColumns = [
    {
      field: 'problem',
      headerName: 'Problem Statement',
      minWidth: isMobile ? 200 : 300,
      flex: 1.5,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Problem Statement
          </Typography>
        </Box>
      ),
    },
    {
      field: 'testCasesCount',
      headerName: 'No of Test Cases',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            No of Test Cases
          </Typography>
        </Box>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: 'createdAt',
    //   headerName: 'Created At',
    //   minWidth: isMobile ? 150 : 180,
    //   flex: 0.8,
    //   renderHeader: () => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Calendar size={16} color="white" />
    //       <Typography variant="inherit" fontWeight="bold">
    //         Created At
    //       </Typography>
    //     </Box>
    //   ),
    // },
    // {
    //   field: 'updatedAt',
    //   headerName: 'Updated At',
    //   minWidth: isMobile ? 150 : 180,
    //   flex: 0.8,
    //   renderHeader: () => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Calendar size={16} color="white" />
    //       <Typography variant="inherit" fontWeight="bold">
    //         Updated At
    //       </Typography>
    //     </Box>
    //   ),
    // },
  ];

  const mcqColumns = [
    {
      field: 'mcq_question',
      headerName: 'Question',
      minWidth: isMobile ? 200 : 300,
      flex: 1,
    },
    {
      field: 'mcq_options',
      headerName: 'Options',
      minWidth: isMobile ? 150 : 250,
      flex: 0.8,
      renderCell: (params) => {
        const options = params.row.mcq_options;
        if (Array.isArray(options) && options.length > 0) {
          return (
            <Box sx={{ py: 1 }}>
              {options.map((option, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? '12px' : '14px',
                    display: 'block',
                    lineHeight: 1.3,
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Typography>
              ))}
            </Box>
          );
        }
        return <Typography variant="body2">No options</Typography>;
      },
    },
    {
      field: 'mcq_answer',
      headerName: 'Answer',
      minWidth: isMobile ? 100 : 150,
      flex: 0.5,
    },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      minWidth: isMobile ? 120 : 200,
      flex: 0.6,
      renderCell: (params) => {
        const tags = params.row.mcq_tag;
        if (Array.isArray(tags) && tags.length > 0) {
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
              {tags.map((tag, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#0c83c8',
                    px: 1,
                    py: 0.5,
                    borderRadius: '12px',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </Typography>
              ))}
            </Box>
          );
        }
        return <Typography variant="body2">No tags</Typography>;
      },
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
    },
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
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: '1600px',
            bgcolor: 'white',
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
              <Users size={24} />
              <Typography variant="h5" fontWeight={600}>
                <span style={{ color: '#fff' }}>Add </span>
                <span style={{ padding: '4px 8px', borderRadius: '6px' }}>Test</span>
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Create a new test with coding problems and MCQs
            </Typography>
          </Paper>
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
            sx={{ mb: 4, px: { xs: 1, sm: 2 } }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: isMobile ? '12px' : '14px',
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  Enter Test Details
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                <TextField
                  label="Test Name"
                  name="test_name"
                  value={testDetails.test_name}
                  onChange={handleInputChange}
                  error={!!formErrors.test_name}
                  helperText={formErrors.test_name}
                  fullWidth
                  required
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FileText size={16} color="#0c83c8" />
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
                <TextField
                  label="Test Language"
                  name="test_language"
                  value={testDetails.test_language}
                  onChange={handleInputChange}
                  error={!!formErrors.test_language}
                  helperText={formErrors.test_language}
                  fullWidth
                  required
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code size={16} color="#0c83c8" />
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={testDetails.status === 'active'}
                      onChange={handleStatusToggle}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#0c83c8',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                        },
                      }}
                    />
                  }
                  label={`Status: ${testDetails.status === 'active' ? 'Active' : 'Disabled'}`}
                  sx={{ fontSize: isMobile ? '12px' : '14px' }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
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
                Select Coding Problems
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search coding problems..."
                  value={codeSearchQuery}
                  onChange={(e) => setCodeSearchQuery(e.target.value)}
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
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => navigate('/add_coding')}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                    px: isMobile ? 1 : 2,
                  }}
                >
                  Add Coding Problem
                </Button>
              </Box>
              <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : filteredCodes.length === 0 ? (
                  <Typography variant="body1" color="error" sx={{ textAlign: 'center', mt: 2 }}>
                    No coding problems found. Please add some coding problems.
                  </Typography>
                ) : (
                  <DataGrid
                    key={`code-grid-${dataGridKey}`}
                    rows={filteredCodes}
                    columns={codeColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    loading={loading.codes}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    rowSelectionModel={selectedCodeIds}
                    onRowSelectionModelChange={(newSelection) => {
                      setSelectedCodeIds(newSelection);
                    }}
                    sx={dataGridSx}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
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
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
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
                Select MCQs
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search MCQs..."
                  value={mcqSearchQuery}
                  onChange={(e) => setMcqSearchQuery(e.target.value)}
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
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => navigate('/add_mcq')}
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: isMobile ? '12px' : '14px',
                    borderRadius: '8px',
                    px: isMobile ? 1 : 2,
                  }}
                >
                  Add MCQ
                </Button>
              </Box>
              <Box sx={{ height: isMobile ? 300 : 400, width: '100%' }}>
                {loading.mcqs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : filteredMcqs.length === 0 ? (
                  <Typography variant="body1" color="error" sx={{ textAlign: 'center', mt: 2 }}>
                    No MCQs found. Please add some MCQs.
                  </Typography>
                ) : (
                  <DataGrid
                    key={`mcq-grid-${dataGridKey}`}
                    rows={filteredMcqs}
                    columns={mcqColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    loading={loading.mcqs}
                    getRowId={(row) => row._id}
                    checkboxSelection
                    rowHeight={80}
                    rowSelectionModel={selectedMcqIds}
                    onRowSelectionModelChange={(newSelection) => {
                      setSelectedMcqIds(newSelection);
                    }}
                    sx={dataGridSx}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
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
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
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
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                }}
              >
                Review and Confirm
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                Please review your selections below before confirming the creation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                Total Score: {calculateTotalScore()} ({selectedMcqIds.length} MCQs x 1 + {selectedCodeIds.length} Coding x 10)
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  Test Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    <strong>Name:</strong> {testDetails.test_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    <strong>Language:</strong> {testDetails.test_language || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    <strong>Status:</strong> {testDetails.status || 'Unknown'}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  Selected Coding Problems
                </Typography>
                {selectedCodeIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(90deg, #0c83c8, #fc7a46)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={16} />
                              Problem Statement
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Check size={16} />
                              No of Test Cases
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Tag size={16} />
                              Tags
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {codes
                          .filter((code) => selectedCodeIds.includes(code.id))
                          .map((code) => (
                            <TableRow key={code.id}>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{code.problem || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{code.testCasesCount || 0}</TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{code.tags || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="error" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No Coding Problems selected
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  bgcolor: 'white',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  Selected MCQs
                </Typography>
                {selectedMcqIds.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(90deg, #0c83c8, #fc7a46)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <HelpCircle size={16} />
                              Question
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <List size={16} />
                              Options
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Check size={16} />
                              Answer
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Tag size={16} />
                              Tags
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mcqs
                          .filter((mcq) => selectedMcqIds.includes(mcq._id))
                          .map((mcq) => (
                            <TableRow key={mcq._id}>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{mcq.mcq_question || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {mcq.mcq_options?.length ? mcq.mcq_options.join(', ') : 'None'}
                              </TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{mcq.mcq_answer || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {mcq.mcq_tag?.length ? mcq.mcq_tag.join(', ') : 'None'}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="error" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No MCQs selected
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, flexWrap: 'wrap', gap: 1 }}>
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

        <StyledFab
          onClick={activeStep === 3 ? handleOpenPreviewDialog : handleAddMenuOpen}
          disabled={activeStep === 3 && createLoading}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: 1000,
          }}
        >
          {activeStep === 3 ? (createLoading ? <CircularProgress size={24} color="#ffff" /> : <Save size={24} color="#ffff" />) : <Plus size={24} color="#ffff" />}
        </StyledFab>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAddMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              borderRadius: '8px',
            },
          }}
        >
          <MenuItem
            onClick={() => handleNavigate('/add_test')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            <FileText size={16} color="#0c83c8" sx={{ mr: 1 }} />
            Add Test
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add_coding')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            <Code size={16} color="#0c83c8" sx={{ mr: 1 }} />
            Add Coding Problem
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add_mcq')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            <HelpCircle size={16} color="#0c83c8" sx={{ mr: 1 }} />
            Add MCQ
          </MenuItem>
        </Menu>

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
            }}
          >
            Confirm Test Creation
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ fontSize: isMobile ? '14px' : '16px' }}>
              Review the test details below:
            </DialogContentText>
            <Typography variant="body2" sx={{ mt: 2, fontSize: isMobile ? '12px' : '14px' }}>
              <strong>Test Name:</strong> {testDetails.test_name}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
              <strong>Test Language:</strong> {testDetails.test_language}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
              <strong>Status:</strong> {testDetails.status}
            </Typography>
            {selectedCodeIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>Coding Problems:</strong> {selectedCodeIds.length} selected
              </Typography>
            )}
            {selectedMcqIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>MCQs:</strong> {selectedMcqIds.length} selected
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              <strong>Total Score:</strong> {calculateTotalScore()} ({selectedMcqIds.length} MCQs x 1 + {selectedCodeIds.length} Coding x 10)
            </Typography>
          </DialogContent>
          <DialogActions>
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
              onClick={handleCreateTest}
              disabled={createLoading}
              startIcon={createLoading ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '12px' },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: 'white',
              fontSize: isMobile ? '16px' : '18px',
            }}
          >
            {detailsDialogTitle}
            <IconButton onClick={handleCloseDetailsDialog}>
              <X size={20} color="white" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                maxHeight: '300px',
                overflow: 'auto',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
              }}
            >
              {detailsDialogContent.map((item, index) => (
                <Box
                  key={`${item}-${index}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    {item}
                  </Typography>
                  <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                    <Copy size={16} color="#0c83c8" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleCopyToClipboard(detailsDialogContent.join('\n'))}
              startIcon={<Copy size={16} />}
              sx={{
                color: '#0c83c8',
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
              }}
            >
              Copy All
            </Button>
            <Button
              onClick={handleCloseDetailsDialog}
              variant="contained"
              startIcon={<X size={16} />}
              sx={{
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                fontSize: isMobile ? '12px' : '14px',
                borderRadius: '8px',
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

export default AddTestModule;