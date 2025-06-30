import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { stepConnectorClasses } from '@mui/material/StepConnector';
import Admin_Dashboard from "../components/AdminDash";
import { fetchAllCodes, fetchAllTestCases, updateCode } from "../axios";
import { useNavigate } from "react-router-dom";

// UUID validation regex
const isValidUUID = (id) => {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

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
  ...(ownerState?.active || ownerState?.completed
    ? {
        background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
        boxShadow: '0 4px 12px rgba(12, 131, 200, 0.3)',
      }
    : {}),
}));

function ColorlibStepIcon(props) {
  const { active = false, completed = false, className, icon } = props;

  const icons = {
    1: <CodeIcon />,
    2: <BugReportIcon />,
    3: <SaveIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = ['Select Code', 'Select Test Cases', 'Review and Confirm'];

const Update_coding = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [codeRows, setCodeRows] = useState([]);
  const [testcaseRows, setTestcaseRows] = useState([]);
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [selectedTestcaseIds, setSelectedTestcaseIds] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState({
    codes: true,
    testcases: true,
    update: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const codeId = JSON.parse(localStorage.getItem('selectedCodeId'));
      const testcaseIds = JSON.parse(localStorage.getItem('selectedTestcaseIds')) || [];

      if (codeId && isValidUUID(codeId)) {
        setSelectedCodeId(codeId);
      } else if (codeId) {
        console.warn('Invalid codeId in localStorage:', codeId);
        localStorage.removeItem('selectedCodeId');
      }
      setSelectedTestcaseIds(
        Array.isArray(testcaseIds) ? testcaseIds.filter(id => isValidUUID(id)) : []
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load saved selections.',
        severity: 'error',
      });
      localStorage.removeItem('selectedCodeId');
      localStorage.removeItem('selectedTestcaseIds');
    }
  }, []);

  // Clear localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedCodeId');
      localStorage.removeItem('selectedTestcaseIds');
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const codeResponse = await fetchAllCodes();
        const codesArray = Array.isArray(codeResponse.data)
          ? codeResponse.data
          : Array.isArray(codeResponse.data?.codes)
          ? codeResponse.data.codes
          : Array.isArray(codeResponse.codes)
          ? codeResponse.codes
          : [];
        if (!Array.isArray(codesArray)) {
          throw new Error('Code data is not an array');
        }
        const formattedCodes = codesArray
          .filter(item => isValidUUID(item.code_id))
          .map((item, index) => ({
            id: item.code_id, // Use code_id as the unique identifier
            code_id: item.code_id || 'N/A',
            problem: item.code_problem_statement || 'N/A',
            testCasesCount: Array.isArray(item.code_test_cases_id)
              ? item.code_test_cases_id.length
              : Array.isArray(item.code_test_cases)
              ? item.code_test_cases.length
              : 0,
            tags: Array.isArray(item.code_tags) ? [...new Set(item.code_tags)] : [],
            createdAt: item.createdAt && !isNaN(new Date(item.createdAt))
              ? new Date(item.createdAt).toLocaleString()
              : 'N/A',
            updatedAt: item.updatedAt && !isNaN(new Date(item.updatedAt))
              ? new Date(item.updatedAt).toLocaleString()
              : 'N/A',
          }));
        setCodeRows(formattedCodes);
        if (formattedCodes.length === 0) {
          setSnackbar({
            open: true,
            message: 'No valid codes found. Please ensure code IDs are valid UUIDs.',
            severity: 'warning',
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to fetch code data: ${
            error.response?.status
              ? `HTTP ${error.response.status}: ${error.response?.data?.msg || error.message}`
              : error.message || 'Unknown error'
          }`,
          severity: 'error',
        });
      } finally {
        setLoading(prev => ({ ...prev, codes: false }));
      }

      try {
        const testcaseResponse = await fetchAllTestCases();
        const testcasesArray = Array.isArray(testcaseResponse.data)
          ? testcaseResponse.data
          : Array.isArray(testcaseResponse)
          ? testcaseResponse
          : [];
        const formattedTestcases = testcasesArray
          .filter(item => isValidUUID(item.testcase_id))
          .map((item, index) => ({
            id: item.testcase_id, // Use testcase_id as the unique identifier
            testcase_id: item.testcase_id || 'N/A',
            input: Array.isArray(item.testcase_input)
              ? item.testcase_input.join(', ')
              : item.testcase_input || 'N/A',
            output: Array.isArray(item.testcase_output)
              ? item.testcase_output.join(', ')
              : item.testcase_output || 'N/A',
            tags: Array.isArray(item.testcase_tags) ? [...new Set(item.testcase_tags)] : [],
            createdAt: item.createdAt && !isNaN(new Date(item.createdAt))
              ? new Date(item.createdAt).toLocaleString()
              : 'N/A',
            updatedAt: item.updatedAt && !isNaN(new Date(item.updatedAt))
              ? new Date(item.updatedAt).toLocaleString()
              : 'N/A',
          }));
        setTestcaseRows(formattedTestcases);
        if (formattedTestcases.length === 0) {
          setSnackbar({
            open: true,
            message: 'No valid test cases found. Please ensure test case IDs are valid UUIDs.',
            severity: 'warning',
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to fetch test cases: ${
            error.response?.status
              ? `HTTP ${error.response.status}: ${error.response?.data?.msg || error.message}`
              : error.message || 'Unknown error'
          }`,
          severity: 'error',
        });
      } finally {
        setLoading(prev => ({ ...prev, testcases: false }));
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && !selectedCodeId) {
      setSnackbar({
        open: true,
        message: 'Please select exactly one code.',
        severity: 'error',
      });
      return;
    }
    if (activeStep === 0 && !isValidUUID(selectedCodeId)) {
      setSnackbar({
        open: true,
        message: `Selected code ID (${selectedCodeId}) is not a valid UUID.`,
        severity: 'error',
      });
      setSelectedCodeId(null);
      localStorage.removeItem('selectedCodeId');
      return;
    }
    if (activeStep === 1 && selectedTestcaseIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one test case.',
        severity: 'error',
      });
      return;
    }
    if (activeStep === 1) {
      const invalidIds = selectedTestcaseIds.filter(id => !isValidUUID(id));
      if (invalidIds.length > 0) {
        setSnackbar({
          open: true,
          message: `Invalid test case ID(s) selected: ${invalidIds.join(', ')}`,
          severity: 'error',
        });
        setSelectedTestcaseIds(selectedTestcaseIds.filter(id => isValidUUID(id)));
        localStorage.setItem('selectedTestcaseIds', JSON.stringify(selectedTestcaseIds.filter(id => isValidUUID(id))));
        return;
      }
    }
    if (activeStep === steps.length - 1) {
      setPreviewDialogOpen(true);
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  const handleConfirmAssociation = async () => {
    if (!selectedCodeId || selectedTestcaseIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Missing required selections.',
        severity: 'error',
      });
      setPreviewDialogOpen(false);
      return;
    }

    if (!isValidUUID(selectedCodeId)) {
      setSnackbar({
        open: true,
        message: `Selected code ID (${selectedCodeId}) is not a valid UUID.`,
        severity: 'error',
      });
      setPreviewDialogOpen(false);
      setSelectedCodeId(null);
      localStorage.removeItem('selectedCodeId');
      return;
    }

    const invalidTestcaseIds = selectedTestcaseIds.filter(id => !isValidUUID(id));
    if (invalidTestcaseIds.length > 0) {
      setSnackbar({
        open: true,
        message: `Invalid test case ID(s): ${invalidTestcaseIds.join(', ')}`,
        severity: 'error',
      });
      setPreviewDialogOpen(false);
      setSelectedTestcaseIds(selectedTestcaseIds.filter(id => isValidUUID(id)));
      localStorage.setItem('selectedTestcaseIds', JSON.stringify(selectedTestcaseIds.filter(id => isValidUUID(id))));
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));

    try {
      const selectedCode = codeRows.find((row) => row.id === selectedCodeId);
      if (!selectedCode) {
        throw new Error('Selected code not found in data');
      }
      const testcaseIdsToAdd = selectedTestcaseIds.filter(id => isValidUUID(id));

      const payload = {
        code_id: selectedCode.id,
        code_test_cases_id: testcaseIdsToAdd,
      };

      await updateCode(payload);

      setSnackbar({
        open: true,
        message: 'Code association updated successfully!',
        severity: 'success',
      });

      // Refresh data
      const codeResponse = await fetchAllCodes();
      const codesArray = Array.isArray(codeResponse.data)
        ? codeResponse.data
        : Array.isArray(codeResponse.data?.codes)
        ? codeResponse.data.codes
        : Array.isArray(codeResponse.codes)
        ? codeResponse.codes
        : [];
      const formattedCodes = codesArray
        .filter(item => isValidUUID(item.code_id))
        .map((item, index) => ({
          id: item.code_id,
          code_id: item.code_id || 'N/A',
          problem: item.code_problem_statement || 'N/A',
          testCasesCount: Array.isArray(item.code_test_cases_id)
            ? item.code_test_cases_id.length
            : Array.isArray(item.code_test_cases)
            ? item.code_test_cases.length
            : 0,
          tags: Array.isArray(item.code_tags) ? [...new Set(item.code_tags)] : [],
          createdAt: item.createdAt && !isNaN(new Date(item.createdAt))
            ? new Date(item.createdAt).toLocaleString()
            : 'N/A',
          updatedAt: item.updatedAt && !isNaN(new Date(item.updatedAt))
            ? new Date(item.updatedAt).toLocaleString()
            : 'N/A',
        }));
      setCodeRows(formattedCodes);

      setPreviewDialogOpen(false);
      setSelectedCodeId(null);
      setSelectedTestcaseIds([]);
      localStorage.removeItem('selectedCodeId');
      localStorage.removeItem('selectedTestcaseIds');
      setActiveStep(0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.msg || error.message || 'Failed to update code association'}`,
        severity: 'error',
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleAddCode = () => {
    navigate('/add_coding');
  };

  const handleAddTestcase = () => {
    navigate('/add_testcase');
  };

  const renderTagChips = (tags) => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>No tags</Typography>;
    }
    return tags.map((tag, index) => (
      <Tooltip title={tag} key={index}>
        <Chip
          label={tag.trim()}
          size="small"
          sx={{
            m: 0.5,
            backgroundColor: '#e3f2fd',
            color: '#0c83c8',
            fontSize: { xs: '10px', sm: '12px' },
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#d1e9ff',
            },
          }}
        />
      </Tooltip>
    ));
  };

  const codeColumns = [
    // {
    //   field: 'code_id',
    //   headerName: 'Code ID',
    //   minWidth: 150,
    //   flex: 1,
    //   renderHeader: () => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Typography variant="inherit" fontWeight="bold">
    //         Code ID
    //       </Typography>
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Tooltip title={isValidUUID(params.value) ? 'Valid UUID' : 'Invalid UUID'}>
    //       <Typography
    //         variant="body2"
    //         sx={{
    //           color: isValidUUID(params.value) ? 'inherit' : 'error.main',
    //           fontSize: { xs: '12px', sm: '14px' },
    //         }}
    //       >
    //         {params.value}
    //       </Typography>
    //     </Tooltip>
    //   ),
    // },
    {
      field: 'problem',
      headerName: 'Problem Statement',
      minWidth: 300,
      flex: 2,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Problem Statement
          </Typography>
        </Box>
      ),
    },
    {
      field: 'testCasesCount',
      headerName: 'No of Test Cases',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            No of Test Cases
          </Typography>
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
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {renderTagChips(params.value)}
        </Box>
      ),
    },
  ];

  const testcaseColumns = [
    // {
    //   field: 'testcase_id',
    //   headerName: 'Test Case ID',
    //   minWidth: 150,
    //   flex: 1,
    //   renderHeader: () => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //       <Typography variant="inherit" fontWeight="bold">
    //         Test Case ID
    //       </Typography>
    //     </Box>
    //   ),
    //   renderCell: (params) => (
    //     <Tooltip title={isValidUUID(params.value) ? 'Valid UUID' : 'Invalid UUID'}>
    //       <Typography
    //         variant="body2"
    //         sx={{
    //           color: isValidUUID(params.value) ? 'inherit' : 'error.main',
    //           fontSize: { xs: '12px', sm: '14px' },
    //         }}
    //       >
    //         {params.value}
    //       </Typography>
    //     </Tooltip>
    //   ),
    // },
    {
      field: 'input',
      headerName: 'Input',
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Input
          </Typography>
        </Box>
      ),
    },
    {
      field: 'output',
      headerName: 'Output',
      minWidth: 200,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Output
          </Typography>
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
          <Typography variant="inherit" fontWeight="bold">
            Tags
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {renderTagChips(params.value)}
        </Box>
      ),
    },
  ];

  const dataGridSx = {
    borderRadius: '12px',
    '& .MuiDataGrid-columnHeaders': {
      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
      color: '#fff',
      fontWeight: '600',
      fontSize: { xs: '14px', sm: '15px' },
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f8fafc',
      },
      '&:hover': {
        backgroundColor: '#e3f2fd',
      },
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

  const selectedCode = codeRows.find((row) => row.id === selectedCodeId);
  const selectedTestcases = testcaseRows.filter((row) => selectedTestcaseIds.includes(row.id));

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: '#f5f7fa',
          minHeight: '100vh',
          position: 'relative',
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
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CodeIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight={600}
                sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
              >
                Update Code Associations
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              sx={{ mt: 0.5, fontSize: { xs: '12px', sm: '14px' } }}
            >
              Manage code and test case assignments
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Code
                </Typography>
                <Tooltip title="Add a new code">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCode}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    Add Code
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : codeRows.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                    No valid codes available. Please add a code with a valid UUID or check the API.
                  </Typography>
                ) : (
                  <DataGrid
                    rows={codeRows}
                    columns={codeColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    disableMultipleRowSelection
                    rowSelectionModel={selectedCodeId ? [selectedCodeId] : []}
                    onRowSelectionModelChange={(newSelection) => {
                      const updatedSelection = newSelection.length > 0 ? newSelection[0] : null;
                      if (updatedSelection && !isValidUUID(updatedSelection)) {
                        setSnackbar({
                          open: true,
                          message: `Selected code ID (${updatedSelection}) is not a valid UUID.`,
                          severity: 'error',
                        });
                        return;
                      }
                      setSelectedCodeId(updatedSelection);
                      localStorage.setItem('selectedCodeId', JSON.stringify(updatedSelection));
                    }}
                    sx={dataGridSx}
                    aria-label="Codes DataGrid"
                    isRowSelectable={(params) => isValidUUID(params.row.id)}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Tooltip title="Proceed to select test cases">
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedCodeId || loading.codes}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    Next
                  </Button>
                </Tooltip>
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
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Select Test Cases
                </Typography>
                <Tooltip title="Add a new test case">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddTestcase}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    Add Test Case
                  </Button>
                </Tooltip>
              </Box>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {loading.testcases ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
                ) : testcaseRows.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                    No valid test cases available. Please add a test case with a valid UUID or check the API.
                  </Typography>
                ) : (
                  <DataGrid
                    rows={testcaseRows}
                    columns={testcaseColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    getRowId={(row) => row.id}
                    checkboxSelection
                    rowSelectionModel={selectedTestcaseIds}
                    onRowSelectionModelChange={(newSelection) => {
                      const invalidIds = newSelection.filter(id => !isValidUUID(id));
                      if (invalidIds.length > 0) {
                        setSnackbar({
                          open: true,
                          message: `Invalid test case ID(s) selected: ${invalidIds.join(', ')}`,
                          severity: 'error',
                        });
                        return;
                      }
                      setSelectedTestcaseIds(newSelection);
                      localStorage.setItem('selectedTestcaseIds', JSON.stringify(newSelection));
                    }}
                    sx={dataGridSx}
                    aria-label="Test Cases DataGrid"
                    isRowSelectable={(params) => isValidUUID(params.row.id)}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Go back to code selection">
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
                </Tooltip>
                <Tooltip title="Proceed to review selections">
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={selectedTestcaseIds.length === 0 || loading.testcases}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    Next
                  </Button>
                </Tooltip>
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
                Review and Confirm
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                Please review your selections below before confirming the update.
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
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                  }}
                >
                  Selected Code
                </Typography>
                {selectedCode ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      <strong>Code ID:</strong> {selectedCode.code_id || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      <strong>Problem:</strong> {selectedCode.problem || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      <strong>No of Test Cases:</strong> {selectedCode.testCasesCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      <strong>Tags:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {renderTagChips(selectedCode.tags)}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                    No Code selected
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
                  sx={{
                    mb: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '14px', sm: '16px' },
                  }}
                >
                  Selected Test Cases ({selectedTestcases.length})
                </Typography>
                {selectedTestcases.length > 0 ? (
                  <TableContainer sx={{ borderRadius: '8px' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(90deg, #0c83c8, #fc7a46)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                            Test Case ID
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                            Input
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                            Output
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' } }}>
                            Tags
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTestcases.map((tc) => (
                          <TableRow key={tc.id}>
                            <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                              <Tooltip title={isValidUUID(tc.testcase_id) ? 'Valid UUID' : 'Invalid UUID'}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: isValidUUID(tc.testcase_id) ? 'inherit' : 'error.main',
                                  }}
                                >
                                  {tc.testcase_id || 'N/A'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{tc.input || 'N/A'}</TableCell>
                            <TableCell sx={{ fontSize: { xs: '12px', sm: '14px' } }}>{tc.output || 'N/A'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {renderTagChips(tc.tags)}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="error" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                    No Test Cases selected
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Go back to test case selection">
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
                </Tooltip>
                <Tooltip title="Confirm selections and update">
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                      fontSize: { xs: '12px', sm: '14px' },
                      borderRadius: '8px',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.75 },
                    }}
                  >
                    Confirm
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Paper>
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
              fontSize: { xs: '16px', sm: '18px' },
            }}
          >
            Confirm Code Association
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
              Review the changes below:
            </DialogContentText>
            {selectedCode && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                  <strong>Code ID:</strong> {selectedCode.code_id || 'Unknown'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                  <strong>Problem:</strong> {selectedCode.problem || 'Unknown'}
                </Typography>
              </Box>
            )}
            {selectedTestcases.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                  <strong>Test Cases:</strong> {selectedTestcases.length} selected
                </Typography>
                {selectedTestcases.map((tc) => (
                  <Typography key={tc.id} variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' }, ml: 2 }}>
                    - {tc.testcase_id} {isValidUUID(tc.testcase_id) ? '' : '(Invalid UUID)'}
                  </Typography>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Tooltip title="Cancel and return to review">
              <Button
                onClick={handleClosePreviewDialog}
                sx={{
                  color: '#0c83c8',
                  fontSize: { xs: '12px', sm: '14px' },
                  borderRadius: '8px',
                }}
              >
                Cancel
              </Button>
            </Tooltip>
            <Tooltip title="Confirm and save changes">
              <Button
                variant="contained"
                onClick={handleConfirmAssociation}
                disabled={loading.update}
                startIcon={loading.update ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  fontSize: { xs: '12px', sm: '14px' },
                  borderRadius: '8px',
                }}
              >
                Confirm
              </Button>
            </Tooltip>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              background: snackbar.severity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Update_coding;