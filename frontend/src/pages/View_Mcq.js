import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Slide } from '@mui/material';
import { Book, Search, Copy } from 'lucide-react';
import { fetchAllMcqs } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

const McqAdminPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mcqs, setMcqs] = useState([]);
  const [filteredMcqs, setFilteredMcqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Safe stringification for search filtering
  const safeStringify = (value) => {
    if (Array.isArray(value)) return value.map(v => String(v)).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(safeStringify).join(' ');
    return String(value || '');
  };

  // Fetch MCQs
  useEffect(() => {
    const getMcqs = async () => {
      try {
        const response = await fetchAllMcqs();
        const mcqData = response.data || [];
        setMcqs(mcqData);
        setFilteredMcqs(mcqData);
        setLoading(false);
      } catch (error) {
        setSnackbarMessage('Unable to fetch MCQs. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    getMcqs();
  }, []);

  // Filter MCQs based on search query
  useEffect(() => {
    const filtered = mcqs.filter(mcq =>
      safeStringify(mcq).toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMcqs(filtered);
  }, [searchQuery, mcqs]);

  // Handle copy to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
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

  const columns = [
    {
      field: 'mcq_question',
      headerName: 'Question',
      minWidth: isMobile ? 200 : 300,
      flex: 1,
    },
    {
      field: 'mcq_options',
      headerName: 'Options',
      minWidth: isMobile ? 150 : 250,
      flex: 0.8,
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
    },
    {
      field: 'mcq_tag',
      headerName: 'Tags',
      minWidth: isMobile ? 120 : 200,
      flex: 0.6,
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
    {
      field: 'mcq_id',
      headerName: 'MCQ ID',
      minWidth: isMobile ? 150 : 250,
      flex: 0.7,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 30px)',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyToClipboard(params.value)}
            sx={{ ml: 'auto' }}
          >
            <Copy size={16} color="#0c83c8" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Snackbar Transition
  const TransitionSlide = (props) => <Slide {...props} direction="down" />;

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          padding: { xs: 2, sm: 4 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Gradient Header */}
        <Paper
          elevation={5}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
            color: 'white',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Book size={isMobile ? 20 : 24} />
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={600}
              sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
            >
              MCQ Management
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ mt: 0.5, fontSize: isMobile ? '12px' : '14px' }}
          >
            View and manage multiple-choice questions
          </Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search MCQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* DataGrid */}
          <Box sx={{ height: isMobile ? 400 : 600, width: '100%' }}>
            <DataGrid
              rows={filteredMcqs}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id}
              rowHeight={80} // Increased row height to accommodate multi-line content
              sx={{
                borderRadius: '12px',
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: '#0c83c8',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '15px',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
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
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            />
          </Box>
        </Paper>

        {/* Snackbar notification */}
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

export default McqAdminPage;