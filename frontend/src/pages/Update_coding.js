import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import SaveIcon from "@mui/icons-material/Save";
import { stepConnectorClasses } from '@mui/material/StepConnector';
import Admin_Dashboard from "../components/AdminDash";
import { fetchAllCodes, fetchAllTestCases, updateCode } from "../axios";

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
  const [codeRows, setCodeRows] = useState([]);
  const [testcaseRows, setTestcaseRows] = useState([]);
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [selectedTestcaseIds, setSelectedTestcaseIds] = useState([]);
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
  const [activeStep, setActiveStep] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const codeId = JSON.parse(localStorage.getItem('selectedCodeId'));
      const testcaseIds = JSON.parse(localStorage.getItem('selectedTestcaseIds')) || [];

      if (codeId) setSelectedCodeId(codeId);
      setSelectedTestcaseIds(Array.isArray(testcaseIds) ? testcaseIds : []);
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
        const codesArray = codeResponse.codes || [];
        if (!Array.isArray(codesArray)) {
          throw new Error("Code data is not an array");
        }
        const formattedCodes = codesArray.map((item, index) => ({
          id: item._id || `temp-id-${index}`,
          code_id: item.code_id || 'N/A',
          problem: item.code_problem_statement || 'N/A',
          testCasesCount: Array.isArray(item.code_test_cases_id)
            ? item.code_test_cases_id.length
            : Array.isArray(item.code_test_cases)
            ? item.code_test_cases.length
            : 0,
          tags: Array.isArray(item.code_tags) ? item.code_tags : [],
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A',
        }));
        setCodeRows(formattedCodes);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to fetch code data.',
          severity: 'error',
        });
      } finally {
        setLoading(prev => ({ ...prev, codes: false }));
      }

      try {
        const testcaseResponse = await fetchAllTestCases();
        const testcasesArray = Array.isArray(testcaseResponse) ? testcaseResponse : [];
        const formattedTestcases = testcasesArray.map((item, index) => ({
          id: item._id || `temp-id-${index}`,
          testcase_id: item.testcase_id || 'N/A',
          input: Array.isArray(item.testcase_input) ? item.testcase_input.join(', ') : 'N/A',
          output: Array.isArray(item.testcase_output) ? item.testcase_output.join(', ') : 'N/A',
          tags: Array.isArray(item.testcase_tags) ? item.testcase_tags : [],
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A',
        }));
        setTestcaseRows(formattedTestcases);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to fetch test cases.',
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
    if (activeStep === 1 && selectedTestcaseIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one test case.',
        severity: 'error',
      });
      return;
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

    setLoading(prev => ({ ...prev, update: true }));

    try {
      const selectedCode = codeRows.find((row) => row.id === selectedCodeId);
      const testcaseIdsToAdd = testcaseRows
        .filter((t) => selectedTestcaseIds.includes(t.id))
        .map((t) => t.testcase_id)
        .filter(Boolean);

      const payload = {
        code_id: selectedCode.code_id,
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
      const codesArray = codeResponse.codes || [];
      const formattedCodes = codesArray.map((item, index) => ({
        id: item._id || `temp-id-${index}`,
        code_id: item.code_id || 'N/A',
        problem: item.code_problem_statement || 'N/A',
        testCasesCount: Array.isArray(item.code_test_cases_id)
          ? item.code_test_cases_id.length
          : Array.isArray(item.code_test_cases)
          ? item.code_test_cases.length
          : 0,
        tags: Array.isArray(item.code_tags) ? item.code_tags : [],
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A',
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
        message: `Error: ${error.response?.data?.msg || error.message || 'Unknown error occurred'}`,
        severity: 'error',
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
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
          message: 'Failed to copy to clipboard.',
          severity: 'error',
        });
      });
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
          '&:hover': {
            backgroundColor: '#d1e9ff',
          },
        }}
      />
    ));
  };

  const codeColumns = [
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
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 180,
      flex: 1,
      hide: isMobile,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Created At
          </Typography>
        </Box>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      minWidth: 180,
      flex: 1,
      hide: isMobile,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Updated At
          </Typography>
        </Box>
      ),
    },
  ];

  const testcaseColumns = [
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
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 180,
      flex: 1,
      hide: isMobile,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Created At
          </Typography>
        </Box>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      minWidth: 180,
      flex: 1,
      hide: isMobile,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Updated At
          </Typography>
        </Box>
      ),
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
                Select Code
              </Typography>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
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
                    rowSelectionModel={selectedCodeId ? [selectedCodeId] : []}
                    onRowSelectionModelChange={(newSelection) => {
                      const updatedSelection = newSelection.length > 0 ? newSelection[newSelection.length - 1] : null;
                      setSelectedCodeId(updatedSelection);
                      localStorage.setItem('selectedCodeId', JSON.stringify(updatedSelection));
                    }}
                    sx={dataGridSx}
                    aria-label="Codes DataGrid"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
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
                Select Test Cases
              </Typography>
              <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
                {loading.testcases ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: '#0c83c8' }} />
                  </Box>
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
                      setSelectedTestcaseIds(newSelection);
                      localStorage.setItem('selectedTestcaseIds', JSON.stringify(newSelection));
                    }}
                    sx={dataGridSx}
                    aria-label="Test Cases DataGrid"
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
                  sx={{
                    background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                    '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    fontSize: { xs: '12px', sm: '14px' },
                    borderRadius: '8px',
                    px: { xs: '2', sm: 3 },
                    py: { xs: 0.5, sm: 0.75 },
                  }}
                >
                  Confirm
                </Button>
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
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Code:</strong> {selectedCode.problem || 'Unknown'}
              </Typography>
            )}
            {selectedTestcases.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Test Cases:</strong> {selectedTestcases.length} selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
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