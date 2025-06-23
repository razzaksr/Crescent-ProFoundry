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
} from '@mui/material';
import { Slide } from '@mui/material';
import { Terminal, Tag, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';
import { createTestCase } from '../axios';

const Add_Testcase = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tags, setTags] = useState('');
  const [inputError, setInputError] = useState('');
  const [outputError, setOutputError] = useState('');
  const [tagsError, setTagsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  // Handle submit
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
      await createTestCase(payload);
      setSnackbarMessage('Test case successfully submitted!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClear();
    } catch (err) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to submit test case.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setInput('');
    setOutput('');
    setTags('');
    setInputError('');
    setOutputError('');
    setTagsError('');
  };

  // Snackbar Transition
  const TransitionSlide = (props) => <Slide {...props} direction="down" />;

  return (
    <>
      <Admin_Dashboard />
      <Container
        maxWidth={isMobile ? 'sm' : 'md'}
        sx={{
          minHeight: '100vh',
          display: { xs: 'block', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2, sm: 3 },
          py: { xs: 6, sm: 4 },
        }}
      >
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
          }}
        >
          {/* Header */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
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
              sx={{ mt: 0.5, fontSize: isMobile ? '12px' : '14px' }}
            >
              Design a new test case for your coding assessment
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ padding: { xs: 2, sm: 3 } }}>
            {/* Testcase Input */}
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
              placeholder="Enter input (e.g., 7)"
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
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#0c83c8' },
                  '&:hover fieldset': { borderColor: '#fc7a46' },
                  '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                },
              }}
            />

            {/* Testcase Output */}
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
              placeholder="Enter output (e.g., true)"
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
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#0c83c8' },
                  '&:hover fieldset': { borderColor: '#fc7a46' },
                  '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                },
              }}
            />

            {/* Tags */}
            <Typography
              variant="subtitle1"
              fontWeight={500}
              sx={{ mb: 1, fontSize: isMobile ? '14px' : '16px' }}
            >
              Tags
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter tags separated by commas (e.g., edge, iot, ai)"
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
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#0c83c8' },
                  '&:hover fieldset': { borderColor: '#fc7a46' },
                  '&.Mui-focused fieldset': { borderColor: '#0c83c8' },
                },
              }}
            />

            {/* Action Buttons */}
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
                {loading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Submit Test Case'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
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
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_Testcase;