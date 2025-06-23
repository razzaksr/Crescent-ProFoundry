import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  Container,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  Visibility,
  Edit,
  Search,
  Dashboard as DashboardIcon,
  Clear,
} from '@mui/icons-material';
import AdminDash from '../components/AdminDash';

// Custom styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  backgroundColor: '#f5f7fa',
  minHeight: '100vh',
}));

const SearchBarWrapper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(4),
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: 'transparent',
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    color: '#333',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
    },
  },
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const CardHeader = styled(Box)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
  color: '#ffffff',
  padding: theme.spacing(2),
  borderRadius: '12px 12px 0 0',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  color: '#333',
  backgroundColor: '#f8f9fa',
  border: `1px solid ${alpha('#000', 0.1)}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(color, 0.1),
    color: color,
    borderColor: color,
    transform: 'translateX(4px)',
    '& svg': {
      color: color,
    },
  },
  '& svg': {
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
  },
}));

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    {
      text: 'POC',
      icon: 'fas fa-clipboard-list',
      color: '#0c83c8',
      routes: [
        { text: 'View POC', path: '/poc', icon: <Visibility />, type: 'View' },
        { text: 'Add POC', path: '/add_poc', icon: <Add />, type: 'Add' },
        { text: 'Update POC', path: '/update_poc', icon: <Edit />, type: 'Update' },
        { text: 'Test Allocation', path: '/test_allocate', icon: <Edit />, type: 'Allocate' },
      ],
    },
    {
      text: 'Organization',
      icon: 'fas fa-building',
      color: '#fc7a46',
      routes: [
        { text: 'View Organization', path: '/organization', icon: <Visibility />, type: 'View' },
        { text: 'Add Organization', path: '/add_organisation', icon: <Add />, type: 'Add' },
        { text: 'Update Organization', path: '/update_organization', icon: <Edit />, type: 'Update' },
      ],
    },
    {
      text: 'Module',
      icon: 'fas fa-book',
      color: '#0c83c8',
      routes: [
        { text: 'View Module', path: '/module', icon: <Visibility />, type: 'View' },
        { text: 'Add Module', path: '/add_module', icon: <Add />, type: 'Add' },
        { text: 'Update Module', path: '/update_module', icon: <Edit />, type: 'Update' },
      ],
    },
    {
      text: 'Test',
      icon: 'fas fa-question-circle',
      color: '#fc7a46',
      routes: [
        { text: 'View Test', path: '/test', icon: <Visibility />, type: 'View' },
        { text: 'Add Test', path: '/add_test', icon: <Add />, type: 'Add' },
        { text: 'Update Test', path: '/update_test', icon: <Edit />, type: 'Update' },
      ],
    },
    {
      text: 'User',
      icon: 'fas fa-user',
      color: '#0c83c8',
      routes: [
        { text: 'View User', path: '/user', icon: <Visibility />, type: 'View' },
        { text: 'Add User', path: '/add_user', icon: <Add />, type: 'Add' },
      ],
    },
    {
      text: 'Expert',
      icon: 'fas fa-users',
      color: '#fc7a46',
      routes: [
        { text: 'View Expert', path: '/expert', icon: <Visibility />, type: 'View' },
        { text: 'Add Expert', path: '/add_expert', icon: <Add />, type: 'Add' },
        { text: 'Update Expert', path: '/update_expert', icon: <Edit />, type: 'Update' },
      ],
    },
    {
      text: 'MCQ',
      icon: 'fas fa-question-circle',
      color: '#0c83c8',
      routes: [
        { text: 'View MCQ', path: '/mcq-admin', icon: <Visibility />, type: 'View' },
        { text: 'Add MCQ', path: '/add_mcq', icon: <Add />, type: 'Add' },
      ],
    },
    {
      text: 'Coding',
      icon: 'fas fa-code',
      color: '#fc7a46',
      routes: [
        { text: 'View Coding', path: '/codingpage', icon: <Visibility />, type: 'View' },
        { text: 'Add Coding', path: '/add_coding', icon: <Add />, type: 'Add' },
        { text: 'Update Coding', path: '/update_coding', icon: <Edit />, type: 'Update' },
      ],
    },
    {
      text: 'Testcase',
      icon: 'fas fa-bug',
      color: '#0c83c8',
      routes: [
        { text: 'View Testcase', path: '/testcasepage', icon: <Visibility />, type: 'View' },
        { text: 'Add Testcase', path: '/add_testcase', icon: <Add />, type: 'Add' },
      ],
    },
    {
      text: 'Report',
      icon: 'fas fa-folder-open',
      color: '#fc7a46',
      routes: [
        { text: 'Report Generation', path: '/reportAndPieGen', icon: <Visibility />, type: 'View' },
        { text: 'Create Master Report', path: '/reportGen', icon: <Add />, type: 'Add' },
      ],
    },
    {
      text: 'Certificate',
      icon: 'fas fa-award',
      color: '#0c83c8',
      routes: [
        { text: 'Certificate Generation', path: '/bulk_certificate', icon: <Add />, type: 'View' },
      ],
    },
  ];

  // Filter items based on search
  const filteredMenuItems = menuItems.filter(item => {
    return (
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.routes.some(route =>
        route.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <AdminDash />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />
      <StyledContainer maxWidth="xl">
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
          }}
        >
          Admin Dashboard
        </Typography>

        <SearchBarWrapper>
          <Search sx={{ ml: 2, color: '#666' }} />
          <StyledTextField
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: searchTerm && (
                <IconButton onClick={handleClearSearch} size="small">
                  <Clear />
                </IconButton>
              ),
            }}
          />
        </SearchBarWrapper>

        <Grid container spacing={3}>
          {filteredMenuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={`${item.text}-${index}`}>
              <DashboardCard>
                <CardHeader color={item.color}>
                  <i
                    className={item.icon}
                    style={{ fontSize: '1.5rem' }}
                  ></i>
                  <Typography variant="h6" fontWeight={600}>
                    {item.text}
                  </Typography>
                </CardHeader>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {item.routes.map((route) => (
                      <ActionButton
                        key={route.text}
                        fullWidth
                        onClick={() => handleNavigation(route.path)}
                        color={item.color}
                      >
                        {route.icon}
                        <span>{route.text}</span>
                      </ActionButton>
                    ))}
                  </Box>
                </CardContent>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>

        {filteredMenuItems.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No dashboard items match your search.
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={handleClearSearch}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          </Box>
        )}
      </StyledContainer>
    </>
  );
}