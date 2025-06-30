import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { Slide } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Terminal, Tag, CheckCircle, AlertCircle, Upload, Plus } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';
import Papa from 'papaparse';
import { createTestCase } from '../axios';

const AddTestcase = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tags, setTags] = useState('');
  const [inputError, setInputError] = useState('');
  const [outputError, setOutputError] = useState('');
  const [tagsError, setTagsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Validate input
  const validateInput = (value) => {
    if (!value.trim()) return 'Input is required';
    return '';
  };

  // Validate output
  const validateOutput = (value) => {
    if (!value.trim()) return 'Output is required';
    return '';
  };

  // Validate tags
  const validateTags = (value) => {
    const tagArray = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    if (tagArray.length === 0 && value.trim()) return 'Enter valid tags separated by commas';
    return '';
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setInputError(validateInput(value));
  };

  // Handle output change
  const handleOutputChange = (e) => {
    const value = e.target.value;
    setOutput(value);
    setOutputError(validateOutput(value));
  };

  // Handle tags change
  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTags(value);
    setTagsError(validateTags(value));
  };

  // Handle single test case submit
  const handleSubmit = async () => {
    const iError = validateInput(input);
    const oError = validateOutput(output);
    const tError = validateTags(tags);

    setInputError(iError);
    setOutputError(oError);
    setTagsError(tError);

    if (iError || oError || tError) {
      setSnackbarMessage('Please correct the errors in the form.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      testcase_input: [input.trim()],
      testcase_output: [output.trim()],
      testcase_tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
    };

    setLoading(true);
    try {
      console.log('Submitting single test case:', JSON.stringify(payload, null, 2)); // Debug log
      await createTestCase(payload);
      setSnackbarMessage('Test case successfully submitted!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClear();
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message); // Debug log
      setSnackbarMessage(err.response?.data?.error || 'Failed to submit test case.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setInput('');
    setOutput('');
    setTags('');
    setInputError('');
    setOutputError('');
    setTagsError('');
  };

  // Handle CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvLoading(true);
    const expectedHeaders = ['input', 'output', 'tags'];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (result) => {
        const headers = Object.keys(result.data[0] || {}).map((h) => h.trim().toLowerCase());
        const isValid = expectedHeaders.every((h) => headers.includes(h));

        if (!isValid) {
          setSnackbarMessage(`Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setCsvLoading(false);
          return;
        }

        const formattedData = result.data.map((row, index) => ({
          id: index,
          testcase_input: row.input || '',
          testcase_output: row.output || '',
          testcase_tags: row.tags
            ? String(row.tags).split(',').map(tag => tag.trim()).filter(tag => tag)
            : [],
        }));

        setCsvData(formattedData);
        setSelectedRows([]);
        setSnackbarMessage('CSV loaded successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setCsvLoading(false);
      },
      error: () => {
        setSnackbarMessage('Failed to parse CSV file');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setCsvLoading(false);
      },
    });
  };

  // Handle bulk test case creation
  const handleBulkCreate = async (selectedOnly = false) => {
    if (csvData.length === 0) {
      setSnackbarMessage('No CSV data to process');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const testCasesToCreate = selectedOnly
        ? csvData.filter((row) => selectedRows.includes(row.id))
        : csvData;

      if (testCasesToCreate.length === 0) {
        setSnackbarMessage('No test cases selected');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const payload = testCasesToCreate.map(testCase => ({
        testcase_input: [testCase.testcase_input.trim()],
        testcase_output: [testCase.testcase_output.trim()],
        testcase_tags: testCase.testcase_tags,
      }));

      console.log('Submitting bulk test cases:', JSON.stringify(payload, null, 2)); // Debug log
      const response = await createTestCase(payload);
      setSnackbarMessage(response.message || `${testCasesToCreate.length} test case(s) added successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setCsvData([]);
      setSelectedRows([]);
    } catch (error) {
      console.error('Bulk submission error:', error.response?.data || error.message); // Debug log
      setSnackbarMessage(error.response?.data?.error || 'Failed to create test cases: Server error');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'testcase_input',
      headerName: 'Input',
      width: isMobile ? 150 : 250,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Input
          </Typography>
        </Box>
      ),
    },
    {
      field: 'testcase_output',
      headerName: 'Output',
      width: isMobile ? 150 : 250,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Output
          </Typography>
        </Box>
      ),
    },
    {
      field: 'testcase_tags',
      headerName: 'Tags',
      width: isMobile ? 150 : 250,
      renderCell: (params) => params.value.join(', '),
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Tags
          </Typography>
        </Box>
      ),
    },
  ];

  // Snackbar Transition
  const TransitionSlide = (props) => <Slide {...props} direction="down" />;

  return (
    <>
      <Admin_Dashboard />
      <Container
        maxWidth={isMobile ? 'sm' : 'lg'}
        sx={{
          minHeight: '100vh',
          py: { xs: 6, sm: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Single Test Case Form */}
        <Paper
          elevation={5}
          sx={{
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            opacity: 0,
            animation: 'fadeIn 0.5s forwards',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            mb: 4,
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              padding: { xs: '16px 20px', sm: '20px 24px' },
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Terminal size={isMobile ? 20 : 24} />
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight={600}
                sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
              >
                Create Test Case
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >
              Design a new test case for your coding assessment
            </Typography>
          </Box>

          <Box sx={{ padding: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 1, fontSize: isMobile ? '14px' : '16px' }}
              >
                Testcase Input
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter input (e.g., radar)"
                value={input}
                onChange={handleInputChange}
                error={!!inputError}
                helperText={inputError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Terminal size={20} color="#0c83c8" />
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 1, fontSize: isMobile ? '14px' : '16px' }}
              >
                Testcase Output
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter output (e.g., 1)"
                value={output}
                onChange={handleOutputChange}
                error={!!outputError}
                helperText={outputError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Terminal size={20} color="#0c83c8" />
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 1, fontSize: isMobile ? '14px' : '16px' }}
              >
                Tags
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter tags separated by commas (e.g., C, palindrome, string)"
                value={tags}
                onChange={handleTagsChange}
                error={!!tagsError}
                helperText={tagsError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tag size={20} color="#0c83c8" />
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
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mt: 2,
                pt: 3,
                borderTop: '1px solid #e0e6f7',
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleClear}
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  color: '#0c83c8',
                  borderColor: '#0c83c8',
                  fontSize: isMobile ? '12px' : '14px',
                  '&:hover': {
                    borderColor: '#fc7a46',
                    color: '#fc7a46',
                    bgcolor: '#f5f7ff',
                  },
                }}
              >
                Clear Form
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                endIcon={loading ? null : <CheckCircle size={16} />}
                sx={{
                  borderRadius: '8px',
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                  fontSize: isMobile ? '12px' : '14px',
                  boxShadow: '0 4px 12px rgba(12, 131, 200, 0.2)',
                }}
              >
                {loading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Submit Test Case'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* CSV Upload and Bulk Creation */}
        <Paper
          elevation={5}
          sx={{
            p: isMobile ? 2 : 4,
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 250, 0.95)',
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            align="center"
            sx={{
              mb: isMobile ? 2 : 3,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bulk Add Test Cases via CSV
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={csvLoading}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={csvLoading}
                  startIcon={csvLoading ? <CircularProgress size={16} /> : <Upload size={16} />}
                  sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 0.5 : 0.75,
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    borderColor: '#0c83c8',
                    color: '#0c83c8',
                    '&:hover': { borderColor: '#fc7a46', color: '#fc7a46' },
                  }}
                >
                  {csvLoading ? 'Uploading...' : 'Upload CSV'}
                </Button>
              </label>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                Upload a CSV with headers: input, output, tags (tags separated by commas)
              </Typography>
            </Grid>
          </Grid>
          {csvData.length > 0 && (
            <>
              <Box
                sx={{
                  height: isMobile ? 250 : 350,
                  width: '100%',
                  mb: isMobile ? 2 : 3,
                  overflowX: 'auto',
                }}
              >
                <DataGrid
                  rows={csvData}
                  columns={columns}
                  pageSizeOptions={[5, 10, 20]}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                  rowSelectionModel={selectedRows}
                  loading={csvLoading}
                  sx={{
                    borderRadius: '8px',
                    '& .MuiDataGrid-columnHeaders': {
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    },
                    '& .MuiDataGrid-row': {
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#e3f2fd' },
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                    },
                  }}
                />
              </Box>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() => handleBulkCreate(false)}
                    disabled={loading || csvData.length === 0}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                    sx={{
                      px: isMobile ? 2 : 3,
                      py: isMobile ? 0.5 : 0.75,
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                      '&:hover': { background: 'linear-gradient(90deg, #fc7a46, #0c83c8)' },
                    }}
                  >
                    {loading ? 'Creating...' : 'Create All'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() => handleBulkCreate(true)}
                    disabled={loading || selectedRows.length === 0}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                    sx={{
                      px: isMobile ? 2 : 3,
                      py: isMobile ? 0.5 : 0.75,
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      borderRadius: '8px',
                      backgroundColor: '#6c757d',
                      '&:hover': { backgroundColor: '#5a6268' },
                    }}
                  >
                    {loading ? 'Creating...' : `Create Selected (${selectedRows.length})`}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionComponent={TransitionSlide}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            icon={snackbarSeverity === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            sx={{
              width: '100%',
              background: snackbarSeverity === 'success' ? 'linear-gradient(90deg, #0c83c8, #fc7a46)' : undefined,
              fontSize: isMobile ? '12px' : '14px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default AddTestcase;