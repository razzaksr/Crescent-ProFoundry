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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllTests, fetchAllMcqs, fetchAllCodes, createTest, updateTest } from '../axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Admin_Dashboard from '../components/AdminDash';

const UpdateTestModule = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tests, setTests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState({ tests: true, codes: true, mcqs: true });
  const [error, setError] = useState({ tests: null, codes: null, mcqs: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [mcqIds, setMcqIds] = useState([]);
  const [formData, setFormData] = useState({
    test_name: '',
    test_language: '',
    test_mcq_id: [],
    test_coding_id: [],
    test_total_score: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data for all sections
  useEffect(() => {
    let isMounted = true;

    const fetchTests = async () => {
      try {
        const response = await fetchAllTests();
        if (isMounted) {
          setTests(response.data);
          setLoading(prev => ({ ...prev, tests: false }));
          setError(prev => ({ ...prev, tests: null }));
        }
      } catch (error) {
        if (isMounted) {
          setError(prev => ({ ...prev, tests: error.message }));
          setLoading(prev => ({ ...prev, tests: false }));
          setSnackbarMessage(`Error fetching tests: ${error.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    };

const fetchCodes = async () => {
  try {
    const response = await fetchAllCodes();
    console.log('Coding API response:', response);
    if (isMounted) {
      // Fix: The data is in response.codes, not response.data
      const codesData = response.codes || response.data || [];
      console.log('Processing data:', codesData); // Debug log
      
      // Add validation to ensure codesData is an array
      if (!Array.isArray(codesData)) {
        console.error('Expected array but got:', typeof codesData, codesData);
        setCodes([]);
        setLoading(prev => ({ ...prev, codes: false }));
        setError(prev => ({ ...prev, codes: 'Invalid data format received' }));
        return;
      }
      
      const formattedRows = codesData.map((item, index) => ({
        id: item._id || item.code_id || `temp-${index}`,
        code_id: item.code_id || 'N/A',
        problem: item.code_problem_statement || 'No description',
        tags: Array.isArray(item.code_tags) ? item.code_tags.join(', ') : (item.code_tags || ''),
        testCasesCount: Array.isArray(item.code_test_cases_id) ? item.code_test_cases_id.length : 0,
      }));
      
      console.log('Formatted coding rows:', formattedRows);
      setCodes(formattedRows);
      setLoading(prev => ({ ...prev, codes: false }));
      setError(prev => ({ ...prev, codes: null }));
    }
  } catch (error) {
    console.error('Error fetching codes:', error);
    if (isMounted) {
      setError(prev => ({ ...prev, codes: error.message }));
      setLoading(prev => ({ ...prev, codes: false }));
      setCodes([]); // Ensure codes is empty on error
      setSnackbarMessage(`Error fetching codes: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }
};

    const fetchMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        if (isMounted) {
          setMcqs(response.data);
          setLoading(prev => ({ ...prev, mcqs: false }));
          setError(prev => ({ ...prev, mcqs: null }));
        }
      } catch (error) {
        if (isMounted) {
          setError(prev => ({ ...prev, mcqs: error.message }));
          setLoading(prev => ({ ...prev, mcqs: false }));
          setSnackbarMessage(`Error fetching MCQs: ${error.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
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

  // Calculate total score
  useEffect(() => {
    const mcqScore = formData.test_mcq_id.length * 1;
    const codingScore = formData.test_coding_id.length * 10;
    setFormData(prev => ({ ...prev, test_total_score: mcqScore + codingScore }));
  }, [formData.test_mcq_id, formData.test_coding_id]);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Failed to copy to clipboard');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
      test_total_score: test ? ((test.test_mcq_id?.length || 0) * 1 + (test.test_coding_id?.length || 0) * 10) : 0,
    });
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
  };

  const handleFormSubmit = async () => {
    if (!formData.test_name || !formData.test_language) {
      setSnackbarMessage('Test name and language are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        test_name: formData.test_name,
        test_language: formData.test_language,
        test_mcq_id: formData.test_mcq_id.filter(id => id && id.trim() !== ''),
        test_coding_id: formData.test_coding_id.filter(id => id && id.trim() !== ''),
        test_total_score: formData.test_total_score,
      };

      if (formMode === 'create') {
        const response = await createTest(payload);
        setTests(prev => [...prev, response.test || {}]);
        setSnackbarMessage('Test created successfully');
      } else {
        const response = await updateTest({ test_id: selectedTestId, ...payload });
        setTests(prev =>
          prev.map(t => (t.test_id === selectedTestId ? { ...t, ...response.test } : t))
        );
        setSnackbarMessage('Test updated successfully');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseFormDialog();
    } catch (error) {
      setSnackbarMessage(`Error: ${error.response?.data?.msg || error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setFormLoading(false);
    }
  };

  // Test Columns
  const testColumns = [
    { field: 'test_name', headerName: 'Test Name', width: 200, flex: 1 },
    { field: 'test_language', headerName: 'Language', width: 150 },
    { field: 'test_total_score', headerName: 'Total Score', width: 120 },
    {
      field: 'test_mcq_id',
      headerName: 'MCQ IDs',
      width: 200,
      flex: 1,
      renderCell: (params) => {
        const mcqIds = Array.isArray(params.value) ? params.value : [];
        if (!mcqIds.length) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${mcqIds.length} MCQs`} size="small" color="primary" variant="outlined" />
            <Tooltip title="View All MCQ IDs">
              <IconButton size="small" onClick={() => handleViewDetails(`MCQ IDs for ${params.row.test_name}`, mcqIds)}>
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton size="small" onClick={() => handleCopyToClipboard(mcqIds.join('\n'))}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'test_coding_id',
      headerName: 'Coding IDs',
      width: 200,
      flex: 1,
      renderCell: (params) => {
        const codingIds = Array.isArray(params.value) ? params.value : [];
        if (!mcqIds.length) {
          return <Typography variant="body2" color="textSecondary">None</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={`${codingIds.length} Codes`} size="small" color="secondary" variant="outlined" />
            <Tooltip title="View All Coding IDs">
              <IconButton size="small" onClick={() => handleViewDetails(`Coding IDs for ${params.row.test_name}`, codingIds)}>
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy All IDs">
              <IconButton size="small" onClick={() => handleCopyToClipboard(codingIds.join('\n'))}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Unknown'}
          color={params.value === 'enabled' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    // {
    //   field: 'test_id',
    //   headerName: 'Test ID',
    //   width: 300,
    //   flex: 1.5,
    //   renderCell: (params) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //       <Tooltip title={params.value || ''}>
    //         <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 60px)' }}>
    //           {params.value}
    //         </Typography>
    //       </Tooltip>
    //       <Tooltip title="Copy ID">
    //         <IconButton size="small" onClick={() => handleCopyToClipboard(params.value)} sx={{ ml: 1 }}>
    //           <ContentCopyIcon fontSize="small" />
    //         </IconButton>
    //       </Tooltip>
    //       <Tooltip title="Edit Test">
    //         <IconButton size="small" onClick={() => handleOpenFormDialog('update', params.row)}>
    //           <EditIcon fontSize="small" />
    //         </IconButton>
    //       </Tooltip>
    //     </Box>
    //   ),
    // },
  ];

  // Code Columns
  const codeColumns = [
    { field: 'problem', headerName: 'Problem Statement', width: 400, flex: 1 },
    { field: 'tags', headerName: 'Tags', width: 200 },
    { field: 'testCasesCount', headerName: 'Test Cases Count', width: 150 },
  ];

  // MCQ Columns
  const mcqColumns = [
    { field: 'mcq_question', headerName: 'Question', width: 300 },
    {
      field: 'mcq_options',
      headerName: 'Options',
      width: 250,
      valueGetter: (params) => (Array.isArray(params.value) ? params.value.join(', ') : 'None'),
    },
    { field: 'mcq_answer', headerName: 'Answer', width: 150 },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      width: 200,
      valueGetter: (params) => (Array.isArray(params.value) ? params.value.join(', ') : 'None'),
    },
    { field: 'mcq_id', headerName: 'MCQ ID', width: 250 },
  ];

  // Form DataGrid Columns for Selection
  const formMcqColumns = [
    { field: 'mcq_question', headerName: 'Question', width: 300 },
    { field: 'mcq_id', headerName: 'MCQ ID', width: 250 },
  ];

  const formCodeColumns = [
    { field: 'code_id', headerName: 'Code ID', width: 200 },
    { field: 'problem', headerName: 'Problem Statement', width: 300 },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Test Management Dashboard
        </Typography>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered sx={{ mb: 3 }}>
          <Tab label="Tests" />
          <Tab label="Coding Problems" />
          <Tab label="MCQs" />
        </Tabs>

        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ height: 600, width: '100%' }}>
            {activeTab === 0 && (
              <>
                {error.tests && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error.tests}</Alert>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenFormDialog('create')}
                  sx={{ mb: 2, backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0b78b9' } }}
                  disabled={loading.tests}
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
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'white', fontWeight: 'bold', fontSize: '16px' },
                    '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                    borderRadius: '12px',
                  }}
                />
              </>
            )}
            {activeTab === 1 && (
              <>
                {error.codes && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error.codes}</Alert>
                )}
                {loading.codes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : codes.length === 0 && !error.codes ? (
                  <Typography variant="body1" align="center" sx={{ p: 4 }}>
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
                    sx={{
                      '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'white', fontWeight: 'bold', fontSize: '16px' },
                      '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                      '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                      borderRadius: '12px',
                    }}
                  />
                )}
              </>
            )}
            {activeTab === 2 && (
              <>
                {error.mcqs && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error.mcqs}</Alert>
                )}
                <DataGrid
                  rows={mcqs}
                  columns={mcqColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  loading={loading.mcqs}
                  getRowId={(row) => row._id || row.mcq_id}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'white', fontWeight: 'bold', fontSize: '16px' },
                    '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                    borderRadius: '12px',
                  }}
                />
              </>
            )}
          </Box>
        </Paper>

        {/* Dialog for showing MCQ or Coding IDs */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            {dialogTitle}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box sx={{ maxHeight: '400px', overflow: 'auto', fontFamily: 'monospace', backgroundColor: '#f9f9f9', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
              {dialogContent.length ? (
                dialogContent.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: index < dialogContent.length - 1 ? '1px solid #eee' : 'none', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                    <Typography variant="body2">{item}</Typography>
                    <IconButton size="small" onClick={() => handleCopyToClipboard(item)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No items to display</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Typography variant="caption" color="textSecondary">{dialogContent.length} items</Typography>
            <Box>
              <Button onClick={() => handleCopyToClipboard(dialogContent.join('\n'))} variant="outlined" startIcon={<ContentCopyIcon />} sx={{ mr: 1 }} disabled={!dialogContent.length}>
                Copy All
              </Button>
              <Button onClick={handleCloseDialog} variant="contained">Close</Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Form Dialog for Creating/Updating Test */}
        <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            {formMode === 'create' ? 'Create New Test' : 'Update Test'}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Test Name"
                value={formData.test_name}
                onChange={(e) => setFormData(prev => ({ ...prev, test_name: e.target.value }))}
                fullWidth
                required
                error={!formData.test_name}
                helperText={!formData.test_name ? 'Test name is required' : ''}
              />
              <FormControl fullWidth required error={!formData.test_language}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.test_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, test_language: e.target.value }))}
                  label="Language"
                >
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="Java">Java</MenuItem>
                  <MenuItem value="Python">Python</MenuItem>
                  <MenuItem value="JavaScript">JavaScript</MenuItem>
                </Select>
                {!formData.test_language && <Typography variant="caption" color="error">Language is required</Typography>}
              </FormControl>
              <Typography variant="h6" sx={{ mt: 2 }}>Select MCQs</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={mcqs}
                  columns={formMcqColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  loading={loading.mcqs}
                  getRowId={(row) => row._id || row.mcq_id}
                  checkboxSelection
                  rowSelectionModel={mcqs
                    .filter(mcq => formData.test_mcq_id.includes(mcq.mcq_id))
                    .map(mcq => mcq._id || mcq.mcq_id)}
                  onRowSelectionModelChange={(newSelection) => {
                    const selectedMcqIds = newSelection
                      .map(id => mcqs.find(mcq => (mcq._id || mcq.mcq_id) === id)?.mcq_id)
                      .filter(Boolean);
                    setFormData(prev => ({ ...prev, test_mcq_id: selectedMcqIds }));
                  }}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'white', fontWeight: 'bold' },
                    '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ mt: 2 }}>Select Coding Problems</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={codes}
                  columns={formCodeColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  loading={loading.codes}
                  getRowId={(row) => row.id}
                  checkboxSelection
                  rowSelectionModel={codes
                    .filter(code => formData.test_coding_id.includes(code.code_id))
                    .map(code => code.id)}
                  onRowSelectionModelChange={(newSelection) => {
                    const selectedCodeIds = newSelection
                      .map(id => codes.find(code => code.id === id)?.code_id)
                      .filter(Boolean);
                    setFormData(prev => ({ ...prev, test_coding_id: selectedCodeIds }));
                  }}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1565c0', color: 'white', fontWeight: 'bold' },
                    '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: '#e3f2fd' },
                  }}
                />
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Total Score: {formData.test_total_score} ({formData.test_mcq_id.length} MCQs x 1 + {formData.test_coding_id.length} Coding x 10)
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseFormDialog} disabled={formLoading}>Cancel</Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              color="primary"
              disabled={formLoading || !formData.test_name || !formData.test_language}
              startIcon={formLoading ? <CircularProgress size={20} /> : null}
            >
              {formMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UpdateTestModule;