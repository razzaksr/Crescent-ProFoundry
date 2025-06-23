import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Users, User, Briefcase, School, Hash, Mail, Fingerprint, Search } from 'lucide-react';
import { fetchAllUsers } from '../axios';
import Admin_Dashboard from '../components/AdminDash';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchAllUsers();
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      Object.values(user)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

 const columns = [
  {
    field: 'full_name',
    headerName: 'Full Name',
    width: 280,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
       
        <Typography variant="inherit" fontWeight="bold">
          Full Name
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: 'department',
    headerName: 'Department',
    width: 320,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="inherit" fontWeight="bold">
          Department
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: 'college',
    headerName: 'College',
    width: 320,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="inherit" fontWeight="bold">
          College
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <School size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: 'rollno',
    headerName: 'Roll No',
    width: 130,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="inherit" fontWeight="bold">
          Roll No
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Hash size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 380,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="inherit" fontWeight="bold">
          Email
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Mail size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
  {
    field: 'user_id',
    headerName: 'User ID',
    width: 350,
    renderHeader: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography variant="inherit" fontWeight="bold">
          User ID
        </Typography>
      </Box>
    ),
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Fingerprint size={16} color="#0c83c8" />
        <span>{params.value}</span>
      </Box>
    ),
  },
];

  return (
    <>
      <Admin_Dashboard />
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Users size={24} color="white" />
            <Typography variant="h5" component="h1" fontWeight="600">
              <span style={{ color: '#fff' }}>User </span>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                Management
              </span>
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 1, color: 'white' }}>
            View and manage all registered users
          </Typography>
        </Paper>

        {/* Search Bar and DataGrid Table */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: '16px' }}>
          <Box sx={{ mb: 2, maxWidth: 400 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users..."
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
              rows={filteredUsers}
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

export default UserPage;