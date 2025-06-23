import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Users, User, Briefcase, Phone, Fingerprint, List, Contact, Search } from 'lucide-react';
import { fetchAllExperts } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

const ExpertPage = () => {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getExperts = async () => {
      try {
        const response = await fetchAllExperts();
        setExperts(response.data);
        setFilteredExperts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching experts:', error);
        setLoading(false);
      }
    };
    getExperts();
  }, []);

  useEffect(() => {
    // Filter experts based on search query
    const filtered = experts.filter((expert) =>
      Object.values(expert)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredExperts(filtered);
  }, [searchQuery, experts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const columns = [
    {
      field: 'mod_expert_name',
      headerName: 'Expert Name',
      width: 250,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Expert Name</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <User size={16} color="#0c83c8" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'mod_expert_role',
      headerName: 'Role',
      width: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Role</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Briefcase size={16} color="#0c83c8" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'mod_expert_mobile',
      headerName: 'Mobile',
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Mobile</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone size={16} color="#0c83c8" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'mod_expert_id',
      headerName: 'Expert ID',
      width: 350,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">Expert ID</Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Fingerprint size={16} color="#0c83c8" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'mod_id',
      headerName: 'Module IDs',
      width: 380,
      renderHeader: () => (
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Typography variant="inherit" fontWeight="bold">
            Module IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <List size={16} color="#0c83c8" />
          </Box>
          <span>{params.value.join(', ')}</span>
        </Box>

      ),
    },
    {
      field: 'poc_id',
      headerName: 'POC IDs',
      width: 600,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Contact size={16} color="white" />
          <Typography variant="inherit" fontWeight="bold">
            POC IDs
          </Typography>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Contact size={16} color="#0c83c8" />
          {params.value}
        </Box>
      ),
    },
  ];

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
        {/* Gradient Header */}
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
            <Users size={24} />
            <Typography variant="h5" fontWeight={600}>
              <span style={{ color: '#fff' }}>Expert </span>
              <span style={{ padding: '4px 8px', borderRadius: '6px' }}>
                Management
              </span>
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            View and manage all registered experts
          </Typography>
        </Paper>

        {/* Search Bar and DataGrid Table */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ mb: 2, maxWidth: 400 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search experts..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#0c83c8" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#0c83c8',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fc7a46',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0c83c8',
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={filteredExperts}
              columns={columns}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id}
              autoHeight
              sx={{
                borderRadius: '8px',
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: '#0c83c8',
                  fontWeight: 'bold',
                  fontSize: '15px',
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
                  fontSize: '14px',
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ExpertPage;