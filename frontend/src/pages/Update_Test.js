import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Switch,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ClipboardList,
  Code,
  HelpCircle,
  Check,
  Save,
  X,
  Copy,
  Tag,
  Calendar,
  List,
  CheckCircle,
  Plus,
  Trophy,
  ToggleRight,
  Search,
  FileText,
} from 'lucide-react';
import { fetchAllTests, fetchAllCodes, fetchAllMcqs, updateTest, getTestById } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { Stepper, Step, StepLabel, StepConnector, styled } from '@mui/material';
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
    1: <ClipboardList size={24} />,
    2: <HelpCircle size={24} />,
    3: <Code size={24} />,
    4: <CheckCircle size={24} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select Test', 'Select MCQs', 'Select Coding Problems', 'Review and Confirm'];

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

const UpdateTestModule = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [filteredMcqs, setFilteredMcqs] = useState([]);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [codeSearchQuery, setCodeSearchQuery] = useState('');
  const [mcqSearchQuery, setMcqSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    tests: true,
    codes: true,
    mcqs: true,
  });
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChange, setStatusChange] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeStep, setActiveStep] = useState(0);
  const [dataGridKey, setDataGridKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Safe stringification for search filtering
  const safeStringify = (value) => {
    if (Array.isArray(value)) return value.map((v) => String(v)).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(safeStringify).join(' ');
    return String(value || '');
  };

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const testIds = JSON.parse(localStorage.getItem('selectedTestIds')) || [];
      const codeIds = JSON.parse(localStorage.getItem('selectedCodeIds')) || [];
      const mcqIds = JSON.parse(localStorage.getItem('selectedMcqIds')) || [];

      setSelectedTestIds(Array.isArray(testIds) ? testIds : []);
      setSelectedCodeIds(Array.isArray(codeIds) ? codeIds : []);
      setSelectedMcqIds(Array.isArray(mcqIds) ? mcqIds : []);
    } catch (error) {
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
    }
  }, []);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
    };
  }, []);

  // Fetch Tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testResponse = await fetchAllTests();
        const testData = testResponse.data?.tests || testResponse.data || [];
        if (!Array.isArray(testData)) {
          setTests([]);
          setFilteredTests([]);
        } else {
          setTests(testData);
          setFilteredTests(testData);
        }
        setLoading((prev) => ({ ...prev, tests: false }));
      } catch (error) {
        setSnackbarMessage('Unable to fetch tests. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setTests([]);
        setFilteredTests([]);
        setLoading((prev) => ({ ...prev, tests: false }));
      }
    };
    fetchTests();
  }, []);

  // Fetch Codes
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const codeResponse = await fetchAllCodes();
        const codesArray = codeResponse.codes || [];
        if (!Array.isArray(codesArray)) {
          setCodes([]);
          setFilteredCodes([]);
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
        setSnackbarMessage('Unable to fetch coding problems. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setCodes([]);
        setFilteredCodes([]);
        setLoading((prev) => ({ ...prev, codes: false }));
      }
    };
    fetchCodes();
  }, []);

  // Fetch MCQs
  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const mcqResponse = await fetchAllMcqs();
        const mcqData = mcqResponse.data?.mcqs || mcqResponse.data || [];
        if (!Array.isArray(mcqData)) {
          setMcqs([]);
          setFilteredMcqs([]);
        } else {
          setMcqs(mcqData);
          setFilteredMcqs(mcqData);
        }
        setLoading((prev) => ({ ...prev, mcqs: false }));
      } catch (error) {
        setSnackbarMessage('Unable to fetch MCQs. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setMcqs([]);
        setFilteredMcqs([]);
        setLoading((prev) => ({ ...prev, mcqs: false }));
      }
    };
    fetchMcqs();
  }, []);

  // Filter data based on search queries
  useEffect(() => {
    const filtered = tests.filter((test) =>
      safeStringify(test).toLowerCase().includes(testSearchQuery.toLowerCase())
    );
    setFilteredTests(filtered);
  }, [testSearchQuery, tests]);

  useEffect(() => {
    const filtered = codes.filter((code) =>
      safeStringify(code).toLowerCase().includes(codeSearchQuery.toLowerCase())
    );
    setFilteredCodes(filtered);
  }, [codeSearchQuery, codes]);

  useEffect(() => {
    const filtered = mcqs.filter((mcq) =>
      safeStringify(mcq).toLowerCase().includes(mcqSearchQuery.toLowerCase())
    );
    setFilteredMcqs(filtered);
  }, [mcqSearchQuery, mcqs]);

  // Fetch Test Details
  const fetchTestDetails = useCallback(async () => {
    if (loading.tests || loading.codes || loading.mcqs || !tests.length || !mcqs.length || !codes.length) {
      return;
    }

    if (selectedTestIds.length !== 1) {
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey((prev) => prev + 1);
      return;
    }

    const test = tests.find((test) => test._id === selectedTestIds[0]);
    if (!test || !test.test_id) {
      setSnackbarMessage('Invalid test selected.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey((prev) => prev + 1);
      return;
    }

    setSelectedTest(test);

    try {
      const testData = await getTestById(test.test_id);
      const mcqIds = mcqs
        .filter((mcq) => testData.test_mcq_id?.includes(mcq.mcq_id))
        .map((mcq) => mcq._id);
      const codeIds = codes
        .filter((code) => testData.test_coding_id?.includes(code.code_id))
        .map((code) => code.id);

      setSelectedMcqIds(mcqIds);
      setSelectedCodeIds(codeIds);
      localStorage.setItem('selectedMcqIds', JSON.stringify(mcqIds));
      localStorage.setItem('selectedCodeIds', JSON.stringify(codeIds));
      setDataGridKey((prev) => prev + 1);
    } catch (error) {
      setSnackbarMessage('Unable to fetch test details. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setDataGridKey((prev) => prev + 1);
    }
  }, [selectedTestIds, tests, mcqs, codes, loading.tests, loading.codes, loading.mcqs]);

  useEffect(() => {
    fetchTestDetails();
  }, [fetchTestDetails]);

  const calculateTotalScore = () => {
    return selectedMcqIds.length * 1 + selectedCodeIds.length * 10;
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
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

  const handleViewDetails = (title, items) => {
    setDetailsDialogTitle(title);
    setDetailsDialogContent(Array.isArray(items) ? items : []);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setDetailsDialogContent([]);
  };

  const handleOpenPreviewDialog = () => {
    if (selectedTestIds.length !== 1) {
      setSnackbarMessage('Please select exactly one test to update.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setPreviewDialogOpen(true);
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleOpenStatusDialog = (test, newStatus) => {
    if (!test || !test._id) {
      setSnackbarMessage('Please select a test to update its status.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setSelectedTest(test);
    setStatusChange(newStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusChange(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedTest || !selectedTest.test_id) {
      setSnackbarMessage('No valid test selected for status update.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      handleCloseStatusDialog();
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = {
        test_id: selectedTest.test_id,
        status: statusChange,
      };

      await updateTest(updateData);
      setSnackbarMessage(`Test status updated to ${statusChange} successfully!`);
      setSnackbarSeverity('success');

      const refreshResponse = await fetchAllTests();
      const testData = refreshResponse.data?.tests || refreshResponse.data || [];
      if (Array.isArray(testData)) {
        setTests(testData);
        setFilteredTests(testData);
        const updatedTest = testData.find((t) => t.test_id === selectedTest.test_id);
        if (updatedTest) {
          setSelectedTest(updatedTest);
          setSelectedTestIds([updatedTest._id]);
          localStorage.setItem('selectedTestIds', JSON.stringify([updatedTest._id]));
        }
      } else {
        setTests([]);
        setFilteredTests([]);
      }

      handleCloseStatusDialog();
    } catch (error) {
      setSnackbarMessage('Unable to update test status. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedTestIds.length !== 1) {
      setSnackbarMessage('Please select exactly one test.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleUpdateTest = async () => {
    if (!selectedTest || !selectedTest.test_id) {
      setSnackbarMessage('No valid test selected for update.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const newMcqIds = mcqs
      .filter((mcq) => selectedMcqIds.includes(mcq._id))
      .filter((mcq) => mcq.mcq_id)
      .map((mcq) => mcq.mcq_id);

    const newCodeIds = codes
      .filter((code) => selectedCodeIds.includes(code.id))
      .filter((code) => code.code_id)
      .map((code) => code.code_id);

    if (!newMcqIds.length && !newCodeIds.length) {
      setSnackbarMessage('Please select at least one MCQ or coding problem.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updateData = {
      test_id: selectedTest.test_id,
      test_mcq_id: newMcqIds,
      test_coding_id: newCodeIds,
      test_total_score: calculateTotalScore(),
    };

    setUpdateLoading(true);
    setPreviewDialogOpen(false);

    try {
      await updateTest(updateData);
      setSnackbarMessage('Test updated successfully!');
      setSnackbarSeverity('success');

      const refreshResponse = await fetchAllTests();
      const testData = refreshResponse.data?.tests || refreshResponse.data || [];
      if (Array.isArray(testData)) {
        setTests(testData);
        setFilteredTests(testData);
      } else {
        setTests([]);
        setFilteredTests([]);
      }

      setSelectedTestIds([]);
      setSelectedCodeIds([]);
      setSelectedMcqIds([]);
      setSelectedTest(null);
      localStorage.removeItem('selectedTestIds');
      localStorage.removeItem('selectedCodeIds');
      localStorage.removeItem('selectedMcqIds');
      setActiveStep(0);
      setDataGridKey((prev) => prev + 1);
    } catch (error) {
      setSnackbarMessage('Unable to update test. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setUpdateLoading(false);
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

  const testColumns = [
    {
      field: 'test_name',
      headerName: 'Test Name',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Test Name
          </Typography>
        </Box>
      ),
    },
    {
      field: 'test_language',
      headerName: 'Language',
      minWidth: isMobile ? 120 : 150,
      flex: 0.5,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Language
          </Typography>
        </Box>
      ),
    },
    {
      field: 'test_total_score',
      headerName: 'Total Score',
      minWidth: isMobile ? 100 : 120,
      flex: 0.4,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Total Score
          </Typography>
        </Box>
      ),
    },
    {
      field: 'test_mcq_id',
      headerName: 'MCQ IDs',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            MCQ IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
          return (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >
              None
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >{`${params.value.length} MCQs`}</Typography>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(`MCQ IDs for ${params.row.test_name}`, params.value)}
            >
              <List size={16} color="#0c83c8" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(params.value.join('\n'))}
            >
              <Copy size={16} color="#0c83c8" />
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: 'test_coding_id',
      headerName: 'Coding IDs',
      minWidth: isMobile ? 150 : 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Coding IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => {
        if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
          return (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >
              None
            </Typography>
          );
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >{`${params.value.length} Codes`}</Typography>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(`Coding IDs for ${params.row.test_name}`, params.value)}
            >
              <List size={16} color="#0c83c8" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(params.value.join('\n'))}
            >
              <Copy size={16} color="#0c83c8" />
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: isMobile ? 120 : 150,
      flex: 0.5,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ToggleRight size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Status
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
            {params.value || 'Unknown'}
          </Typography>
          <Switch
            checked={params.value === 'active'}
            onChange={(e) => {
              e.stopPropagation();
              handleOpenStatusDialog(params.row, params.value === 'active' ? 'disabled' : 'active');
            }}
            disabled={updateLoading}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#0c83c8',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              },
            }}
          />
        </Box>
      ),
    },
  ];

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
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: isMobile ? 150 : 180,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Created At
          </Typography>
        </Box>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      minWidth: isMobile ? 150 : 180,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Updated At
          </Typography>
        </Box>
      ),
    },
  ];

  const mcqColumns = [
    {
      field: 'mcq_question',
      headerName: 'Question',
      minWidth: isMobile ? 200 : 300,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Question
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mcq_options',
      headerName: 'Options',
      minWidth: isMobile ? 150 : 250,
      flex: 0.8,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Options
          </Typography>
        </Box>
      ),
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
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Answer
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      minWidth: isMobile ? 120 : 200,
      flex: 0.6,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
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
              <ClipboardList size={24} />
              <Typography variant="h5" fontWeight={600}>
                <span style={{ color: '#fff' }}>Update </span>
                <span style={{ padding: '4px 8px', borderRadius: '6px' }}>Test</span>
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Manage test configurations
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
                Select Test
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search tests..."
                  value={testSearchQuery}
                  onChange={(e) => setTestSearchQuery(e.target.value)}
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
                  key={`test-grid-${dataGridKey}`}
                  rows={filteredTests}
                  columns={testColumns}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  loading={loading.tests}
                  getRowId={(row) => row._id}
                  checkboxSelection
                  rowSelectionModel={selectedTestIds}
                  onRowSelectionModelChange={(newSelection) => {
                    const updatedSelection = newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : [];
                    setSelectedTestIds(updatedSelection);
                    localStorage.setItem('selectedTestIds', JSON.stringify(updatedSelection));
                  }}
                  sx={dataGridSx}
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
                  onClick={() => navigate('/add-mcq')}
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
                      localStorage.setItem('selectedMcqIds', JSON.stringify(newSelection));
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
                  onClick={() => navigate('/add-coding')}
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
                      localStorage.setItem('selectedCodeIds', JSON.stringify(newSelection));
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
                Please review your selections below before confirming the update.
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
                  Selected Test
                </Typography>
                {selectedTestIds.length === 1 && selectedTest ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      <strong>Name:</strong> {selectedTest.test_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      <strong>Language:</strong> {selectedTest.test_language || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      <strong>Status:</strong> {selectedTest.status || 'Unknown'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                    No Test found
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
                                {Array.isArray(mcq.mcq_options) && mcq.mcq_options.length > 0 ? (
                                  mcq.mcq_options.map((option, index) => (
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
                                  ))
                                ) : (
                                  'None'
                                )}
                              </TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>{mcq.mcq_answer || 'N/A'}</TableCell>
                              <TableCell sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                                {Array.isArray(mcq.mcq_tag) && mcq.mcq_tag.length > 0 ? mcq.mcq_tag.join(', ') : 'None'}
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
          disabled={activeStep === 3 && (updateLoading || selectedTestIds.length !== 1)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 20 },
            right: { xs: 16, sm: 20 },
            zIndex: 1000,
          }}
        >
          {activeStep === 3 ? (
            updateLoading ? (
              <CircularProgress size={24} color="#ffff" />
            ) : (
              <Save size={24} color="#ffff" />
            )
          ) : (
            <Plus size={24} color="#ffff" />
          )}
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
            onClick={() => handleNavigate('/add-test')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ClipboardList size={16} color="#0c83c8" /> Add Test
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add-coding')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Code size={16} color="#0c83c8" /> Add Coding Problem
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigate('/add-mcq')}
            sx={{
              '&:hover': { backgroundColor: '#e3f2fd' },
              fontSize: isMobile ? '12px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <HelpCircle size={16} color="#0c83c8" /> Add MCQ
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
            Confirm Test Update
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <DialogContentText sx={{ fontSize: isMobile ? '14px' : '16px' }}>
              Review the changes below:
            </DialogContentText>
            {selectedTest && (
              <Typography variant="body2" sx={{ mt: 2, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>Test:</strong> {selectedTest.test_name || 'Unknown'}
              </Typography>
            )}
            {selectedMcqIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>MCQs:</strong> {selectedMcqIds.length} selected
              </Typography>
            )}
            {selectedCodeIds.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>Coding Problems:</strong> {selectedCodeIds.length} selected
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
              onClick={handleUpdateTest}
              disabled={updateLoading}
              startIcon={updateLoading ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
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
          open={statusDialogOpen}
          onClose={handleCloseStatusDialog}
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
            Confirm Status Change
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <DialogContentText sx={{ fontSize: isMobile ? '14px' : '16px' }}>
              {statusChange === 'active'
                ? `Are you sure you want to activate this test? It will become available to users. Ensure it has sufficient questions (currently ${selectedMcqIds.length} MCQs, ${selectedCodeIds.length} coding problems).`
                : `Are you sure you want to disable this test? It will no longer be available to users.`}
            </DialogContentText>
            {selectedTest && (
              <Typography variant="body2" sx={{ mt: 2, fontSize: isMobile ? '12px' : '14px' }}>
                <strong>Test:</strong> {selectedTest.test_name || 'Unknown'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseStatusDialog}
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
              onClick={handleToggleStatus}
              disabled={updateLoading}
              startIcon={updateLoading ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
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
          <DialogContent dividers sx={{ p: 3 }}>
            <Box
              sx={{
                maxHeight: '80vh',
                overflow: 'auto',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              {detailsDialogContent.length ? (
                detailsDialogContent.map((item, index) => (
                  <Box
                    key={`${item}-${index}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderBottom: index < detailsDialogContent.length - 1 ? '1px solid #eee' : 'none',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                      {item}
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                      <Copy size={16} color="#0c83c8" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                  No items to display
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
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
              variant="contained"
              onClick={handleCloseDetailsDialog}
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

export default UpdateTestModule;