import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Fab,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllPocs, getModuleById, updatePoc } from '../axios';
import Admin_Dashboard from '../components/AdminDash';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, User, Mail, Phone, Calendar, Award, Users, FileText } from 'lucide-react';

// Custom CSS for global styles
const styles = {
  root: {
    padding: { xs: 2, sm: 4, md: 5 },
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    animation: 'fadeIn 0.5s ease-in',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    mb: 2,
  },
  title: {
    fontWeight: 800,
    color: '#0c83c8',
    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
    letterSpacing: '0.5px',
  },
  errorPaper: {
    p: 2,
    borderRadius: '16px',
    backgroundColor: '#ffebee',
    textAlign: 'center',
    border: '1px solid #ef5350',
  },
  dataGridPaper: {
    p: { xs: 1, sm: 2 },
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  fab: {
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: '#0c83c8',
    '&:hover': {
      backgroundColor: '#fc7a46',
      transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease',
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': { boxShadow: '0 0 0 0 rgba(12, 131, 200, 0.4)' },
      '70%': { boxShadow: '0 0 0 10px rgba(12, 131, 200, 0)' },
      '100%': { boxShadow: '0 0 0 0 rgba(12, 131, 200, 0)' },
    },
  },
  menu: {
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    padding: '12px 0',
    backgroundColor: '#ffffff',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 28px',
    gap: 1.5,
    '&:hover': {
      backgroundColor: '#fc7a46',
      color: '#ffffff',
      '& svg': { color: '#ffffff' },
    },
    transition: 'all 0.2s ease',
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      backgroundColor: '#ffffff',
    },
  },
  dialogTitle: {
    background: 'linear-gradient(45deg, #0c83c8 30%, #fc7a46 90%)',
    color: '#ffffff',
    fontWeight: 700,
    borderBottom: 'none',
    py: 2,
  },
  switch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: '#fc7a46',
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#0c83c8',
    },
    '& .MuiSwitch-switchBase': {
      transition: 'all 0.3s ease',
    },
  },
  chip: {
    borderColor: '#0c83c8',
    color: '#0c83c8',
    '&.MuiChip-colorSuccess': {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
    },
  },
};

const View_Poc = () => {
  const [pocs, setPocs] = useState([]);
  const [filteredPocs, setFilteredPocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLiveOnly, setShowLiveOnly] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChangePending, setStatusChangePending] = useState(null);
  const [selectedPocForStatus, setSelectedPocForStatus] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const today = new Date();

  useEffect(() => {
    const getPocs = async () => {
      try {
        const response = await fetchAllPocs();
        if (Array.isArray(response.data)) {
          const pocsWithModuleDetails = await Promise.all(
            response.data.map(async (poc) => {
              try {
                const module = await getModuleById(poc.mod_id);
                const [startDateStr, endDateStr] = module.mod_duration.split(' - ');
                const startDate = new Date(startDateStr.split('/').reverse().join('-'));
                const endDate = new Date(endDateStr.split('/').reverse().join('-'));
                const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const isLive =
                  todayDate.getTime() === startDateOnly.getTime() ||
                  todayDate.getTime() === endDateOnly.getTime() ||
                  (todayDate >= startDateOnly && todayDate <= endDateOnly);
                return {
                  ...poc,
                  module_name: module.mod_name,
                  module_duration: module.mod_duration,
                  status: isLive ? 'Live' : 'Not Live',
                };
              } catch (err) {
                console.error(`Error fetching module for POC ${poc.mod_poc_id}:`, err);
                return {
                  ...poc,
                  module_name: 'N/A',
                  module_duration: 'N/A',
                  status: 'Unknown',
                };
              }
            })
          );
          setPocs(pocsWithModuleDetails);
          setFilteredPocs(pocsWithModuleDetails.filter((poc) => poc.status === 'Live'));
        } else {
          setError('Invalid data format received from server');
          setPocs([]);
          setFilteredPocs([]);
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch POCs: ' + (error.message || 'Unknown error'));
        setPocs([]);
        setFilteredPocs([]);
        setLoading(false);
      }
    };
    getPocs();
  }, []);

  useEffect(() => {
    setFilteredPocs(showLiveOnly ? pocs.filter((poc) => poc.status === 'Live') : pocs);
  }, [showLiveOnly, pocs]);

  const handleFabClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFabMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddPoc = () => {
    navigate('/add_poc');
    handleFabMenuClose();
  };

  const handleUpdatePoc = () => {
    navigate('/update_poc');
    handleFabMenuClose();
  };

  const handleOpenStatusDialog = (poc, newStatus) => {
    if (!poc || !poc.mod_poc_id) {
      setError('Invalid POC selected for status update');
      return;
    }
    setSelectedPocForStatus(poc);
    setStatusChangePending(newStatus);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedPocForStatus(null);
    setStatusChangePending(null);
  };

  const handleToggleCertStatus = async () => {
    if (!selectedPocForStatus || !selectedPocForStatus.mod_poc_id) {
      setError('No valid POC selected for status update');
      handleCloseStatusDialog();
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = {
        mod_poc_id: selectedPocForStatus.mod_poc_id,
        poc_certificate: {
          cert_status: statusChangePending,
        },
      };
      await updatePoc(updateData);

      const responsePocs = await fetchAllPocs();
      if (Array.isArray(responsePocs.data)) {
        const pocsWithModuleDetails = await Promise.all(
          responsePocs.data.map(async (poc) => {
            try {
              const module = await getModuleById(poc.mod_id);
              const [startDateStr, endDateStr] = module.mod_duration.split(' - ');
              const startDate = new Date(startDateStr.split('/').reverse().join('-'));
              const endDate = new Date(endDateStr.split('/').reverse().join('-'));
              const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              const isLive =
                todayDate.getTime() === startDateOnly.getTime() ||
                todayDate.getTime() === endDateOnly.getTime() ||
                (todayDate >= startDateOnly && todayDate <= endDateOnly);
              return {
                ...poc,
                module_name: module.mod_name,
                module_duration: module.mod_duration,
                status: isLive ? 'Live' : 'Not Live',
              };
            } catch (err) {
              console.error(`Error fetching module for POC ${poc.mod_poc_id}:`, err);
              return {
                ...poc,
                module_name: 'N/A',
                module_duration: 'N/A',
                status: 'Unknown',
              };
            }
          })
        );
        setPocs(pocsWithModuleDetails);
        setFilteredPocs(showLiveOnly ? pocsWithModuleDetails.filter((poc) => poc.status === 'Live') : pocsWithModuleDetails);
        setError(null);
      } else {
        setError('Invalid data format received from server after update');
        setPocs([]);
        setFilteredPocs([]);
      }

      handleCloseStatusDialog();
    } catch (error) {
      setError(`Failed to update certificate status: ${error.response?.data?.error || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    {
      field: 'mod_poc_name',
      headerName: 'Name',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <User size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
            {params.value}
          </Typography>
        </Box>

      ),
    },
    {
      field: 'mod_poc_email',
      headerName: 'Email',
      width: 280,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Mail size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_poc_mobile',
      headerName: 'Mobile',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Phone size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: 'mod_poc_id',
    //   headerName: 'POC ID',
    //   width: 200,
    //   renderCell: (params) => (
    //     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
    //       <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
    //         {params.value}
    //       </Typography>
    //     </Box>
    //   ),
    // },
    {
      field: 'poc_certificate',
      headerName: 'Certificate Status',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.1 }}>
          <Chip
            icon={<Award size={18} color={params.value?.cert_status ? '#2e7d32' : '#0c83c8'} />}
            label={params.value?.cert_status ? 'Issued' : 'Not Issued'}
            color={params.value?.cert_status ? 'success' : 'default'}
            size="small"
            sx={{
              minWidth: 100, // ✅ force a consistent width
              justifyContent: 'flex-start',
              pr: 1,
              ...styles.chip,
            }}
          />
          <Switch
            checked={params.value?.cert_status || false}
            onChange={() => handleOpenStatusDialog(params.row, !params.value?.cert_status)}
            disabled={updateLoading}
            sx={{
              scale: '0.9',
              ...styles.switch,
            }}
            aria-label={`Toggle certificate status for ${params.row.mod_poc_name}`}
          />
        </Box>

      ),
    },
    {
      field: 'module_name',
      headerName: 'Module Name',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'module_duration',
      headerName: 'Module Duration',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Calendar size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: params.value === 'Live' ? '#2e7d32' : '#d32f2f',
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: params.value === 'Live' ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_users',
      headerName: 'No. of Students',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Users size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {Array.isArray(params.value) ? params.value.length : 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'mod_tests',
      headerName: 'No. of Tests',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <FileText size={20} color="#0c83c8" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {Array.isArray(params.value) ? params.value.length : 0}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Admin_Dashboard />
      <Box sx={styles.root}>
        <Box sx={styles.header}>
          <Typography variant="h4" sx={styles.title}>
            POC Management Dashboard
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showLiveOnly}
                onChange={(e) => setShowLiveOnly(e.target.checked)}
                sx={styles.switch}
                aria-label="Toggle live POCs filter"
              />
            }
            label={
              <Typography sx={{ fontWeight: 500, color: '#0c83c8' }}>
                Show Live POCs Only
              </Typography>
            }
          />
        </Box>
        {error && (
          <Paper sx={styles.errorPaper}>
            <Typography color="error" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {error}
            </Typography>
          </Paper>
        )}
        <Paper sx={styles.dataGridPaper}>
          <Box sx={{ height: { xs: 450, sm: 500, md: 650 }, width: '100%' }}>
            <DataGrid
              rows={filteredPocs}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              loading={loading}
              getRowId={(row) => row._id || row.mod_poc_id}
              sx={{
                // Header styling
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(45deg, #0c83c8 30%, #fc7a46 90%)',
                  color: '#0c83c8',
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderBottom: '2px solid #0c83c8',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 800,
                },

                // Row styles
                '& .MuiDataGrid-row': {
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#f8fafc',
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: '#ffffff',
                  },
                  '&:hover': {
                    // backgroundColor: '#fff3e0',
                    boxShadow: '0 0 8px rgba(250, 205, 187, 0.4)',
                    '& *': { color: '#fc7a46' },
                    '& svg': { color: '#fc7a46' },
                  },
                  transition: 'all 0.2s ease',
                },

                // Cell styles
                '& .MuiDataGrid-cell': {
                  padding: '12px',
                  fontSize: '0.9rem',
                  color: '#0c83c8',
                  borderBottom: '1px solid #e0e0e0',
                },

                // Footer
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e0e0e0',
                  color: '#0c83c8',
                  fontWeight: 600,
                },

                // Overlay (e.g. loading state)
                '& .MuiDataGrid-overlay': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                },

                // General styling
                border: 'none',
                borderRadius: '16px',
              }}
            />
          </Box>
        </Paper>

        <Fab
          aria-label="Add or edit POC"
          onClick={handleFabClick}
          sx={styles.fab}
        >
          <Plus size={28} color="#ffffff" />
        </Fab>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFabMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          PaperProps={{ sx: styles.menu }}
          transitionDuration={300}
        >
          <MenuItem onClick={handleAddPoc} sx={styles.menuItem}>
            <Plus size={22} color="#0c83c8" />
            <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 500 }}>
              Add POC
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleUpdatePoc} sx={styles.menuItem}>
            <Edit size={22} color="#0c83c8" />
            <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 500 }}>
              Update POC
            </Typography>
          </MenuItem>
        </Menu>
        <Dialog
          open={statusDialogOpen}
          onClose={handleCloseStatusDialog}
          maxWidth="sm"
          fullWidth
          sx={styles.dialog}
          TransitionProps={{ timeout: 400 }}
        >
          <DialogTitle sx={styles.dialogTitle}>
            Confirm Certificate Status Change
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            <DialogContentText sx={{ fontSize: '1.1rem', color: '#333', mb: 2 }}>
              {statusChangePending
                ? `Are you sure you want to activate certificate issuance for ${selectedPocForStatus?.mod_poc_name || 'this POC'}?`
                : `Are you sure you want to deactivate certificate issuance for ${selectedPocForStatus?.mod_poc_name || 'this POC'}?`}
            </DialogContentText>
            {selectedPocForStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0c83c8' }}>
                <User size={20} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  POC: {selectedPocForStatus.mod_poc_name || 'Unknown'} (ID: {selectedPocForStatus.mod_poc_id || 'N/A'})
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseStatusDialog}
              sx={{
                color: '#0c83c8',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#e8f0fe' },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleCertStatus}
              variant="contained"
              disabled={updateLoading}
              sx={{
                backgroundColor: '#0c83c8',
                '&:hover': { backgroundColor: '#fc7a46' },
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              {updateLoading && <CircularProgress size={20} sx={{ mr: 1, color: '#ffffff' }} />}
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default View_Poc;