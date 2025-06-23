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
} from '@mui/material';
import { Slide } from '@mui/material';
import { Edit, Tag, List, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Admin_Dashboard from '../components/AdminDash';

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

    // Update selected value if it matches the changed option
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

  // Handle submit
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
      const response = await fetch('http://localhost:8086/mcq_gateway/mcq/add_mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit MCQ');
      }

      setSnackbarMessage('Question successfully submitted!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClear();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to submit MCQ.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuestion('');
    setTags('');
    setOptions(['', '', '', '']);
    setSelectedValue('');
    setQuestionError('');
    setOptionsError(['', '', '', '']);
    setAnswerError('');
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
              textAlign: 'center', // center the text inside
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


          {/* Form Content */}
          <Box sx={{ padding: { xs: 2, sm: 3 } }}>
            {/* Question Field */}
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

            {/* Tags Field */}
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

            {/* Options */}
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

            {/* Selected Answer Display */}
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
                {loading ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : 'Submit Question'}
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

export default Add_Mcq;