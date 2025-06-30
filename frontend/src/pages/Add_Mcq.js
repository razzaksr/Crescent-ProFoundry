import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
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
import { Edit, Tag, CheckCircle, AlertCircle, Upload, Plus,Save } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';
import Papa from 'papaparse';
import { addMcq } from '../axios';

const Add_Mcq = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [question, setQuestion] = useState('');
  const [tags, setTags] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [selectedValue, setSelectedValue] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [optionsError, setOptionsError] = useState(['', '', '', '']);
  const [answerError, setAnswerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [csvData, setCsvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);

  // Validate question
  const validateQuestion = (value) => {
    if (!value.trim()) return 'Question is required';
    return '';
  };

  // Validate option
  const validateOption = (value) => {
    if (!value.trim()) return 'Option is required';
    return '';
  };

  // Handle question change
  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setQuestion(value);
    setQuestionError(validateQuestion(value));
  };

  // Handle option change
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);

    const updatedErrors = [...optionsError];
    updatedErrors[index] = validateOption(value);
    setOptionsError(updatedErrors);

    if (selectedValue === options[index]) {
      setSelectedValue(value);
    }
  };

  // Handle answer selection
  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    setAnswerError(value ? '' : 'Please select the correct answer');
  };

  // Handle single MCQ submit
  const handleSubmit = async () => {
    const qError = validateQuestion(question);
    const optErrors = options.map(opt => validateOption(opt));
    const ansError = selectedValue ? '' : 'Please select the correct answer';

    setQuestionError(qError);
    setOptionsError(optErrors);
    setAnswerError(ansError);

    if (qError || optErrors.some(err => err) || ansError) {
      setSnackbarMessage('Please fill all required fields and select the correct answer.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (options.filter(opt => opt.trim()).length < 2) {
      setSnackbarMessage('Please provide at least two non-empty options.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      mcq_question: question.trim(),
      mcq_options: options.map(opt => opt.trim()).filter(opt => opt),
      mcq_answer: selectedValue.trim(),
      mcq_tag: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
    };

    setLoading(true);
    try {
      const response = await addMcq(payload);
      setSnackbarMessage(response.data.message || 'Question successfully submitted!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClear();
    } catch (error) {
      setSnackbarMessage(error.response?.data?.error || 'Failed to submit MCQ.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setQuestion('');
    setTags('');
    setOptions(['', '', '', '']);
    setSelectedValue('');
    setQuestionError('');
    setOptionsError(['', '', '', '']);
    setAnswerError('');
  };

  // Handle CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (result) => {
        const expectedHeaders = ['question', 'option 1', 'option 2', 'option 3', 'option 4', 'answer', 'mcq tags'];
        const headers = Object.keys(result.data[0] || {}).map((h) => h.trim().toLowerCase());
        const isValid = expectedHeaders.every((h) => headers.includes(h));

        if (!isValid) {
          setSnackbarMessage(`Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setCsvLoading(false);
          return;
        }

        const formattedData = result.data.map((row, index) => {
          const options = [
            row['option 1'] || '',
            row['option 2'] || '',
            row['option 3'] || '',
            row['option 4'] || '',
          ].filter(opt => opt.trim());
          return {
            id: index,
            mcq_question: row.question || '',
            option1: row['option 1'] || '',
            option2: row['option 2'] || '',
            option3: row['option 3'] || '',
            option4: row['option 4'] || '',
            mcq_options: options,
            mcq_answer: row.answer || '',
            mcq_tag: row['mcq tags'] ? row['mcq tags'].split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          };
        });

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

  // Handle bulk MCQ creation
  const handleBulkCreate = async (selectedOnly = false) => {
    if (csvData.length === 0) {
      setSnackbarMessage('No CSV data to process');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const mcqsToCreate = selectedOnly
        ? csvData.filter((row) => selectedRows.includes(row.id))
        : csvData;

      if (mcqsToCreate.length === 0) {
        setSnackbarMessage('No MCQs selected');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const payload = mcqsToCreate.map(mcq => ({
        mcq_question: mcq.mcq_question,
        mcq_options: mcq.mcq_options,
        mcq_answer: mcq.mcq_answer,
        mcq_tag: mcq.mcq_tag,
      }));

      const response = await addMcq(payload);
      setSnackbarMessage(response.data.message || `${mcqsToCreate.length} MCQ(s) added successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setCsvData([]);
      setSelectedRows([]);
    } catch (error) {
      setSnackbarMessage(error.response?.data?.error || 'Failed to create MCQs: Server error');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'mcq_question',
      headerName: 'Question',
      width: isMobile ? 150 : 250,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Question
          </Typography>
        </Box>
      ),
    },
    {
      field: 'option1',
      headerName: 'Option 1',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Option 1
          </Typography>
        </Box>
      ),
    },
    {
      field: 'option2',
      headerName: 'Option 2',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Option 2
          </Typography>
        </Box>
      ),
    },
    {
      field: 'option3',
      headerName: 'Option 3',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Option 3
          </Typography>
        </Box>
      ),
    },
    {
      field: 'option4',
      headerName: 'Option 4',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Option 4
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mcq_answer',
      headerName: 'Answer',
      width: isMobile ? 100 : 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} color="#0c83c8" />
          <Typography variant="inherit" fontWeight="bold" color="#0c83c8">
            Answer
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      width: isMobile ? 100 : 150,
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
        {/* Single MCQ Form */}
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
              <Edit size={isMobile ? 20 : 24} />
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight={600}
                sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
              >
                Create Multiple Choice Question
              </Typography>
            </Box>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: isMobile ? '12px' : '14px' }}
            >
              Design a new question for your quiz or assessment
            </Typography>
          </Box>

          <Box sx={{ padding: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 1, fontSize: isMobile ? '14px' : '16px' }}
              >
                Question Text
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Enter your question here..."
                value={question}
                onChange={handleQuestionChange}
                error={!!questionError}
                helperText={questionError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Edit size={20} color="#0c83c8" />
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
                placeholder="Enter tags separated by commas (e.g., math, algebra, equations)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                sx={{ mb: 2, fontSize: isMobile ? '14px' : '16px' }}
              >
                Answer Options
              </Typography>
              <RadioGroup
                name="mcq-options"
                value={selectedValue}
                onChange={handleAnswerChange}
                sx={{ border: !!answerError ? '1px solid red' : 'none', borderRadius: '8px' }}
              >
                {options.map((opt, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e0e6f7',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#f0f2ff' },
                    }}
                  >
                    <FormControlLabel
                      value={opt}
                      control={
                        <Radio
                          sx={{
                            color: '#0c83c8',
                            '&.Mui-checked': { color: '#0c83c8' },
                          }}
                        />
                      }
                      label=""
                    />
                    <TextField
                      fullWidth
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      variant="outlined"
                      size="small"
                      error={!!optionsError[index]}
                      helperText={optionsError[index]}
                      sx={{
                        flexGrow: 1,
                        mr: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '& fieldset': { borderColor: '#0c83c8' },
                          '&:hover fieldset': { borderColor: '#fc7a46' },
                          '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#e0e6f7',
                        color: '#0c83c8',
                        fontWeight: '500',
                        fontSize: '16px',
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </Box>
                  </Box>
                ))}
              </RadioGroup>
              {answerError && (
                <Typography color="error" sx={{ mt: 1, fontSize: isMobile ? '12px' : '14px' }}>
                  {answerError}
                </Typography>
              )}
            </FormControl>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: { xs: 1.5, sm: 2 },
                bgcolor: '#f0f2ff',
                borderRadius: '8px',
                mb: 4,
                border: '1px solid #0c83c8',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={500}
                color="#0c83c8"
                sx={{ mr: 2, fontSize: isMobile ? '14px' : '16px' }}
              >
                Correct Answer:
              </Typography>
              <Box
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #0c83c8',
                  borderRadius: '6px',
                  p: '8px 16px',
                  minWidth: '150px',
                  fontSize: isMobile ? '12px' : '14px',
                }}
              >
                {selectedValue || 'No answer selected'}
              </Box>
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
                endIcon={loading ? null : <Save size={16} />}
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
                {loading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Submit Question'}
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
            Bulk Add MCQs via CSV
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
                Upload a CSV with headers: question, option 1, option 2, option 3, option 4, answer, mcq tags (tags separated by commas)
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

export default Add_Mcq;