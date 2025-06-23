import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllTests, fetchAllMcqs, fetchAllCodes, createTest, updateTest } from '../axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import Admin_Dashboard from '../components/AdminDash';
import { stepConnectorClasses } from '@mui/material/StepConnector';


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
    1: <DescriptionIcon />,
    2: <ListAltIcon />,
    3: <CodeIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Test Details', 'Select MCQs', 'Select Coding Problems'];

const UpdateTestModule = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [tests, setTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({ tests: true, codes: true, mcqs: true });
  const [error, setError] = useState({ tests: null, codes: null, mcqs: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [formData, setFormData] = useState({
    test_name: '',
    test_language: '',
    test_mcq_id: [],
    test_coding_id: [],
    test_total_score: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchTests = async () => {
      try {
        const response = await fetchAllTests();
        if (isMounted) {
          setTests(response.data);
          setLoading((prev) => ({ ...prev, tests: false }));
          setError((prev) => ({ ...prev, tests: null }));
        }
      } catch (error) {
        if (isMounted) {
          setError((prev) => ({ ...prev, tests: error.message }));
          setLoading((prev) => ({ ...prev, tests: false }));
          setSnackbar({
            open: true,
            message: `Error fetching tests: ${error.message}`,
            severity: 'error',
          });
        }
      }
    };

    const fetchCodes = async () => {
      try {
        const response = await fetchAllCodes();
        if (isMounted) {
          const codesData = response.codes || response.data || [];
          if (!Array.isArray(codesData)) {
            console.error('Expected array but got:', typeof codesData, codesData);
            setCodes([]);
            setLoading((prev) => ({ ...prev, codes: false }));
            setError((prev) => ({ ...prev, codes: 'Invalid data format received' }));
            return;
          }
          const formattedRows = codesData.map((item, index) => ({
            id: item._id || item.code_id || `temp-${index}`,
            code_id: item.code_id || 'N/A',
            problem: item.code_problem_statement || 'No description',
            tags: Array.isArray(item.code_tags) ? item.code_tags.join(', ') : item.code_tags || '',
            testCasesCount: Array.isArray(item.code_test_cases_id) ? item.code_test_cases_id.length : 0,
          }));
          setCodes(formattedRows);
          setLoading((prev) => ({ ...prev, codes: false }));
          setError((prev) => ({ ...prev, codes: null }));
        }
      } catch (error) {
        if (isMounted) {
          setError((prev) => ({ ...prev, codes: error.message }));
          setLoading((prev) => ({ ...prev, codes: false }));
          setCodes([]);
          setSnackbar({
            open: true,
            message: `Error fetching codes: ${error.message}`,
            severity: 'error',
          });
        }
      }
    };

    const fetchMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        if (isMounted) {
          setMcqs(response.data);
          setLoading((prev) => ({ ...prev, mcqs: false }));
          setError((prev) => ({ ...prev, mcqs: null }));
        }
      } catch (error) {
        if (isMounted) {
          setError((prev) => ({ ...prev, mcqs: error.message }));
          setLoading((prev) => ({ ...prev, mcqs: false }));
          setSnackbar({
            open: true,
            message: `Error fetching MCQs: ${error.message}`,
            severity: 'error',
          });
        }
      }
    };

    fetchTests();
    fetchCodes();
    fetchMcqs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const mcqScore = formData.test_mcq_id.length * 1;
    const codingScore = formData.test_coding_id.length * 10;
    setFormData((prev) => ({ ...prev, test_total_score: mcqScore + codingScore }));
    localStorage.setItem('testFormData', JSON.stringify(formData));
  }, [formData.test_mcq_id, formData.test_coding_id]);

  useEffect(() => {
    try {
      const savedFormData = JSON.parse(localStorage.getItem('testFormData'));
      if (savedFormData) {
        setFormData(savedFormData);
      }
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('testFormData');
    }
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Copied to clipboard!',
          severity: 'success',
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Failed to copy to clipboard',
          severity: 'error',
        });
      });
  };

  const handleViewDetails = (title, items) => {
    setDialogTitle(title);
    setDialogContent(Array.isArray(items) ? items : []);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent([]);
  };

  const handleOpenFormDialog = (mode = 'create', test = null) => {
    setFormMode(mode);
    setSelectedTestId(test?.test_id || null);
    setFormData({
      test_name: test?.test_name || '',
      test_language: test?.test_language || '',
      test_mcq_id: Array.isArray(test?.test_mcq_id) ? test.test_mcq_id : [],
      test_coding_id: Array.isArray(test?.test_coding_id) ? test.test_coding_id : [],
      test_total_score: test ? (test.test_mcq_id?.length || 0) * 1 + (test.test_coding_id?.length || 0) * 10 : 0,
    });
    setActiveStep(0);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setFormData({
      test_name: '',
      test_language: '',
      test_mcq_id: [],
      test_coding_id: [],
      test_total_score: 0,
    });
    setSelectedTestId(null);
    localStorage.removeItem('testFormData');
    setActiveStep(0);
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.test_name || !formData.test_language)) {
      setSnackbar({
        open: true,
        message: 'Test name and language are required',
        severity: 'error',
      });
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleFormSubmit();
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormSubmit = async () => {
    if (!formData.test_name || !formData.test_language) {
      setSnackbar({
        open: true,
        message: 'Test name and language are required',
        severity: 'error',
      });
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        test_name: formData.test_name,
        test_language: formData.test_language,
        test_mcq_id: formData.test_mcq_id.filter((id) => id && id.trim() !== ''),
        test_coding_id: formData.test_coding_id.filter((id) => id && id.trim() !== ''),
        test_total_score: formData.test_total_score,
      };

      if (formMode === 'create') {
        const response = await createTest(payload);
        setTests((prev) => [...prev, response.test || {}]);
        setSnackbar({
          open: true,
          message: 'Test created successfully',
          severity: 'success',
        });
      } else {
        const response = await updateTest({ test_id: selectedTestId, ...payload });
        setTests((prev) =>
          prev.map((t) => (t.test_id === selectedTestId ? { ...t, ...response.test } : t))
        );
        setSnackbar({
          open: true,
          message: 'Test updated successfully',
          severity: 'success',
        });
      }
      handleCloseFormDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.msg || error.message}`,
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const testColumns = [
    { field: 'test_name', headerName: 'Test Name', minWidth: 200, flex: 1 },
    { field: 'test_language', headerName: 'Language', minWidth: 150, flex: 1 },
    { field: 'test_total_score', headerName: 'Total Score', minWidth: 120, flex: 1 },
    {
      field: 'test_mcq_id',
      headerName: 'MCQ IDs',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const mcqIds = Array.isArray(params.value) ? params.value : [];
        if (!mcqIds.length) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${mcqIds.length} MCQs`}
              size="small"
              sx={{ borderColor: '#0c83c8', color: '#0c83c8' }}
              variant="outlined"
            />
            <Tooltip title="View All MCQ IDs">
              <IconButton
                size="small"
                onClick={() => handleViewDetails(`MCQ IDs for ${params.row.test_name}`, mcqIds)}
                aria-label="View MCQ IDs"
              >
                <ListAltIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(mcqIds.join('\n'))}
                aria-label="Copy MCQ IDs"
              >
                <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'test_coding_id',
      headerName: 'Coding IDs',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const codingIds = Array.isArray(params.value) ? params.value : [];
        if (!codingIds.length) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${codingIds.length} Codes`}
              size="small"
              sx={{ borderColor: '#fc7a46', color: '#fc7a46' }}
              variant="outlined"
            />
            <Tooltip title="View All Coding IDs">
              <IconButton
                size="small"
                onClick={() => handleViewDetails(`Coding IDs for ${params.row.test_name}`, codingIds)}
                aria-label="View Coding IDs"
              >
                <ListAltIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(codingIds.join('\n'))}
                aria-label="Copy Coding IDs"
              >
                <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Unknown'}
          color={params.value === 'enabled' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'test_id',
      headerName: 'Test ID',
      minWidth: 300,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tooltip title={params.value || ''}>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100% - 60px)',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
          <Tooltip title="Copy ID">
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(params.value)}
              sx={{ ml: 1 }}
              aria-label="Copy Test ID"
            >
              <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Test">
            <IconButton
              size="small"
              onClick={() => handleOpenFormDialog('update', params.row)}
              aria-label="Edit Test"
            >
              <EditIcon fontSize="small" sx={{ color: '#0c83c8' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const codeColumns = [
    { field: 'code_id', headerName: 'Code ID', minWidth: 200, flex: 1 },
    { field: 'problem', headerName: 'Problem Statement', minWidth: 400, flex: 2 },
    { field: 'tags', headerName: 'Tags', minWidth: 200, flex: 1 },
    { field: 'testCasesCount', headerName: 'Test Cases Count', minWidth: 150, flex: 1 },
  ];

  const mcqColumns = [
    { field: 'mcq_question', headerName: 'Question', minWidth: 300, flex: 2 },
    {
      field: 'mcq_options',
      headerName: 'Options',
      minWidth: 250,
      flex: 1.5,
      valueGetter: (params) => (Array.isArray(params.value) ? params.value.join(', ') : 'None'),
    },
    { field: 'mcq_answer', headerName: 'Answer', minWidth: 150, flex: 1 },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      minWidth: 200,
      flex: 1,
      valueGetter: (params) => (Array.isArray(params.value) ? params.value.join(', ') : 'None'),
    },
    { field: 'mcq_id', headerName: 'MCQ ID', minWidth: 250, flex: 1.5 },
  ];

  const formMcqColumns = [
    { field: 'mcq_question', headerName: 'Question', minWidth: 300, flex: 2 },
    { field: 'mcq_id', headerName: 'MCQ ID', minWidth: 250, flex: 1.5 },
  ];

  const formCodeColumns = [
    { field: 'code_id', headerName: 'Code ID', minWidth: 200, flex: 1 },
    { field: 'problem', headerName: 'Problem Statement', minWidth: 300, flex: 2 },
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
      fontSize: isMobile ? '12px' : '14px',
    },
    boxShadow: '0 2px 8px rgba(12, 131, 200, 0.05)',
    borderRadius: '12px',
    border: 'none',
    overflow: 'hidden',
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
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontWeight: '700',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            }}
          >
            Test Management Dashboard
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mt: 0.5, fontSize: { xs: '12px', sm: '14px' } }}
          >
            Manage tests, coding problems, and MCQs
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
            backgroundColor: '#ffffff',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: '#0c83c8',
                fontWeight: '500',
                fontSize: isMobile ? '14px' : '16px',
                textTransform: 'none',
                '&:hover': {
                  color: '#fc7a46',
                },
              },
              '& .Mui-selected': {
                color: '#0c83c8',
                fontWeight: '600',
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                height: 3,
              },
            }}
            aria-label="Test management tabs"
          >
            <Tab label="Tests" />
            <Tab label="Coding Problems" />
            <Tab label="MCQs" />
          </Tabs>
          <Box sx={{ height: { xs: 500, sm: 600 }, width: '100%' }}>
            {activeTab === 0 && (
              <>
                {error.tests && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                    {error.tests}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenFormDialog('create')}
                  sx={{
                    mb: 2,
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
                  disabled={loading.tests}
                  aria-label="Create new test"
                >
                  Create New Test
                </Button>
                <DataGrid
                  rows={tests}
                  columns={testColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.tests}
                  getRowId={(row) => row._id || row.test_id}
                  sx={dataGridSx}
                  aria-label="Tests DataGrid"
                />
              </>
            )}
            {activeTab === 1 && (
              <>
                {error.codes && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                    {error.codes}
                  </Alert>
                )}
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : codes.length === 0 && !error.codes ? (
                  <Typography variant="body1" align="center" sx={{ p: 4, color: '#4b5563' }}>
                    No coding problems available
                  </Typography>
                ) : (
                  <DataGrid
                    rows={codes}
                    columns={codeColumns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    loading={loading.codes}
                    getRowId={(row) => row.id}
                    sx={dataGridSx}
                    aria-label="Coding Problems DataGrid"
                  />
                )}
              </>
            )}
            {activeTab === 2 && (
              <>
                {error.mcqs && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                    {error.mcqs}
                  </Alert>
                )}
                {loading.mcqs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : mcqs.length === 0 && !error.mcqs ? (
                  <Typography variant="body1" align="center" sx={{ p: 4, color: '#4b5563' }}>
                    No MCQs available
                  </Typography>
                ) : (
                  <DataGrid
                    rows={mcqs}
                    columns={mcqColumns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    loading={loading.mcqs}
                    getRowId={(row) => row._id || row.mcq_id}
                    sx={dataGridSx}
                    aria-label="MCQs DataGrid"
                  />
                )}
              </>
            )}
          </Box>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 131, 200, 0.1)',
            },
          }}
          aria-labelledby="view-ids-dialog-title"
        >
          <DialogTitle
            id="view-ids-dialog-title"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderBottom: '1px solid #e3f2fd',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '600',
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
            }}
          >
            {dialogTitle}
            <IconButton onClick={handleCloseDialog} aria-label="Close dialog">
              <CloseIcon sx={{ color: '#0c83c8' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3, backgroundColor: '#fff' }}>
            <Box
              sx={{
                maxHeight: '400px',
                overflow: 'auto',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              {dialogContent.length ? (
                dialogContent.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderBottom: index < dialogContent.length - 1 ? '1px solid #eee' : 'none',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#1f2937', fontSize: isMobile ? '12px' : '14px' }}
                    >
                      {item}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyToClipboard(item)}
                      aria-label={`Copy ID ${item}`}
                    >
                      <ContentCopyIcon fontSize="small" sx={{ color: '#0c83c8' }} />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: '#4b5563', fontSize: isMobile ? '12px' : '14px' }}
                >
                  No items to display
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between', backgroundColor: '#fff' }}>
            <Typography variant="caption" color="textSecondary" sx={{ color: '#4b5563' }}>
              {dialogContent.length} items
            </Typography>
            <Box>
              <Button
                onClick={() => handleCopyToClipboard(dialogContent.join('\n'))}
                sx={{
                  color: '#0c83c8',
                  borderColor: '#0c83c8',
                  fontWeight: '500',
                  mr: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#fc7a46',
                    color: '#fc7a46',
                    backgroundColor: '#e3f2fd',
                  },
                }}
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                disabled={!dialogContent.length}
                aria-label="Copy all IDs"
              >
                Copy All
              </Button>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: '#ffffff',
                  fontWeight: '500',
                  px: 3,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                }}
                variant="contained"
                aria-label="Close dialog"
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Dialog
          open={formDialogOpen}
          onClose={handleCloseFormDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(12, 131, 200, 0.1)',
            },
          }}
          aria-labelledby="form-test-dialog-title"
        >
          <DialogTitle
            id="form-test-dialog-title"
            sx={{
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #e3f2fd',
              fontWeight: '600',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {formMode === 'create' ? 'Create New Test' : 'Update Test'}
            <IconButton
              onClick={handleCloseFormDialog}
              disabled={formLoading}
              aria-label="Close form dialog"
            >
              <CloseIcon sx={{ color: '#0c83c8' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3, backgroundColor: '#fff' }}>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
              sx={{
                padding: { xs: '12px 0', sm: '16px 0' },
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  fontWeight: '500',
                  color: activeStep >= 0 ? '#0c83c8' : '#6b7280',
                },
              }}
              aria-label="Test creation steps"
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeStep === 0 && (
                <>
                  <TextField
                    label="Test Name"
                    value={formData.test_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, test_name: e.target.value }))
                    }
                    fullWidth
                    required
                    error={!formData.test_name}
                    helperText={!formData.test_name ? 'Test name is required' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&:hover fieldset': {
                          borderColor: '#fc7a46',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0c83c8',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#0c83c8',
                      },
                      '& .Mui-error fieldset': {
                        borderColor: '#dc2626',
                      },
                    }}
                    aria-required="true"
                  />
                  <FormControl
                    fullWidth
                    required
                    error={!formData.test_language}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&:hover fieldset': {
                          borderColor: '#fc7a46',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0c83c8',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#0c83c8',
                      },
                      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dc2626',
                      },
                    }}
                  >
                    <InputLabel id="test-language-label">Language</InputLabel>
                    <Select
                      labelId="test-language-label"
                      value={formData.test_language}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, test_language: e.target.value }))
                      }
                      label="Language"
                      aria-required="true"
                    >
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="Java">Java</MenuItem>
                      <MenuItem value="Python">Python</MenuItem>
                      <MenuItem value="JavaScript">JavaScript</MenuItem>
                    </Select>
                    {!formData.test_language && (
                      <Typography variant="caption" color="error">
                        Language is required
                      </Typography>
                    )}
                  </FormControl>
                </>
              )}
              {activeStep === 1 && (
                <>
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
                    Select MCQs
                  </Typography>
                  <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                    <DataGrid
                      rows={mcqs}
                      columns={formMcqColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      loading={loading.mcqs}
                      getRowId={(row) => row._id || row.mcq_id}
                      checkboxSelection
                      rowSelectionModel={mcqs
                        .filter((mcq) => formData.test_mcq_id.includes(mcq.mcq_id))
                        .map((mcq) => mcq._id || mcq.mcq_id)}
                      onRowSelectionModelChange={(newSelection) => {
                        const selectedMcqIds = newSelection
                          .map((id) =>
                            mcqs.find((mcq) => (mcq._id || mcq.mcq_id) === id)?.mcq_id
                          )
                          .filter(Boolean);
                        setFormData((prev) => ({ ...prev, test_mcq_id: selectedMcqIds }));
                      }}
                      sx={dataGridSx}
                      aria-label="MCQs selection DataGrid"
                    />
                  </Box>
                </>
              )}
              {activeStep === 2 && (
                <>
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
                    Select Coding Problems
                  </Typography>
                  <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, width: '100%' }}>
                    <DataGrid
                      rows={codes}
                      columns={formCodeColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5, 10, 20]}
                      loading={loading.codes}
                      getRowId={(row) => row.id}
                      checkboxSelection
                      rowSelectionModel={codes
                        .filter((code) => formData.test_coding_id.includes(code.code_id))
                        .map((code) => code.id)}
                      onRowSelectionModelChange={(newSelection) => {
                        const selectedCodeIds = newSelection
                          .map((id) => codes.find((code) => code.id === id)?.code_id)
                          .filter(Boolean);
                        setFormData((prev) => ({ ...prev, test_coding_id: selectedCodeIds }));
                      }}
                      sx={dataGridSx}
                      aria-label="Coding problems selection DataGrid"
                    />
                  </Box>
                </>
              )}
              <Typography
                variant="body1"
                sx={{ mt: 2, color: '#1f2937', fontSize: { xs: '0.95rem', sm: '1rem' } }}
              >
                Total Score: {formData.test_total_score} ({formData.test_mcq_id.length} MCQs x
                1 + {formData.test_coding_id.length} Coding x 10)
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between', backgroundColor: '#f5f7fa' }}>
            <Box>
              <Button
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
                  '&:disabled': {
                    color: '#b0bec5',
                    borderColor: '#b0bec5',
                  },
                }}
                variant="outlined"
                disabled={activeStep === 0 || formLoading}
                aria-label="Previous step"
              >
                Previous
              </Button>
            </Box>
            <Box>
              <Button
                onClick={handleCloseFormDialog}
                sx={{
                  color: '#0c83c8',
                  borderColor: '#0c83c8',
                  fontWeight: '500',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  mr: 1,
                  '&:hover': {
                    borderColor: '#fc7a46',
                    color: '#fc7a46',
                    backgroundColor: '#e3f2fd',
                  },
                  '&:disabled': {
                    color: '#b0bec5',
                    borderColor: '#b0bec5',
                  },
                }}
                variant="outlined"
                disabled={formLoading}
                aria-label="Cancel form"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
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
                  '&:disabled': {
                    backgroundColor: '#b0bec5',
                    color: '#ffffff',
                  },
                }}
                disabled={
                  formLoading ||
                  (activeStep === 0 && (!formData.test_name || !formData.test_language))
                }
                startIcon={
                  formLoading && activeStep === steps.length - 1 ? (
                    <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                  ) : null
                }
                aria-label={
                  activeStep === steps.length - 1
                    ? formMode === 'create'
                      ? 'Create test'
                      : 'Update test'
                    : 'Next step'
                }
              >
                {activeStep === steps.length - 1 ? (formMode === 'create' ? 'Create' : 'Update') : 'Next'}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: { xs: 6, sm: 2 }, mr: 2 }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              background:
                snackbar.severity === 'success'
                  ? 'linear-gradient(90deg, #0c83c8, #fc7a46)'
                  : undefined,
              color: '#ffffff',
              fontSize: '0.9rem',
              '& .MuiAlert-icon': {
                color: '#ffffff',
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UpdateTestModule;