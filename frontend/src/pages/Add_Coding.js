import React, { useEffect, useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import Admin_Dashboard from "../components/AdminDash";
import { createCodeProblem, fetchAllTestCases } from "../axios";
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

const steps = ['Add Coding Problem', 'Select Test Cases', 'Review and Confirm'];

const Add_Coding = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [problemStatement, setProblemStatement] = useState("");
  const [tags, setTags] = useState("");
  const [testcaseRows, setTestcaseRows] = useState([]);
  const [selectedTestcaseIds, setSelectedTestcaseIds] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState({ testcases: false, submit: false });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Fetch test cases with retry logic
  useEffect(() => {
    const fetchData = async (retries = 3, delay = 1000) => {
      setLoading(prev => ({ ...prev, testcases: true }));
      try {
        const response = await fetchAllTestCases();
        console.log('Test cases fetch response:', {
          status: response.status,
          data: response.data,
        });
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.testcases)
          ? response.data.testcases
          : [];
        if (data.length === 0) {
          console.warn('No test cases returned from API');
          setSnackbar({
            open: true,
            message: 'No valid test cases found. You can add test cases or proceed without selecting any.',
            severity: 'warning',
          });
        }
        const formattedTestcases = data
          .filter(item => isValidUUID(item.testcase_id))
          .map((item) => ({
            id: item.testcase_id,
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
        console.log('Formatted test cases:', formattedTestcases);
        setTestcaseRows(formattedTestcases);
      } catch (error) {
        console.error('Test case fetch error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          retriesLeft: retries - 1,
        });
        if (retries > 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchData(retries - 1, delay * 2);
        }
        setSnackbar({
          open: true,
          message: `Failed to fetch test cases: ${
            error.response?.data?.msg || error.message || 'Unknown error'
          }`,
          severity: 'error',
        });
      } finally {
        setLoading(prev => ({ ...prev, testcases: false }));
      }
    };
    if (activeStep === 1) {
      fetchData();
    }
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!problemStatement.trim()) {
        setSnackbar({
          open: true,
          message: 'Problem statement is required.',
          severity: 'error',
        });
        return;
      }
      if (!tags.trim()) {
        setSnackbar({
          open: true,
          message: 'At least one tag is required.',
          severity: 'error',
        });
        return;
      }
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

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      setSnackbar({
        open: true,
        message: 'Problem statement is required.',
        severity: 'error',
      });
      setPreviewDialogOpen(false);
      return;
    }
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagsArray.length === 0) {
      setSnackbar({
        open: true,
        message: 'At least one tag is required.',
        severity: 'error',
      });
      setPreviewDialogOpen(false);
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));

    const payload = {
      code_problem_statement: problemStatement,
      code_tags: tagsArray,
      code_test_cases_id: selectedTestcaseIds.filter(id => isValidUUID(id)),
    };
    console.log('Submitting code problem with payload:', payload);

    try {
      const response = await createCodeProblem(payload);
      console.log('Create code problem response:', {
        status: response.status,
        data: response.data,
      });

      setSnackbar({
        open: true,
        message: response.msg || 'Code problem successfully submitted!',
        severity: 'success',
      });
      handleClear();
      setSelectedTestcaseIds([]);
      setPreviewDialogOpen(false);
      setActiveStep(0);
    } catch (error) {
      console.error('Create code problem error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMsg = error.response?.data?.msg || error.message || 'Submission failed';
      setSnackbar({
        open: true,
        message: `Error: ${errorMsg}`,
        severity: 'error',
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleClear = () => {
    setProblemStatement("");
    setTags("");
    setSelectedTestcaseIds([]);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
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

  const testcaseColumns = [
    {
      field: 'testcase_id',
      headerName: 'Test Case ID',
      minWidth: 150,
      flex: 1,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Test Case ID
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Tooltip title={isValidUUID(params.value) ? 'Valid UUID' : 'Invalid UUID'}>
          <Typography
            variant="body2"
            sx={{
              color: isValidUUID(params.value) ? 'inherit' : 'error.main',
              fontSize: { xs: '12px', sm: '14px' },
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
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
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 0,
          }}
        >
          <Paper
            sx={{
              width: "100%",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(12, 131, 200, 0.08)",
              mb: { xs: 3, sm: 4 },
              backgroundColor: '#ffffff',
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                padding: { xs: 2, sm: 3, md: 4 },
                color: "#ffffff",
                borderRadius: '16px 16px 0 0',
                textAlign: "center",
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CodeIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  fontWeight={600}
                  sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                >
                  Add Code Problem
                </Typography>
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '12px', sm: '14px' },
                  opacity: 0.9,
                }}
              >
                Add a new coding question for assessment
              </Typography>
            </Box>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
              sx={{
                padding: { xs: '12px 16px', sm: '16px 24px' },
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
              width: "100%",
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(12, 131, 200, 0.08)',
              backgroundColor: '#ffffff',
            }}
          >
            {activeStep === 0 && (
              <Box sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  }}
                >
                  Add Coding Problem
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  Problem Statement
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Write a function to check if a number is prime."
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": { borderColor: "#0c83c8" },
                      "&.Mui-focused fieldset": { borderColor: "#fc7a46" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#0c83c8",
                      "&.Mui-focused": { color: "#fc7a46" },
                    },
                    "& .MuiFormHelperText-root": { color: "#4b5563" },
                  }}
                  aria-label="Problem statement input"
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #0c83c8, #fc7a46)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  Tags (Required)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter tags separated by commas (e.g., maths, loops, prime)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  sx={{
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": { borderColor: "#0c83c8" },
                      "&.Mui-focused fieldset": { borderColor: "#fc7a46" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#0c83c8",
                      "&.Mui-focused": { color: "#fc7a46" },
                    },
                    "& .MuiFormHelperText-root": { color: "#4b5563" },
                  }}
                  helperText="At least one tag is required."
                  aria-label="Tags input"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Clear all input fields">
                    <Button
                      variant="outlined"
                      onClick={handleClear}
                      sx={{
                        color: '#0c83c8',
                        borderColor: '#0c83c8',
                        fontSize: { xs: '12px', sm: '14px' },
                        borderRadius: '8px',
                        '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                      }}
                    >
                      Clear
                    </Button>
                  </Tooltip>
                  <Tooltip title="Proceed to select test cases">
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!problemStatement.trim() || !tags.trim()}
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
                    Select Test Cases (Optional)
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
                <Box sx={{ height: { xs: 300, sm: 400, md: 500 }, width: '100%' }}>
                  {loading.testcases ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress sx={{ color: '#0c83c8' }} />
                    </Box>
                  ) : testcaseRows.length === 0 ? (
                    <Typography variant="body2" sx={{ textAlign: 'center', py: 4 }}>
                      No valid test cases available. You can add test cases or proceed without selecting any.
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
                      }}
                      sx={dataGridSx}
                      aria-label="Test Cases DataGrid"
                      isRowSelectable={(params) => isValidUUID(params.row.id)}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                  <Tooltip title="Go back to code problem input">
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
                  Please review your selections below before confirming the submission. Tags are required; test cases are optional.
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
                    Coding Problem
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                    <strong>Problem Statement:</strong> {problemStatement || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' }, mt: 1 }}>
                    <strong>Tags:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {renderTagChips(tags.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  </Box>
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
                    <Typography variant="body2" sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      No test cases selected (optional)
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
                  <Tooltip title="Confirm and submit code problem">
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      startIcon={<SaveIcon />}
                      sx={{
                        background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                        '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                        fontSize: { xs: '12px', sm: '14px' },
                        borderRadius: '8px',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 0.75 },
                      }}
                    >
                      Add
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
              Confirm Code Problem Submission
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <DialogContentText sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                Review the details below:
              </DialogContentText>
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Problem Statement:</strong> {problemStatement || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Tags:</strong> {tags || 'None'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '12px', sm: '14px' } }}>
                <strong>Test Cases:</strong> {selectedTestcases.length} selected (optional)
              </Typography>
              {selectedTestcases.length > 0 && (
                <Box sx={{ mt: 1 }}>
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
                  onClick={handleSubmit}
                  disabled={loading.submit}
                  startIcon={loading.submit ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
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
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ mt: 2 }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{
                width: "100%",
                background: snackbar.severity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
                color: "#ffffff",
                fontSize: { xs: '12px', sm: '14px' },
                "& .MuiAlert-icon": { color: "#ffffff" },
              }}
              icon={snackbar.severity === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default Add_Coding;